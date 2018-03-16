/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
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

/**
 * To Run:
 * copy Reviews.csv to /data directory
 * cd tools
 * node csvtojson.js
 */

const csvFilePath='../data/Reviews.csv';
const csv=require('csvtojson');
const fs=require('fs');

// Filters
let everyNth = 10;  // Keep every Nth row
let rowLimit = 2000;  // Max number of rows to parse
let padding = '000';  // to Line up the numbers and slice(-4).
let fileLimit = 2000;  // Max number of files to write

let files = 0;
let lines = -1;

csv({
  headers:['Id','ProductId','UserId','ProfileName','HelpfulnessNumerator','HelpfulnessDenominator','Score','date','Summary','Text'],
  noheader:false,
  colParser:{
    'HelpfulnessNumerator':'number',
    'HelpfulnessDenominator':'number',
    'Score':'number',
    'date':function(item) {
      return new Date(Number(item) * 1000).toISOString().substring(0, 10);
    }
  },
  checkType:false
})
  .fromFile(csvFilePath)
  .preFileLine((fileLineString, lineIdx)=>{
    lines += 1;
    if (rowLimit > 0 && lineIdx - 1 > rowLimit) {
      return '';
    } 
    if (everyNth > 0 && ((lines % everyNth) > 0)) {
      return '';
    }
    return fileLineString;
  })
  .on('data',(jsonStr)=>{
    files += 1;
    if (files - 1  < fileLimit) {
      fs.writeFile('../data/food_reviews/review_' + (padding + files).slice(-4) + '.json', jsonStr, (err) => {
        if (err) throw err;
        // console.log('The file has been saved!');
      });
    }
  })
  .on('done',(error)=>{
    if (error) throw error;
    // console.log('end');
  });
