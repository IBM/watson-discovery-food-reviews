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
 * This object serves as the panel containing custom query options and results.
 *
 * It provides a tag cloud of top keywords, a top 5 list of entities,
 * and a list or relevant reviews.
 *
 * User can enter a search field, and select from a number of dropdown menus
 * to limit what results are returned.
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
   * categoryChange - user has selected what type of sentiment to filter on.
   */
  sentimentFilterChanged(event, selection) {
    var { queryData } = this.state;
    
    queryData.sentiment = selection.value;

    this.setState({
      queryData: queryData
    });
  }

  /**
   * productFilterChanged - user has selected a product to filter on.
   */
  productFilterChanged(event, selection) {
    var { queryData } = this.state;

    queryData.product = selection.value;

    this.setState({
      queryData: queryData
    });
  }

  /**
   * reviewerFilterChanged - user has selected type of review to filter on.
   */
  reviewerFilterChanged(event, selection) {
    var { queryData } = this.state;
    queryData.product = selection.value;

    this.setState({
      queryData: queryData
    });
  }

  /**
   * queryChanged - user has changed search query.
   */
  queryChanged(event, data) {
    var { queryData } = this.state;
    queryData.query = data.value;
    
    this.setState({
      queryData: queryData
    });
  }

  /**
   * handleKeyPress - user has entered a new search value. 
   * Pass on to the parent object.
   */
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.doCustomQuerySearch();
    }
  }

  /**
   * doCustomQuerySearch - tell parent to perform search.
   */
  doCustomQuerySearch() {
    var { queryData } = this.state;
    this.props.onGetCustomQueryRequest({
      queryData: queryData
    });
  }

  /**
   * doCustomQueryClear - clear panel and set all options to default values.
   */
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

  /**
   * getShowSentimentOptions - return available sentiment type options.
   */
  getShowSentimentOptions() {
    const reviewSentimentOptions = [
      { key: 'ALL', value: 'ALL', text: 'Show All Reviews' },
      { key: 'POS', value: 'positive', text: 'Show Positive Reviews' },
      { key: 'NEG', value: 'negative', text: 'Show Negative Reviews' }
    ];

    return reviewSentimentOptions;
  }

  /**
   * getShowProductOptions - return available product IDs.
   */
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

  /**
   * getShowReviewerOptions - return available review type options.
   */
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
   * getEntities - return top 5 entities for placement in list.
   */
  getEntities() {
    const { queryData } = this.state;
    var entities = [];

    if (queryData && queryData.data.matching_results) {
      const data = queryData.data.aggregations[utils.ENTITY_DATA_INDEX];
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
    const { queryData } = this.state;
    var keywords = [];

    if (queryData && queryData.data.matching_results) {
      const data = queryData.data.aggregations[utils.KEYWORD_DATA_INDEX];
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
   * render - return the panel object to render.
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
              <Input
                key={ clearQuery }
                className='search-input-field'
                icon='search' 
                placeholder={ queryData.placeHolder }
                onKeyPress={this.handleKeyPress.bind(this)}
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
            
            <Divider clearing hidden/>

            <Grid.Row>
              <Button onClick={ this.doCustomQuerySearch.bind(this) }>
                Submit
              </Button>
              <Button onClick={ this.doCustomQueryClear.bind(this) }>
                Clear
              </Button>
            </Grid.Row>
          </Grid.Column>
        </Grid>
  
        <Divider clearing hidden/>
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
            <Divider section/>
            <Divider hidden/>
            <Grid className='custom-query-results'>
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
