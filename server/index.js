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

require('isomorphic-fetch');
const Promise = require('bluebird');
const queryString = require('query-string');
const queryBuilder = require('./query-builder');
const queryCustomBuilder = require('./query-builder-custom');
const WatsonDiscoverySetup = require('../lib/watson-discovery-setup');
const DiscoveryV2 = require('ibm-watson/discovery/v2');
const { CloudPakForDataAuthenticator } = require('ibm-watson/auth');
const { getAuthenticatorFromEnvironment } = require('ibm-watson/auth');

const utils = require('../lib/utils');

/**
 * Back end server which handles initializing the Watson Discovery
 * service, and setting up route methods to handle client requests.
 */
let auth = getAuthenticatorFromEnvironment('DISCOVERY');
console.log('Discovery auth:', JSON.stringify(auth, null, 2));


var project_id;
var collection_id;
const model_id = process.env.WKS_MODEL_ID;

const DEFAULT_NAME = 'food-reviews';
var discoveryDocs = [];
const fs = require('fs');
const path = require('path');
var arrayOfFiles = fs.readdirSync('./data/food_reviews/');
arrayOfFiles.forEach(function(file) {
  discoveryDocs.push(path.join('./data/food_reviews/', file));
});
// shorten the list if we are loading - trail version of IBM Cloud
// is limited to 256MB application size, so use this if you get
// out of memory errors.
//discoveryDocs = discoveryDocs.slice(0,100);

var version_date = '2019-03-25';
if (process.env.DISCOVERY_VERSION_DATE !== undefined) {
  // if defined, override with value from .env
  version_date = process.env.DISCOVERY_VERSION_DATE;
}

const discovery = new DiscoveryV2({
  version: '2020-07-07',
  authenticator: auth,
  serviceUrl: process.env.DISCOVERY_URL,
  disableSslVerification: true,
});

// make 'query' a promise function
discovery.query = Promise.promisify(discovery.query);

const discoverySetup = new WatsonDiscoverySetup(discovery);
const discoverySetupParams = {
  //default_name: DEFAULT_NAME,
  //config_name: 'food-review-config',   // instead of 'Default Configuration',
  //model_id: model_id,
  projectId: process.env.DISCOVERY_PROJECT_ID
};

const WatsonDiscoServer = new Promise((resolve) => {
  discoverySetup.setupDiscovery(discoverySetupParams, (err, data) => {
    if (err) {
      discoverySetup.handleSetupError(err);
    } else {
      console.log('Discovery is ready!');
      // now load data into discovery service collection
      var collectionParams = data;

      // set collection creds - at this point the collectionParams
      // will point to the actual credentials, whether the user
      // entered them in .env for an existing collection, or if
      // we had to create them from scratch.
      // environment_id = collectionParams.environment_id;
      // collection_id = collectionParams.collection_id;
      // console.log('environment_id: ' + environment_id);
      // console.log('collection_id: ' + collection_id);
      // console.log('model_id: ' + model_id);
      project_id = collectionParams.projectId;
      console.log('project_id: ' + project_id);
      queryBuilder.setProjectId(project_id);
      // queryBuilder.setCollectionId(collection_id);
      queryCustomBuilder.setProjectId(project_id);
      // queryCustomBuilder.setCollectionId(collection_id);

      collectionParams.documents = discoveryDocs;
      console.log('Begin loading ' + discoveryDocs.length +
        ' json files into discovery. Please be patient as this can take several minutes.');
      // discoverySetup.loadCollectionFiles(collectionParams);
      resolve(createServer());
    }
  });
});

/**
 * createServer - create express server and handle requests
 * from client.
 */
function createServer() {
  const server = require('./express');

  // handles custom queries
  server.get('/api/customQuery', (req, res) => {
    const { query, filters, queryType, count, sort } = req.query;

    console.log('In /api/customQuery: query = ' + query);

    // build params for the trending search request
    var params = {};
    if (queryType == 'natural_language_query') {
      params.natural_language_query = query;
    } else {
      params.query = query;
    }

    if (filters) {
      params.filter = filters;
    }

    if (count) {
      params.count = parseInt(count);
    }

    if (sort) {
      params.sort = sort;
    }

    var searchParams = queryCustomBuilder.search(params);
    discovery.query(searchParams)
      .then(response => res.json(response))
      .catch(error => {
        if (error.message === 'Number of free queries per month exceeded') {
          res.status(429).json(error);
        } else {
          res.status(error.code).json(error);
        }
      });
  });

  // handles search request from search bar
  server.get('/api/search', (req, res) => {
    const { query, filters, count, returnPassages, sort, queryType } = req.query;
    var params = {};

    console.log('In /api/search: query = ' + query);

    // add query and the type of query
    if (queryType == 'natural_language_query') {
      params.natural_language_query = query;
    } else {
      params.query = query;
    }

    // add any filters and a limit to the number of matches that can be found
    if (filters) {
      params.filter = filters;
    }

    params.count = count;

    // turn these off for now
    params.passages_count = count;
    if (returnPassages === 'true') {
      params.passages = true;
    } else {
      params.passages = false;
    }

    if (! sort) {
      params.sort = utils.utils.sortKeys[0].sortBy;
    } else {
      params.sort = sort;
    }

    var searchParams = queryBuilder.search(params);
    discovery.query(searchParams)
      .then(response => res.json(response))
      .catch(error => {
        if (error.message === 'Number of free queries per month exceeded') {
          res.status(429).json(error);
        } else {
          res.status(error.code).json(error);
        }
      });
  });

  // handles search string appened to url
  server.get('/:searchQuery', function(req, res){
    var searchQuery = req.params.searchQuery.replace(/\+/g, ' ');
    const qs = queryString.stringify({
      query: searchQuery,
      count: 1000,
      returnPassages: false,
      queryType: 'natural_language_query'
    });
    const fullUrl = req.protocol + '://' + req.get('host');

    console.log('In /:searchQuery: query = ' + qs);

    fetch(fullUrl + `/api/search?${qs}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {

        // get all the results data in right format
        var matches = utils.parseData(json);
        matches = utils.formatData(matches, []);
        var totals = utils.getTotals(matches);

        res.render('index',
          {
            data: matches,
            products: json,
            reviewers: json,
            entities: json,
            categories: json,
            concepts: json,
            keywords: json,
            entityTypes: json,
            searchQuery,
            numMatches: matches.results.length,
            numPositive: totals.numPositive,
            numNeutral: totals.numNeutral,
            numNegative: totals.numNegative,
            error: null
          }
        );
      })
      .catch(response => {
        res.status(response.status).render('index', {
          error: (response.status === 429) ? 'Number of free queries per month exceeded' : 'Error fetching data'
        });
      });
  });

  // initial start-up request
  server.get('/*', function(req, res) {
    // this is the inital query to the discovery service
    console.log('Initial Search Query at start-up');
    const params = queryBuilder.search({
      natural_language_query: '',
      count: 1000,
      sort: '-Score',
      // passages: false
    });
    return new Promise((resolve, reject) => {
      discovery.query(params)
        .then(results =>  {

          // get all the results data in right format
          var matches = utils.parseData(results);
          matches = utils.formatData(matches, []);
          var totals = utils.getTotals(matches);

          // console.log('++++++++++++ DISCO RESULTS ++++++++++++++++++++');
          // console.log(JSON.stringify(results, null, 2));

          // first time init of data needed for common and custom queries
          var commonQueryData = [];
          for (var i=0; i<utils.CQT_NUM_QUERIES; i++) {
            var obj = {
              data: null,
              loading: false,
              error: null,
              category: utils.NO_CATEGORY_SELECTED
            };
            commonQueryData.push(obj);
          }
          var customQueryData = {
            data: null,
            loading: false,
            error: null,
            query: '',
            product: 'ALL',
            reviewer: 'ALL',
            sentiment: 'ALL',
            placeHolder: 'Enter search string...'
          };

          const util = require('util');
          console.log('++++++++++++ DISCO 1 RESULTS ++++++++++++++++++++');
          console.log(util.inspect(results.result.aggregations, false, null));
          console.log('++++++++++++ ENTITIES ++++++++++++++++++++');
          console.log(util.inspect(results.result.aggregations[0], false, null));
          console.log('++++++++++++ CATEGORIES ++++++++++++++++++++');
          console.log(util.inspect(results.result.aggregations[3], false, null));
          console.log('++++++++++++ CONCEPTS ++++++++++++++++++++');
          console.log(util.inspect(results.result.aggregations[4], false, null));
          console.log('++++++++++++ KEYWORDS ++++++++++++++++++++');
          console.log(util.inspect(results.result.aggregations[5], false, null));
          console.log('++++++++++++ ENTITY TYPES ++++++++++++++++++++');
          console.log(util.inspect(results.result.aggregations[6], false, null));
          // console.log('numMatches: ' + matches.results.length);
          // console.log('totals: ' + JSON.stringify(totals, null, 2));
        
          res.render('index', {
            data: matches,
            products: results,
            reviewers: results,
            entities: results,
            categories: results,
            concepts: results,
            keywords: results,
            entityTypes: results,
            numMatches: matches.results.length,
            numPositive: totals.numPositive,
            numNeutral: totals.numNeutral,
            numNegative: totals.numNegative,
            commonQueryData: commonQueryData,
            customQueryData: customQueryData
          });

          resolve(results);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });

  });

  return server;
}

module.exports = WatsonDiscoServer;
