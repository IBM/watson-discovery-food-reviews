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
import { Menu, Dropdown, Divider } from 'semantic-ui-react';
import { Doughnut } from 'react-chartjs-2';
const utils = require('../../../lib/utils');

/**
 * This object renders a donut object that appears at the bottom
 * of the web page. The graph contains the top 10 topics for the
 * selected facet (entities, categories, etc). A drop-down menu
 * allows the user to select the facet type.
 */
export default class CommonTopicsChart extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      entities: this.props.entities,
      categories: this.props.categories,
      concepts: this.props.concepts,
      keywords: this.props.keywords,
      entityTypes: this.props.entityTypes,
      chartType: utils.ENTITY_FILTER,
    };
  }

  /**
   * filterTypeChange - user has selected a new filter type.
   */
  filterTypeChange(event, selection) {
    this.setState({
      chartType: selection.value
    });
  }

  /**
   * parseCollection - get the top listed topics based on the filter type.
   */
  parseCollection(collection) {

    var collectionData = {
      topicName: new Array(10).fill(''),
      topicMatches: new Array(10).fill(0)
    };

    if (collection.results) {
      var idx = 0;
      for (var item of collection.results) {
        collectionData.topicName[idx] = item.key;
        collectionData.topicMatches[idx] = item.matching_results;
        idx = idx + 1;
      }
    }

    return collectionData;
  }

  /**
   * getChartData - based on what group filter user has selected, accumulate 
   * all of the data needed to render this chart.
   */
  getChartData() {
    const {
      chartType,
      entities,
      categories,
      concepts,
      keywords,
      entityTypes
    } = this.state;
    
    var collectionData = [];
    if (chartType === utils.ENTITY_FILTER) {
      collectionData = this.parseCollection(entities);
    } else if (chartType === utils.CATEGORY_FILTER) {
      collectionData = this.parseCollection(categories);
    } else if (chartType === utils.CONCEPT_FILTER) {
      collectionData = this.parseCollection(concepts);
    } else if (chartType === utils.KEYWORD_FILTER) {
      collectionData = this.parseCollection(keywords);
    } else if (chartType === utils.ENTITY_TYPE_FILTER) {
      collectionData = this.parseCollection(entityTypes);
    }

    var ret = {
      // legend
      labels: collectionData.topicName,
      datasets: [{
        // raw numbers
        data: collectionData.topicMatches,
        // colors for each piece of the graph
        backgroundColor: [
          'rgb(224, 214, 55)',
          'rgb(213, 173, 42)',
          'rgb(204, 131, 39)',
          'rgb(188, 74, 38)',
          'rgb(180, 45, 39)',
          'rgb(151, 29, 90)',
          'rgb(87, 37, 106)',
          'rgb(45, 65, 134)',
          'rgb(0, 84, 146)',
          'rgb(0, 132, 123)',
          'rgb(58, 153, 69)',
          'rgb(139, 177, 64)'
        ],
        hoverBackgroundColor: [
          'rgb(224, 214, 55)',
          'rgb(213, 173, 42)',
          'rgb(204, 131, 39)',
          'rgb(188, 74, 38)',
          'rgb(180, 45, 39)',
          'rgb(151, 29, 90)',
          'rgb(87, 37, 106)',
          'rgb(45, 65, 134)',
          'rgb(0, 84, 146)',
          'rgb(0, 132, 123)',
          'rgb(58, 153, 69)',
          'rgb(139, 177, 64)'
        ]
      }]
    };
    return ret;
  }
  
  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occured which has changed the list of 
  // items we are graphing.
  componentWillReceiveProps(nextProps) {
    this.setState({ entities: nextProps.entities });
    this.setState({ categories: nextProps.categories });
    this.setState({ concepts: nextProps.concepts });
    this.setState({ keywords: nextProps.keywords });
    this.setState({ entityTypes: nextProps.entityTypes });
  }

  /**
   * render - return all the sentiment objects to render.
   */
  render() {
    const options = {
      responsive: true,
      legend: {
        position: 'bottom'
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    };

    return (
      <div>
        <Menu compact floated={true}>
          <Dropdown 
            item
            onChange={ this.filterTypeChange.bind(this) }
            defaultValue={ utils.ENTITY_FILTER }
            options={ utils.filterTypes }
          />
        </Menu>
        <Divider clearing hidden/>
        <div>
          <Doughnut 
            data={ this.getChartData() }
            options={ options }
            height={ 200 }
          />       
        </div>
      </div>
    );
  }
}

// type check to ensure we are called correctly
CommonTopicsChart.propTypes = {
  entities: PropTypes.object,
  categories: PropTypes.object,
  concepts: PropTypes.object,
  keywords: PropTypes.object,
  entityTypes: PropTypes.object,
};
