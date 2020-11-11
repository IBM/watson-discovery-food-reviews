const DiscoveryV1 = require('ibm-watson/discovery/v1');
const DiscoveryV2 = require('ibm-watson/discovery/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const { CloudPakForDataAuthenticator } = require('ibm-watson/auth');

const discovery1 = new DiscoveryV1({
  version: '2019-03-25',
  authenticator: new IamAuthenticator({
    apikey: 'c8Quc1Wdao5kB-0RUySsIGBMSx2xXUzOSIM5V1oT0I4T',
  }),
  serviceUrl: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/321a84c1-a218-4af3-bcb7-67d4260e2b4f',
});

const discovery2 = new DiscoveryV2({
  version: '2020-07-07',
  authenticator: new CloudPakForDataAuthenticator({
    username: 'admin',
    password: 'password',
    url: 'https://zen-cpd-zen.jrtorres-cpd-wd-dal10-b-2bef1f4b4097001da9502000c44fc2b2-0000.us-south.containers.appdomain.cloud'
  }),
  serviceUrl: 'https://zen-cpd-zen.jrtorres-cpd-wd-dal10-b-2bef1f4b4097001da9502000c44fc2b2-0000.us-south.containers.appdomain.cloud/discovery/core/instances/1599081701293/api',
  disableSslVerification: true,
});

const queryParams1 = {
  environmentId: 'e49807ee-c3a9-41a0-bd7f-c7ad5d6122c2',
  collectionId: '371ae2bc-be8a-4286-b78e-b18837f7f3ae',
  aggregation: 'term(enriched_text.entities.text).term(enriched_text.sentiment.document.label)'
};

let xx = {
  enabled: false
};

const queryParams2 = {
  projectId: 'e1152779-575a-4085-a93f-fc3a088dcf9c',
  collectionIds: ['dc70a4b9-929c-8776-0000-017478a27101'],
  QueryLargePassages: xx,
  aggregation: 'term(enriched_text.entities.text).term(enriched_text.sentiment.document.label)'
};

discovery1.query(queryParams1)
  .then(queryResponse => {
    console.log('+++++++++++++++ V1 RESULTS ++++++++++++++++++++');
    console.log(JSON.stringify(queryResponse.result.aggregations[0], null, 2));

    discovery2.query(queryParams2)
      .then(queryResponse => {
        console.log('+++++++++++++++ V2 RESULTS ++++++++++++++++++++');
        console.log(JSON.stringify(queryResponse.result.aggregations[0], null, 2));
      })
      .catch(err => {
        console.log('error:', err);
      });
  })
  .catch(err => {
    console.log('error:', err);
  });
