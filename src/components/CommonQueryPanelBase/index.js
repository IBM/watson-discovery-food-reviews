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
import { Grid, Menu, Dimmer, Loader, Dropdown, Header, Divider, List } from 'semantic-ui-react';
const utils = require('../../../lib/utils');

/**
 * This object renders a trending chart object that appears at the bottom
 * of the web page. It is composed of multiple objects, the chart,
 * and 2 drop-down menus where the user can select what filter (entities,
 * categories, or concepts) and/or what filter value (referred to as 'term') 
 * to represent. 
 * NOTE: the filter value of 'Term' indicates all values.
 * NOTE: what the user selects to represent in the graph has no effect
 *       on any other objects on the page. It has it's own search
 *       query.
 */
export default class CommonQueryPanelBase extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      queryData: this.props.queryData,
      queryType: this.props.queryType,
      categories: this.props.categories 
    };
  }

  /**
   * categoryChange - user has selected a new category.
   */
  categoryChange(event, selection) {
    var { queryType, queryData } = this.state;

    console.log('queryType: ' + queryType);

    queryData[queryType].category = utils.NO_CATEGORY_SELECTED;
    queryData[queryType].data = null;

    this.setState({
      queryData: queryData
    });

    this.props.onGetCommonQueryRequest({
      category: selection.value,
      queryType: queryType
    });
  }

  /**
   * getChartData - based on what group filter user has selected, accumulate 
   * all of the data needed to render the trending chart.
   */
  getEntities() {
    const { queryData, queryType } = this.state;
    var entities = [];

    if (queryData[queryType] && queryData[queryType].data.matching_results) {
      // get top 5 entities
      for (var i=0; i<5; i++) {
        if (queryData[queryType].data.aggregations[utils.ENTITY_DATA_INDEX].results[i].key) {
          var entry = { 
            id: i, 
            text: queryData[queryType].data.aggregations[utils.ENTITY_DATA_INDEX].results[i].key };
          entities.push(entry);
        }      
      }
    }

    return entities;
  }

  getKeywords() {
    const { queryData, queryType } = this.state;
    var keywords = [];

    if (queryData[queryType] && queryData[queryType].data.matching_results) {
      // get top 10 keywords
      for (var i=0; i<10; i++) {
        if (queryData[queryType].data.aggregations[utils.KEYWORD_DATA_INDEX].results[i].key) {
          var entry = { 
            count: i, 
            value: queryData[queryType].data.aggregations[utils.ENTITY_DATA_INDEX].results[i].key };
          keywords.push(entry);
        }      
      }
    }

    return keywords;
  }

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
   * getCategoryOptions - get the term items available to be selected by the user.
   */
  getCategoryOptions() {
    const { categories } = this.state;
    var options = [{ key: -1, value: utils.NO_CATEGORY_SELECTED, text: utils.NO_CATEGORY_SELECTED }];

    if (categories.results) {
      categories.results.map(item =>
        options.push({key: item.key, value: item.key, text: item.key})
      );
    }

    return options;
  }
  
  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occured which has changed the list of 
  // items we are graphing, OR the graph data has arrived.
  // componentWillReceiveProps(nextProps) {
  //   this.setState({ queryResultsData: nextProps.queryResultsData });
  //   this.setState({ queryResultsLoading: nextProps.queryResultsLoading });
  //   this.setState({ queryResultsError: nextProps.queryResultsError });
  //   this.setState({ queryResultsCategory: nextProps.queryResultsCategory });
  //   this.setState({ categories: nextProps.categories });
  // }

  /**
   * render - return the trending chart object to render.
   */
  render() {
    const { queryData, queryType } = this.state;

    console.log('queryType: ' + queryType);

    // const options = {
    //   responsive: true,
    //   legend: {
    //     position: 'bottom'
    //   }
    // };

    const tagCloudOptions = {
      luminosity: 'light',
      hue: 'blue'
    };
    
    return (
      <div className="query-results-panel">
        <Menu  className='term-menu' compact floated={true}>
          <Dropdown 
            item
            scrolling
            value={ queryData[queryType].category }
            onChange={ this.categoryChange.bind(this) }
            options={ this.getCategoryOptions() }
          />
        </Menu>

        <Divider clearing hidden/>
        
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
        ) : null}
      </div>
    );
  }
}

// type check to ensure we are called correctly
CommonQueryPanelBase.propTypes = {
  queryType: PropTypes.number,
  categories: PropTypes.object,
  queryData: PropTypes.array,
  onGetCommonQueryRequest: PropTypes.func.isRequired
};
