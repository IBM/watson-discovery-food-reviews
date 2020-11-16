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

// Variables and functions needed by both server and client code

// needed to find tags in results text
const parse5 = require('parse5');

// how many items will we show per page
const ITEMS_PER_PAGE = 10;

// the index of the filter item in the aggregation data returned
// from the discovery query
const ENTITY_DATA_INDEX      = 0;
const CATEGORY_DATA_INDEX    = 1;
const CONCEPT_DATA_INDEX     = 2;
const KEYWORD_DATA_INDEX     = 3;
const ENTITY_TYPE_DATA_INDEX = 4;
const REVIEWER_DATA_INDEX    = 5;
const PRODUCT_NAME_INDEX     = 6;

// keys/values for menu items
const ENTITY_FILTER      = 'EN';
const CATEGORY_FILTER    = 'CA';
const CONCEPT_FILTER     = 'CO';
const KEYWORD_FILTER     = 'KW';
const ENTITY_TYPE_FILTER = 'ET';
const SENTIMENT_FILTER   = 'SE';
const PRODUCT_FILTER     = 'PR';
const REVIEWER_FILTER    = 'RV';

// Common query types that user can run
const CQT_HIGH_SCORE               = 0;
const CQT_HIGH_SENTIMENT           = 1;
const CQT_HIGH_SCORE_LOW_SENTIMENT = 2;
const CQT_LOW_SCORE_HIGH_SENTIMENT = 3;
const CQT_LOW_SCORE_LOW_SENTIMENT  = 4;
const CQT_NUM_QUERIES              = 5;

const ALL_TERM_ITEM = 'All Terms';   // used to indicate no specific item is selected
const NO_TERM_ITEM = 'Select Term';  // used to indicate no specific item is selected
const NO_PRODUCT_ITEM = 'Select Product';       // used to indicate no specific product is selected
const NO_CATEGORY_SELECTED = 'Select Category'; // used to indicate no specific category is selected

// filter types and strings to use
const filterTypes = [
  { key: ENTITY_FILTER,       value: ENTITY_FILTER,      text: 'Entities'},
  { key: CATEGORY_FILTER,     value: CATEGORY_FILTER,    text: 'Categories'},
  { key: CONCEPT_FILTER,      value: CONCEPT_FILTER,     text: 'Concepts'},
  { key: KEYWORD_FILTER,      value: KEYWORD_FILTER,     text: 'Keywords'},
  { key: ENTITY_TYPE_FILTER,  value: ENTITY_TYPE_FILTER, text: 'Entity Types'} ];
  
// sortBy is used as param to Discovery Service
// sortByInt is used to sort internally based on formatted data
const sortKeys = [
  { type: 'HIGHEST_SCORE', 
    sortBy: '-Score',
    text: 'Highest Rated' },
  { type: 'LOWEST_SCORE', 
    sortBy: 'Score',
    text:  'Lowest Rated' },
  { type: 'NEWEST', 
    sortBy: '-date',
    text: 'Newest First' },
  { type: 'OLDEST', 
    sortBy: 'date',
    text: 'Oldest First' },
  { type: 'HIGHEST_SENTIMENT', 
    sortBy: '-sentimentScore',
    text: 'Highest Sentiment' },
  { type: 'LOWEST_SENTIMENT', 
    sortBy: 'sentimentScore',
    text: 'Lowest Sentiment' },
  { type: 'MOST_HELPFUL', 
    sortBy: '-helpRating',
    text: 'Most Helpful' },
  { type: 'LEAST_HELPFUL', 
    sortBy: 'helpRating',
    text: 'Least Helpful' }
];

const sentimentFilterTypes = [
  { key: 'Positive', matching_results: 0 },
  { key: 'Negative', matching_results: 0 }
];

// sort types and strings to use for drop-down
const sortTypes = [];
sortKeys.forEach(function(item) {
  sortTypes.push({key: item.type, value: item.sortBy, text: item.text});
});  

/**
 * objectWithoutProperties - clear out unneeded properties from object.
 * object: object to scan
 * properties: items in object to remove
 */
const objectWithoutProperties = (object, properties) => {
  'use strict';

  var obj = {};
  var keys = Object.keys(object);
  keys.forEach(key => {
    if (properties.indexOf(key) < 0) {
      // keep this since it is not found in list of unneeded properties
      obj[key] = object[key];
    }
  });

  return obj;
};
  
/**
 * parseData - convert raw search results into collection of matching results.
 */
const parseData = data => ({
  rawResponse: Object.assign({}, data),
  // sentiment: data.aggregations[0].results.reduce((accumulator, result) =>
  //   Object.assign(accumulator, { [result.key]: result.matching_results }), {}),
  results: data.result.results
});

/**
 * formatData - format search results into items we can process easier. This includes
 * 1) only keeping fields we show in the UI
 * 2) highlight matching words in text
 */
function formatData(rawData, filterString) {
  var formattedData = {};
  var newResults = [];

  let data = rawData.rawResponse.result;

  data.results.forEach(function(dataItem) {

    let sentimentScore = 0;
    let sentimentLabel = 'n/a';

    // console.log(dataItem);
    if (dataItem.hasOwnProperty('enriched_text')) {

      // DEBUG: uncomment following lines to see detailed results from disco
      // const util = require('util');
      // console.log(util.inspect(dataItem, false, null));

      if (dataItem.enriched_text.sentiment) {
        if (dataItem.enriched_text.sentiment['score']) {
          sentimentScore = dataItem.enriched_text.sentiment.score;
        }
        if (dataItem.enriched_text.sentiment['label']) {
          sentimentLabel = dataItem.enriched_text.sentiment.label;
        }
        if (dataItem.enriched_text.sentiment.document['score']) {
          sentimentScore = dataItem.enriched_text.sentiment.document.score;
        }
        if (dataItem.enriched_text.sentiment.document['label']) {
          sentimentLabel = dataItem.enriched_text.sentiment.document.label;
        }
      }
    }

    // only keep the data we show in the UI
    var newResult = {
      id: dataItem.id,
      title: dataItem.Summary,
      text: dataItem.text,
      date: dataItem.date,
      score: dataItem.Score,  // Using the review Score because metadata result is always 1
      helpRating: getHelpRating(dataItem),
      sentimentScore: sentimentScore,
      sentimentLabel: sentimentLabel,
      highlight: {
        showHighlight: false,
        field: '',                // title or text
        indexes: new Array()      // hold all start and end indexes of highlight text
      }
    };

    var addResult = true;

    // check if we have any 'highlights' returned by discovery
    if (dataItem.highlight && dataItem.highlight.text) {
      // start by getting highlight word(s) by parsing HTML.
      // keyword will be within <em> tag.
      const fragment = parse5.parseFragment('<!DOCTYPE html><html>' + 
        dataItem.highlight.text + 
        '</html>');

      // for each '<em></em> found, highlight the containing text
      var startFromIdx = 0;
      fragment.childNodes.forEach(function(item) {
        if (item.nodeName === 'em') {
          var highlightStr = item.childNodes[0].value;
          var startIdx = dataItem.text.indexOf(highlightStr, startFromIdx);
          if (startIdx >= 0) {
            newResult.highlight.showHighlight = true;
            newResult.highlight.field = 'text';
            var endIdx = startIdx + highlightStr.length;
            newResult.highlight.indexes.push({
              startIdx: startIdx,
              endIdx: endIdx
            });
            startFromIdx = endIdx;
          } else {
            startFromIdx = startFromIdx + 1;
          }
        }
      });
    }

    // check if we have any entity 'mentions' returned by discovery.
    // if so, only include them if they match one of the selected
    // filter strings.
    if (typeof filterString !== 'undefined' && filterString.length > 1) {
      // we only care if we have some filter values
      dataItem.enriched_text.entities.forEach(function(entity) {
        if (typeof entity.mentions !== 'undefined' && entity.mentions.length > 0) {
          entity.mentions.forEach(function(mention) {
            // get the text that will be highlighted and put it in the
            // same format as the filters passed in the query
            // string sent to discovery
            var highlightText = 'enriched_text.entities.text::"' +
              dataItem.text.substr(mention.location[0], mention.location[1] - mention.location[0]) + '"';

            // only highlight if it matches one of our filter values
            if (filterString.indexOf(highlightText) >= 0) {
              newResult.highlight.showHighlight = true;
              newResult.highlight.field = 'text';
              var insertIdx = getArrayIndex(newResult.highlight.indexes,
                mention.location[0]);
              if (insertIdx >= 0) {
                newResult.highlight.indexes.splice(
                  insertIdx, 0, { startIdx: mention.location[0], endIdx: mention.location[1] });
              }
            }
          });
        }
      });
    }

    if (addResult) {
      newResults.push(newResult);
    }
  });

  formattedData.results = newResults;
  // console.log('Formatting Data: size = ' + newResults.length);
  return formattedData;
}

/**
 * getArrayIndex - determine where to add the new index pair into the index array.
 * Index pairs must be in numeric order, from low to high.
 */
function getArrayIndex(indexArray, startIdx) {
  // add in correct order, and no duplicates
  var insertIdx = 0;
  for (var i=0; i<indexArray.length; i++) {
    if (startIdx == indexArray[i].startIdx) {
      // found duplicate
      return - 1;
    } else if (startIdx < indexArray[i].startIdx) {
      // found our index
      return i;
    }
    // insert at end
    insertIdx = insertIdx + 1;
  }
  return insertIdx;
}

/**
 * getTotals - add up sentiment types from all result items.
 */
function getTotals(data) {
  var totals = {
    numPositive: 0,
    numNegative: 0,
    numNeutral: 0
  };

  data.results.forEach(function (result) {
    if (result.sentimentLabel === 'positive') {
      totals.numPositive = totals.numPositive + 1;
    } else if (result.sentimentLabel === 'negative') {
      totals.numNegative = totals.numNegative + 1;
    } else if (result.sentimentLabel === 'neutral') {
      totals.numNeutral = totals.numNeutral + 1;
    }
  });

  // console.log('numMatches: ' + data.matching_results);
  // console.log('numPositive: ' + totals.numPositive);
  // console.log('numNegative: ' + totals.numNegative);
  // console.log('numNeutral: ' + totals.numNeutral);

  return totals;
}

/**
 * getHelpRating - calculate help rating for this review, which is
 * (number of up votes) / (total number of votes received).
 */
function getHelpRating(dataItem) {
  if (dataItem.HelpfulnessNumerator == 0 || dataItem.HelpfulnessDenominator == 0) {
    return 0;
  } else {
    var pct = dataItem.HelpfulnessNumerator / dataItem.HelpfulnessDenominator;
    return (Math.round(pct * 100) / 100) * 100;
  }
}

/**
 * getCommonQueryString - for each of the common query types, return the
 * params used in the discovery search query.
 */
function getCommonQueryString(type, category) {
  switch (type) {
  case CQT_HIGH_SCORE:
    return ({
      query: 'Score>=4.0,enriched_text.categories.label:"' + category + '"',
      count: 10,
      sort: '-Score'
    });
  case CQT_HIGH_SENTIMENT:
    return ({
      query: 'enriched_text.sentiment.document.score>=0.70,enriched_text.categories.label:"' + category + '"',
      count: 10,
      sort: '-enriched_text.sentiment.document.score'
    });
  case CQT_HIGH_SCORE_LOW_SENTIMENT:
    return ({
      query: 'Score>=4.0,enriched_text.sentiment.document.label::"negative",enriched_text.categories.label:"' + category + '"',
      count: 10,
      sort: 'enriched_text.sentiment.document.score'
    });
  case CQT_LOW_SCORE_HIGH_SENTIMENT:
    return ({
      query: 'Score<=3.0,enriched_text.sentiment.document.label::"positive",enriched_text.categories.label:"' + category + '"',
      count: 10,
      sort: '-enriched_text.sentiment.document.score'
    });
  case CQT_LOW_SCORE_LOW_SENTIMENT:
    return ({
      query: 'enriched_text.sentiment.document.score>=-0.75,HelpfulnessNumerator>=4.0,enriched_text.categories.label:"' + category + '"',
      count: 10,
      sort: 'enriched_text.sentiment.document.score'
    });
  }
}

module.exports = {
  objectWithoutProperties,
  parseData,
  formatData,
  getTotals,
  ITEMS_PER_PAGE,
  ENTITY_DATA_INDEX,
  CATEGORY_DATA_INDEX,
  CONCEPT_DATA_INDEX,
  KEYWORD_DATA_INDEX,
  ENTITY_TYPE_DATA_INDEX,
  REVIEWER_DATA_INDEX,
  PRODUCT_NAME_INDEX,
  ENTITY_FILTER,
  CATEGORY_FILTER,
  CONCEPT_FILTER,
  KEYWORD_FILTER,
  ENTITY_TYPE_FILTER,
  SENTIMENT_FILTER,
  PRODUCT_FILTER,
  REVIEWER_FILTER,
  CQT_HIGH_SCORE,
  CQT_HIGH_SENTIMENT,
  CQT_HIGH_SCORE_LOW_SENTIMENT,
  CQT_LOW_SCORE_HIGH_SENTIMENT,
  CQT_LOW_SCORE_LOW_SENTIMENT,
  CQT_NUM_QUERIES,
  ALL_TERM_ITEM,
  NO_TERM_ITEM,
  NO_PRODUCT_ITEM,
  NO_CATEGORY_SELECTED,
  sentimentFilterTypes,
  sortKeys,
  filterTypes,
  sortTypes,
  getCommonQueryString
};
