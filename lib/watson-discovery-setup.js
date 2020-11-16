/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

require('dotenv').config({
  silent: true
});

const fs = require('fs'); // file system for loading JSON

/**
 * Setup for Watson Discovery.
 *
 * @param {Object} params - Params needed to
 * @param {Object} callback - Discovery client
 * @constructor
 */
function WatsonDiscoverySetup(discoveryClient) {
  this.discoveryClient = discoveryClient;
}

/**
 * Get the assigned Discovery configuration for this collection.
 * @param {Object} params - Discovery params so far. Should include a configuration_id value.
 * @return {Promise} Promise with resolve({enhanced discovery params}) or reject(err).
 */
WatsonDiscoverySetup.prototype.getDiscoveryConfig = function(params) {
  return new Promise((resolve, reject) => {
    this.discoveryClient.getConfiguration(params, (err, data) => {
      if (err) {
        console.error(err);
        return reject(new Error('Failed to get default Discovery configuration.'));
      } else {
        // see if it is valid
        const configuration = data.result;
        console.log('Found existing configuration - name: ' + configuration.name);
        if (configuration.name === 'Default Configuration') {
          // if named 'default', we know we need to update
          params.configurationId = null;
          params.default_configuration = configuration;
        } else {
          // looks we have a non-default configuration set for this collection.
          // that means we already have set this up or there was a previous error we need to clean up.
          console.log('Found discovery config with name: ' + configuration.name);
          console.log('Need to verify it is setup correctly');
          if (configuration.enrichments && configuration.enrichments[0].options.features.entities.model) {
            // it has the WKS model enrichment, so use it
            console.log('Config is good');
          } else {
            // missing enrichments, so we need to update
            console.log('Config is bad and needs to be updated');
            params.configurationId = null;
            params.default_configuration = configuration;
          }
          return resolve(params);
        }
      }
    });
  });
};

/**
 * Get the default Discovery configuration for use as a template to create new one.
 * @param {Object} params - Discovery params so far. Enough to get configurations.
 * @return {Promise} Promise with resolve({enhanced discovery params}) or reject(err).
 */
WatsonDiscoverySetup.prototype.getDefaultDiscoveryConfig = function(params) {
  return new Promise((resolve, reject) => {
    // no need to continue if we already found our keyword extraction config
    if (params.configurationId) {
      return resolve(params);
    }

    // use default one as a base to update
    params.configurationId = params.default_config_id;
    this.discoveryClient.getConfiguration(params, (err, data) => {
      if (err) {
        console.error(err);
        return reject(new Error('Failed to get default Discovery configuration.'));
      } else {
        // unset configuration_id so we know that we still need to create one
        params.configurationId = null;
        // save off configuration so we can use it as a template for new one
        params.default_configuration = data;
        return resolve(params);
      }
    });
  });
};

/**
 * Update our Discovery configuration so that it does all the proper enrichments.
 * @param {Object} params - Discovery params so far.
 * @return {Promise} Promise with resolve({enhanced discovery params}) or reject(err).
 */
WatsonDiscoverySetup.prototype.updateDiscoveryConfig = function(params) {
  return new Promise((resolve, reject) => {
    // if config id is set, means we are good to go
    if (params.configurationId) {
      return resolve(params);
    }

    console.log('Updating collection config');
    params.name = params.config_name;
    params.configurationId = params.default_configuration.configuration_id;

    const new_enrichments = params.default_configuration.enrichments;
    new_enrichments[0].source_field = 'text';  // default is 'text'
    new_enrichments[0].options.features['keywords'] = {};
    new_enrichments[0].options.features['relations'] = {};

    // additional options for entity 'mentions', which will result in
    // more keywords that we can highlight in the UI
    new_enrichments[0].options.features.entities.mentions = true;
    new_enrichments[0].options.features.entities.mention_types = true;
    new_enrichments[0].options.features.entities.sentence_locations = true;

    // add WKS model ID
    if (params.model_id) {
      new_enrichments[0].options.features.entities.model = params.model_id;
      new_enrichments[0].options.features.relations.model = params.model_id;
    } else {
      console.error('No WKS Model ID specified.');
    }

    const updateParams = {
      environmentId: params.environmentId,
      configurationId: params.configurationId,
      name: params.default_configuration.name,
      conversions: params.default_configuration.conversions,
      normalizations: params.default_configuration.normalizations,
      enrichments: new_enrichments
    };

    // update the configuration
    this.discoveryClient.updateConfiguration(updateParams, (err, data) => {
      if (err) {
        console.error(err);
        return reject(new Error('Failed to update Discovery configuration.'));
      } else {
        // clear out temp fields so we are clean for additional disco calls
        console.log('Config update - new configuration: ');
        console.log(JSON.stringify(data, null, 2));
        return resolve(params);
      }
    });
  });
};

/**
 * Find the Discovery environment.
 * If a DISCOVERY_ENVIRONMENT_ID is set then validate it or error out.
 * Otherwise find it by name (DISCOVERY_ENVIRONMENT_NAME). The by name
 * search is used to find an environment that we created before a restart.
 * If we don't find an environment by ID or name, we'll use an existing one
 * if it is not read_only. This allows us to work in free trial environments.
 * @return {Promise} Promise with resolve({environment}) or reject(err).
 */
WatsonDiscoverySetup.prototype.findDiscoveryEnvironment = function(params) {
  return new Promise((resolve, reject) => {
    this.discoveryClient.listEnvironments(params, (err, data) => {
      if (err) {
        console.error(err);
        return reject(new Error('Failed to get Discovery environments.'));
      } else {
        const environments = data.result.environments;
        // If a DISCOVERY_ENVIRONMENT_ID is set, validate it and use it (or fail).
        const validateID = process.env.DISCOVERY_ENVIRONMENT_ID;
        // Otherwise, look (by name) for one that we already created.
        const DISCOVERY_ENVIRONMENT_NAME = process.env.DISCOVERY_ENVIRONMENT_NAME || params.default_name;
        // Otherwise we'll reuse an existing environment, if we find a usable one.
        let reuseEnv;

        for (let i = 0, size = environments.length; i < size; i++) {
          const environment = environments[i];
          if (validateID) {
            if (validateID === environment.environment_id) {
              console.log('Found Discovery environment using DISCOVERY_ENVIRONMENT_ID.');
              console.log(environment);
              params.environmentId = environment.environment_id;
              return resolve(params);
            }
          } else {
            if (environment.name === DISCOVERY_ENVIRONMENT_NAME) {
              console.log('Found Discovery environment by name.');
              console.log(environment);
              params.environmentId = environment.environment_id;
              return resolve(params);
            } else if (!environment.read_only) {
              reuseEnv = environment;
            }
          }
        }
        if (validateID) {
          return reject(new Error('Configured DISCOVERY_ENVIRONMENT_ID=' + validateID + ' not found.'));
        } else if (reuseEnv) {
          console.log('Found existing Discovery environment to use: ', reuseEnv);
          params.environmentId = reuseEnv.environment_id;
          return resolve(params);
        }
        // Not found by ID or name or reuse stategy.
        // Set the expected name, so when one is created we will find it.
        params.environment_name = DISCOVERY_ENVIRONMENT_NAME;
        return resolve(params);
      }
    });
  });
};

/**
 * Find the Discovery collection.
 * If a DISCOVERY_COLLECTION_ID is set then validate it or error out.
 * Otherwise find it by name (DISCOVERY_COLLECTION_NAME). The by name
 * search is used to find collections that we created before a restart.
 * @param {Object} params - Object discribing the existing environment.
 * @return {Promise} Promise with resolve({discovery params}) or reject(err).
 */
WatsonDiscoverySetup.prototype.findDiscoveryCollection = function(params) {
  console.log('findDiscoveryCollection');
  return new Promise((resolve, reject) => {
    this.discoveryClient.listCollections(params, (err, data) => {
      if (err) {
        console.error(err);
        return reject(new Error('Failed to get Discovery collections.'));
      } else {
        // If a DISCOVERY_COLLECTION_ID is set, validate it and use it (or fail).
        // Otherwise, look (by name) for one that we already created.
        const validateID = process.env.DISCOVERY_COLLECTION_ID;
        const DISCOVERY_COLLECTION_NAME = process.env.DISCOVERY_COLLECTION_NAME || params.default_name;
        const collections = data.result.collections;
        for (let i = 0, size = collections.length; i < size; i++) {
          const collection = collections[i];
          if (validateID) {
            if (validateID === collection.collection_id) {
              console.log('Found Discovery collection using DISCOVERY_COLLECTION_ID.');
              console.log(collection);
              params.collection_name = collection.name;
              params.collectionId = collection.collection_id;
              params.configurationId = collection.configuration_id;
              return resolve(params);
            }
          } else if (collection.name === DISCOVERY_COLLECTION_NAME) {
            console.log('Found Discovery collection by name.');
            console.log(collection);
            params.collection_name = collection.name;
            params.collectionId = collection.collection_id;
            params.configurationId = collection.configuration_id;
            return resolve(params);
          }
        }

        return reject(new Error('Configured DISCOVERY_COLLECTION_ID=' + validateID + ' not found.'));
      }
    });
  });
};

/** Create a Discovery environment if we did not find one.
 * If an environment is passed in, then we already have one.
 * When we create one, we have to create it with our known name
 * so that we can find it later.
 * @param {Object} params - Object describing the environment we found or need.
 * @return {Promise} Promise with resolve(environment) or reject(err).
 */
WatsonDiscoverySetup.prototype.createDiscoveryEnvironment = function(params) {
  console.log('createDiscoveryEnvironment - ' + params.environmentId);
  if (params.environmentId) {
    return Promise.resolve(params); // If we have an ID, then the env must exist.
  }
  return new Promise((resolve, reject) => {
    // No existing environment found, so create it.
    // NOTE: The number of environments that can be created
    // under a trial Bluemix account is limited to one per
    // organization. That is why have the "reuse" strategy above.
    console.log('Creating discovery environment...');
    const createParams = {
      name: params.environment_name,
      description: 'Discovery environment created by ' + params.default_name,
      size: 'LT' // Use string to avoid default of 1.
    };
    this.discoveryClient.createEnvironment(createParams, (err, data) => {
      if (err) {
        console.error('Failed to create Discovery environment.');
        return reject(err);
      } else {
        console.log(data);
        params.environmentId = data.environment_id;
        resolve(params);
      }
    });
  });
};

/**
 * Load the Discovery collection if it is not already loaded.
 * The collection should already be created/validated.
 * Currently using lazy loading of docs and only logging problems.
 * @param {Object} params - All the params needed to use Discovery.
 * @return {Promise}
 */
WatsonDiscoverySetup.prototype.loadDiscoveryCollection = function(params) {
  return new Promise((resolve, reject) => {
    console.log('Get collection to check its status.');
    this.discoveryClient.getCollection(params, (err, data) => {
      if (err) {
        console.error(err);
        return reject(err);
      } else {
        console.log('Checking status of Discovery collection:', data.result.document_counts);
        const numDocsLoaded = data.result.document_counts.available + data.result.document_counts.processing + data.result.document_counts.failed;

        if (typeof params.checkedForExistingDocs === 'undefined') {
          // first time through settings
          params.checkedForExistingDocs = false;
          params.docsAlreadyLoaded = false;
          params.numDocs = params.documents.length;
          params.docChunkSize = 5;  // number of docs to process at one time
          params.docCurrentIdx = 0;
        }

        if ((! params.checkedForExistingDocs) && (numDocsLoaded > 0)) {
          params.docsAlreadyLoaded = true;
          params.checkedForExistingDocs = true;
          console.log('Collection is already loaded with docs.');
          resolve(params);
        } else {
          // process the current chunk of documents
          const endIdx = Math.min(params.docCurrentIdx + params.docChunkSize, params.numDocs);
          const docs = params.documents.slice(params.docCurrentIdx, endIdx);
          const docCount = docs.length;
          params.checkedForExistingDocs = true;
          console.log('Next load of docs = [' + params.docCurrentIdx + ':' + endIdx + ']');

          // the following tells us when we are done with this chunk
          var totalDocsToProcess = params.docCurrentIdx + docCount;

          console.log('Loading documents into Discovery collection.');
          for (let i = 0; i < docCount; i++) {
            console.log('docCount: ' + docCount);
            const doc = docs[i];
            console.log('doc: ' + doc);
            var file = fs.readFileSync(doc);
            //var jsonFile = JSON.parse(file);

            this.discoveryClient.addDocument({
              environmentId: params.environmentId,
              collectionId: params.collectionId,
              file: file,
              filename: doc }, (err, data) => {
              if (err) {
                // we got an error on this one doc, but keep loading the rest
                console.log('Add document error:');
                console.error(err);

                if (err.code === 400 && err.message.includes('count limit')) {
                  console.log('Collection limit has been reached. No more docs will be loaded.');
                  params.docsAlreadyLoaded = true;
                }
              } else {
                console.log('[' + params.docCurrentIdx + '] Added document: ' + data.result.document_id);
              }
              params.docCurrentIdx += 1;
              if (params.docCurrentIdx === totalDocsToProcess) {
                this.discoveryClient.getCollection(params, (err, data) => {
                  if (err) {
                    console.error(err);
                    return reject(err);
                  } else {
                    console.log('Checking status of Discovery collection:', data.result.document_counts);
                    resolve(params);
                  }
                });
              }
            });
          }
        }
      }
    });
  });
};

/**
 * Validate and setup the Discovery service.
 */
WatsonDiscoverySetup.prototype.setupDiscovery = function(setupParams, callback) {
  this.findDiscoveryEnvironment(setupParams)
    .then(params => this.createDiscoveryEnvironment(params))
    .then(environment => this.findDiscoveryCollection(environment))
    .then(params => this.getDiscoveryConfig(params))
    .then(params => this.updateDiscoveryConfig(params))
    .then(params => callback(null, params))
    .catch(callback);
};

/**
 * Add chunk of files to Discovery collection.
 */
WatsonDiscoverySetup.prototype.loadDiscoveryData = function (collectionParams, callback) {
  this.loadDiscoveryCollection(collectionParams)
    .then(params => callback(null, params))
    .catch(callback);
};

/**
 * Manage the flow of files being added to the Discovery collection.
 */
WatsonDiscoverySetup.prototype.loadCollectionFiles = function (params) {
  return new Promise((resolve, reject) => {
    this.loadDiscoveryData(params, (err, data) => {
      if (err) {
        this.handleSetupError(err);
        console.log(err);
        return reject(err);
      } else {
        var collectionParams = data;
        if ((! collectionParams.docsAlreadyLoaded) && (collectionParams.docCurrentIdx < collectionParams.numDocs)) {
          this.loadCollectionFiles(collectionParams);
        } else {
          console.log('Discovery collection loading has completed!');
          resolve(params);
        }
      }
    });
  });
};

/**
 * Handle setup errors by logging and exiting.
 * @param {String} reason - The error message for the setup error.
 */
WatsonDiscoverySetup.prototype.handleSetupError = function (reason) {
  console.error('The app failed to initialize properly. Setup and restart needed. ' + reason);
  // Abort on a setup error allowing IBM Cloud to restart it.
  console.error('\nAborting due to setup error!');
  process.exit(1);
};

module.exports = WatsonDiscoverySetup;
