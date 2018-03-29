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
import { Grid, Dimmer, Input, Button, Loader, Dropdown, Header, Divider, List } from 'semantic-ui-react';
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
export default class CustomQueryPanel extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      queryData: this.props.queryData,
      products: this.props.products,
      reviewers: this.props.reviewers,
      clearQuery: 'queryKey1',
      clearSentiment: 'sentimentKey1',
      clearProduct: 'productKey1',
      clearReviewer: 'reviewerKey1'
    };
  }

  /**
   * categoryChange - user has selected a new category.
   */
  sentimentFilterChanged(event, selection) {
    var { queryData } = this.state;
    
    queryData.sentiment = selection.value;

    this.setState({
      queryData: queryData
    });
  }

  productFilterChanged(event, selection) {
    var { queryData } = this.state;

    queryData.product = selection.value;

    this.setState({
      queryData: queryData
    });
  }

  reviewerFilterChanged(event, selection) {
    var { queryData } = this.state;
    queryData.product = selection.value;

    this.setState({
      queryData: queryData
    });
  }

  queryChanged(event, data) {
    var { queryData } = this.state;
    queryData.query = data.value;
    
    this.setState({
      queryData: queryData
    });
  }

  doCustomQuerySearch() {
    var { queryData } = this.state;
    this.props.onGetCustomQueryRequest({
      queryData: queryData
    });
  }

  doCustomQueryClear() {
    var { queryData, clearQuery, clearSentiment, clearProduct, clearReviewer } = this.state;
    queryData.data = null;
    queryData.loading = false;
    queryData.error = null;
    queryData.query = '';
    queryData.sentiment = 'ALL';
    queryData.product = 'ALL';
    queryData.reviewer = 'ALL';
    queryData.placeHolder = 'Enter search string...';
    this.setState({
      queryData: queryData,
      clearQuery: (clearQuery == 'queryKey1' ? 'queryKey2' : 'queryKey1'),
      clearSentiment: (clearSentiment == 'sentimentKey1' ? 'sentimentKey2' : 'sentimentKey1'),
      clearProduct: (clearProduct == 'productKey1' ? 'productKey2' : 'productKey1'),
      clearReviewer: (clearReviewer == 'reviewerKey1' ? 'reviewerKey2' : 'reviewerKey1')
    });
  }

  getShowSentimentOptions() {
    const reviewSentimentOptions = [
      { key: 'ALL', value: 'ALL', text: 'Show All Reviews' },
      { key: 'POS', value: 'positive', text: 'Show Positive Reviews' },
      { key: 'NEG', value: 'negative', text: 'Show Negative Reviews' }
    ];

    return reviewSentimentOptions;
  }

  getShowProductOptions() {
    const { products } = this.state;
    var showProductOptions = [
      { key: 'ALL', value: 'ALL', text: 'For All Products' }
    ];

    products.results.forEach(function(entry) {
      showProductOptions.push({
        key: entry.key,
        value: entry.key,
        text: 'For Product: ' + entry.key + ' (' + entry.matching_results + ')'
      });
    });

    return showProductOptions;
  }

  getShowReviewerOptions() {
    const { reviewers } = this.state;
    var showReviewersOptions = [
      { key: 'ALL', value: 'ALL', text: 'For All Reviewers' }
    ];

    reviewers.results.forEach(function(entry) {
      showReviewersOptions.push({
        key: entry.key,
        value: entry.key,
        text: 'For Reviewer: ' + entry.key  + ' (' + entry.matching_results + ')'
      });
    });

    return showReviewersOptions;
  }

  /**
   * getChartData - based on what group filter user has selected, accumulate 
   * all of the data needed to render the trending chart.
   */
  getEntities() {
    const { queryData } = this.state;
    var entities = [];

    if (queryData && queryData.data.matching_results) {
      // get top 5 entities
      for (var i=0; i<5; i++) {
        if (queryData.data.aggregations[utils.ENTITY_DATA_INDEX].results[i].key) {
          var entry = { 
            id: i, 
            text: queryData.data.aggregations[utils.ENTITY_DATA_INDEX].results[i].key };
          entities.push(entry);
        }      
      }
    }

    return entities;
  }

  getKeywords() {
    const { queryData } = this.state;
    var keywords = [];

    if (queryData && queryData.data.matching_results) {
      // get top 10 keywords
      for (var i=0; i<10; i++) {
        if (queryData.data.aggregations[utils.KEYWORD_DATA_INDEX].results[i].key) {
          var entry = { 
            count: i, 
            value: queryData.data.aggregations[utils.ENTITY_DATA_INDEX].results[i].key };
          keywords.push(entry);
        }      
      }
    }

    return keywords;
  }

  getReviews() {
    const { queryData } = this.state;

    // get top reviews
    var reviews = utils.formatData(queryData.data);

    return (
      <Matches 
        matches={ reviews.results }
      />
    );
  }

  /**
   * getCategoryOptions - get the term items available to be selected by the user.
   */
  getProductOptions() {
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
  //   this.setState({ queryData: nextProps.queryData });
  // }

  /**
   * render - return the trending chart object to render.
   */
  render() {
    const { queryData, clearQuery, clearSentiment, clearProduct, clearReviewer } = this.state;

    const tagCloudOptions = {
      luminosity: 'light',
      hue: 'blue'
    };
    
    return (
      <div className="query-results-panel">
        <Grid className='custom-query-controls'>
          <Grid.Column width={16} textAlign='center'>
            <Grid.Row>
              <Button onClick={ this.doCustomQuerySearch.bind(this) }>
                Submit
              </Button>
              <Button onClick={ this.doCustomQueryClear.bind(this) }>
                Clear
              </Button>
            </Grid.Row>

            <Divider clearing hidden/>

            <Grid.Row>
              <Input
                key={ clearQuery }
                className='search-input-field'
                icon='search' 
                placeholder={ queryData.placeHolder }
                onChange={ this.queryChanged.bind(this) }
              />
              <Dropdown 
                key={ clearSentiment }
                className='top-filter-class'
                defaultValue={ queryData.sentiment }
                search
                selection
                scrolling
                options={ this.getShowSentimentOptions() }
                onChange={ this.sentimentFilterChanged.bind(this) }
              />
              <Dropdown 
                key={ clearProduct }
                className='top-filter-class'
                defaultValue={ queryData.product }
                search
                selection
                scrolling
                options={ this.getShowProductOptions() }
                onChange={ this.productFilterChanged.bind(this) }
              />
              <Dropdown 
                key={ clearReviewer }
                defaultValue={ queryData.reviewer }
                search
                selection
                scrolling
                options={ this.getShowReviewerOptions() }
                onChange={ this.reviewerFilterChanged.bind(this) }
              />
            </Grid.Row>
            
          </Grid.Column>
        </Grid>
  
        <Divider clearing hidden/>
        
        { queryData.loading ? (
          <div>
            <div className="loader--container" style={{height: 572}}>
              <Dimmer active inverted>
                <Loader>Loading</Loader>
              </Dimmer>
            </div>
          </div>

        ) : (queryData.data && queryData.data.matching_results == 0) ? (
          <div>
            <Header as='h3' textAlign='center'>
              No Matches Found
            </Header>
          </div>
          
        ) : queryData.data ? (
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
        ) : queryData.error ? (
          <div className="results">
            <div className="_container _container_large">
              <div className="row">
                {JSON.stringify(queryData.error)}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

// type check to ensure we are called correctly
CustomQueryPanel.propTypes = {
  products: PropTypes.object,
  reviewers: PropTypes.object,
  queryData: PropTypes.object,
  onGetCustomQueryRequest: PropTypes.func.isRequired
};
