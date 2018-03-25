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

import queryBuilder from '../server/query-builder';

beforeEach(() => {
  queryBuilder.setCollectionId('collection');
  queryBuilder.setEnvironmentId('environment');
});

describe('Query builder returns params for discovery service', () => {
  test('when opts are NOT passed', () => {
    expect(queryBuilder.search()).toEqual({
      environment_id: 'environment',
      collection_id: 'collection',
      highlight: true,
      aggregation: '[term(enriched_text.entities.text).term(enriched_text.sentiment.document.label),' +
      'term(enriched_text.categories.label).term(enriched_text.sentiment.document.label),' +
      'term(enriched_text.concepts.text).term(enriched_text.sentiment.document.label),' +
      'term(enriched_text.keywords.text).term(enriched_text.sentiment.document.label),' +
      'term(enriched_text.entities.type).term(enriched_text.sentiment.document.label),' +
      'term(ProductId,count:100).average(Score),term(UserId,count:100)]'
    });
  });

  test('when opts are passed', () => {
    expect(queryBuilder.search({
      filter: 'enriched_text.categories.label::"test"',
      count: 500,
      natural_language_query: 'test',
      sort: 'enriched_text.sentiment.document.score'
    })).toEqual({
      environment_id: 'environment',
      collection_id: 'collection',
      highlight: true,
      aggregation: 
        '[term(enriched_text.entities.text).term(enriched_text.sentiment.document.label),' +
        'term(enriched_text.categories.label).term(enriched_text.sentiment.document.label),' +
        'term(enriched_text.concepts.text).term(enriched_text.sentiment.document.label),' +
        'term(enriched_text.keywords.text).term(enriched_text.sentiment.document.label),' +
        'term(enriched_text.entities.type).term(enriched_text.sentiment.document.label),' +
        'term(ProductId,count:100).average(Score),term(UserId,count:100)]',
      natural_language_query: 'test',
      filter: 'enriched_text.categories.label::"test"',
      count: 500,
      sort: 'enriched_text.sentiment.document.score'
    });
  });
});
