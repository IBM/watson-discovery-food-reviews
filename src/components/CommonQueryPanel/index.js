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
import QueryResultsPanel from '../QueryResultsPanel';
import { Grid, Tab, Dropdown, Divider } from 'semantic-ui-react';
const utils = require('../../../lib/utils');

/**
 * This object serves as the panel containing all common queries and results.
 *
 * It provides a tag cloud of top keywords, a top 5 list of entities,
 * and a list or relevant reviews. A dropdown will allow the user
 * to select which category data will be shown.
 */
export default class CommonQueryPanel extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      queryData: this.props.queryData,
      categories: this.props.categories,
      category: this.props.category,
      queryType: this.props.queryType
    };
  }

  /**
   * categoryChange - user has selected a new category.
   */
  categoryChange(event, selection) {
    var { category, queryType, queryData } = this.state;

    if (category !== selection.value) {
      queryData[queryType].category = selection.value;
      queryData[queryType].data = null;
  
      this.setState({
        queryData: queryData,
        category: selection.value
      });
  
      // inform parent
      this.props.onGetCommonQueryRequest({
        category: selection.value,
        queryType: queryType
      });
    }
  }

  /**
   * categoryChange - user has selected a new category.
   */
  tabChange(event, selection) {
    const { queryData, category } = this.state;
    var selectedQueryType = selection.activeIndex;

    this.setState({
      queryType: selectedQueryType
    });

    // fetch data associated with this query if we don't currently 
    // have results for this category
    if (queryData[selectedQueryType].category != category) {
      queryData[selectedQueryType].category = category;
      queryData[selectedQueryType].data = null;
  
      this.setState({
        queryData: queryData
      });

      // inform parent
      this.props.onGetCommonQueryRequest({
        category: category,
        queryType: selectedQueryType
      });
    }
  }

  /**
   * getCategoryOptions - get the term items available to be selected by the user.
   */
  getCategoryOptions() {
    const { categories } = this.state;
    var options = [];

    if (categories.results) {
      categories.results.map(item =>
        options.push({key: item.key, value: item.key, text: item.key})
      );
    }

    return options;
  }
  
  /**
   * render - return the panel object to render.
   */
  render() {
    const { queryData, category, queryType } = this.state;

    var defaultCategory = category;
    if (defaultCategory === utils.NO_CATEGORY_SELECTED) {
      defaultCategory = null;
    }

    const queryTabs = [
      { menuItem: 
        { key: 'query_' + utils.CQT_HIGH_SCORE, 
          content: 'What reviews of <category> have the highest scores?',
          className: 'common-tab-item' },
      render: () =>
        <div>
          <Grid celled className='big-graph-grid'>
            <Grid.Row className='selection-header'>
              <Grid.Column width={16} textAlign='center'>
                <QueryResultsPanel
                  key={utils.CQT_HIGH_SCORE}
                  queryData={queryData}
                  queryType={utils.CQT_HIGH_SCORE}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      },
      { menuItem: 
        { key: 'query_' + utils.CQT_HIGH_SENTIMENT, 
          content: 'What reviews of <category> have the most positive sentiment?',
          className: 'common-tab-item' },
      render: () =>
        <div>
          <Grid celled className='big-graph-grid'>
            <Grid.Row className='selection-header'>
              <Grid.Column width={16} textAlign='center'>
                <QueryResultsPanel
                  key={utils.CQT_HIGH_SENTIMENT}
                  queryData={queryData}
                  queryType={utils.CQT_HIGH_SENTIMENT}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      },
      { menuItem: 
        { key: 'query_' + utils.CQT_HIGH_SCORE_LOW_SENTIMENT, 
          content: 'Which top scoring reviews of <category> have the most negative sentiment?',
          className: 'common-tab-item' },
      render: () =>
        <div>
          <Grid celled className='big-graph-grid'>
            <Grid.Row className='selection-header'>
              <Grid.Column width={16} textAlign='center'>
                <QueryResultsPanel
                  key={utils.CQT_HIGH_SCORE_LOW_SENTIMENT}
                  queryData={queryData}
                  queryType={utils.CQT_HIGH_SCORE_LOW_SENTIMENT}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      },
      { menuItem: 
        { key: 'query_' + utils.CQT_LOW_SCORE_HIGH_SENTIMENT, 
          content: 'Which low scoring reviews of <category> have the most positive sentiment?',
          className: 'common-tab-item' },
      render: () =>
        <div>
          <Grid celled className='big-graph-grid'>
            <Grid.Row className='selection-header'>
              <Grid.Column width={16} textAlign='center'>
                <QueryResultsPanel
                  key={utils.CQT_LOW_SCORE_HIGH_SENTIMENT}
                  queryData={queryData}
                  queryType={utils.CQT_LOW_SCORE_HIGH_SENTIMENT}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      },
      { menuItem: 
        { key: 'query_' + utils.CQT_LOW_SCORE_LOW_SENTIMENT, 
          content: 'Which low scoring reviews of <category> have the most negative sentiment?',
          className: 'common-tab-item' },
      render: () =>
        <div>
          <Grid celled className='big-graph-grid'>
            <Grid.Row className='selection-header'>
              <Grid.Column width={16} textAlign='center'>
                <QueryResultsPanel
                  key={utils.CQT_LOW_SCORE_LOW_SENTIMENT}
                  queryData={queryData}
                  queryType={utils.CQT_LOW_SCORE_LOW_SENTIMENT}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      }
    ];
    
    return (
      <div className='query-results-panel'>
        <Grid.Column width={16} textAlign='center'>
          <Grid.Row>
            <label className='categories-label'>
              Selected Category:
              <Dropdown
                key='category'
                className='category-dropdown'
                item
                scrolling
                selection
                placeholder='No category selected'
                defaultValue={ defaultCategory }
                onChange={ this.categoryChange.bind(this) }
                options={ this.getCategoryOptions() }
              />
            </label>
          </Grid.Row>

          <Divider hidden/>
          <Divider/>
          <Divider hidden/>

          <Grid.Row className='common-query-data'>
            <Tab 
              className='tab-content' 
              menu={{ vertical: true, fluid: true }}
              panes={queryTabs}
              activeIndex={queryType}
              onTabChange={this.tabChange.bind(this)} />
          </Grid.Row>
        </Grid.Column>
      </div>
    );
  }
}

// type check to ensure we are called correctly
CommonQueryPanel.propTypes = {
  categories: PropTypes.object,
  queryData: PropTypes.array,
  category: PropTypes.string,
  queryType: PropTypes.number,
  onGetCommonQueryRequest: PropTypes.func.isRequired
};
