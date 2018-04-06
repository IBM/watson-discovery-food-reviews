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

import React from 'react';
import PropTypes from 'prop-types';
import Matches from '../Matches';
import { TagCloud } from 'react-tagcloud';
import { Grid, Dimmer, Loader, Header, Divider, List } from 'semantic-ui-react';
const utils = require('../../../lib/utils');

/**
 * This object serves as the panel containing all common query results.
 *
 * It provides a tag cloud of top keywords, a top 5 list of entities,
 * and a list or relevant reviews.
 */
export default class QueryResultsPanel extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      queryData: this.props.queryData,
      queryType: this.props.queryType
    };
  }

  /**
   * getEntities - return top 5 entities for placement in list.
   */
  getEntities() {
    const { queryData, queryType } = this.state;
    var entities = [];

    if (queryData[queryType] && queryData[queryType].data.matching_results) {
      const data = queryData[queryType].data.aggregations[utils.ENTITY_DATA_INDEX];
      // get top 5 entities
      var count = 0;
      data.results.forEach(function(item) {
        if (count < 5) {
          var entry = { 
            id: count, 
            text: item.key };
          entities.push(entry);
          count = count + 1;
        }
      });
    }

    return entities;
  }

  /**
   * getKeywords - return top 10 keywords to display in the tag cloud.
   */
  getKeywords() {
    const { queryData, queryType } = this.state;
    var keywords = [];

    if (queryData[queryType] && queryData[queryType].data.matching_results) {
      const data = queryData[queryType].data.aggregations[utils.KEYWORD_DATA_INDEX];
      // get top 10 keywords
      var count = 0;
      data.results.forEach(function(item) {
        if (count < 10) {
          var entry = { 
            count: count, 
            value: item.key };
          keywords.push(entry);
          count = count + 1;
        }
      });
    }

    return keywords;
  }

  /**
   * getReviews - return panel displaying review data.
   */
  getReviews() {
    const { queryData, queryType } = this.state;

    // get top reviews
    var reviews = utils.formatData(queryData[queryType].data);

    return (
      <Matches 
        matches={ reviews.results }
      />
    );
  }

  /**
   * render - return the panel object to render.
   */
  render() {
    const { queryData, queryType } = this.state;

    const tagCloudOptions = {
      luminosity: 'light',
      hue: 'blue'
    };

    return (
      <div className="query-results-panel">

        { queryData[queryType].loading ? (
          <div>
            <div className="loader--container" style={{height: 572}}>
              <Dimmer active inverted>
                <Loader>Loading</Loader>
              </Dimmer>
            </div>
          </div>

        ) : queryData[queryType].data ? (
          <div>
            <Grid className='query-data-results'>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Header as='h3' textAlign='center'>
                    Keyword Cloud
                  </Header>
                  <TagCloud 
                    tags={ this.getKeywords() }
                    minSize={16}
                    maxSize={64}
                    colorOptions={tagCloudOptions}
                  />
                </Grid.Column>
                <Grid.Column width={4} textAlign='left'>
                  <Header as='h3'>
                    Top Entities
                  </Header>
                  <List ordered>
                    { this.getEntities().map(item => 
                      <List.Item key={item.id}>
                        { item.text }
                      </List.Item>
                    ) 
                    }
                  </List>
                </Grid.Column>
              </Grid.Row>

              <Divider clearing/>

              <Grid.Row>
                <Grid.Column width={16} textAlign='center'>
                  <Header as='h3' textAlign='center'>
                    Relevant Customer Reviews
                  </Header>
                  <div>
                    {this.getReviews()}
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        ) : queryData[queryType].error ? (
          <div className="results">
            <div className="_container _container_large">
              <div className="row">
                {JSON.stringify(queryData[queryType].error)}
              </div>
            </div>
          </div>
        ) : (
          <Grid className='query-data-no-results'>
            <Grid.Row>
              <Grid.Column width={16}>
                <Header as='h3' textAlign='center'>
                  Select Category and Query
                </Header>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
      </div>
    );
  }
}

// type check to ensure we are called correctly
QueryResultsPanel.propTypes = {
  queryType: PropTypes.number,
  queryData: PropTypes.array
};
