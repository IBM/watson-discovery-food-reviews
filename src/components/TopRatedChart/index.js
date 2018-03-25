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
import { Grid } from 'semantic-ui-react';
import RC2 from 'react-chartjs-2';
//const utils = require('../../../lib/utils');

/**
 * This object renders a bar chart object that appears at the bottom
 * of the web page. It shows the top rated products and thier respective
 * average rankings. 
 */
export default class TopRatedChart extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      products: this.props.products || null
    };
  }

  /**
   * getChartData - all of the data can be found in the product collection.
   */
  getChartData() {
    const { products } = this.state;

    var labels = [];
    var scores = [];

    if (products && products.results) {
      // we only care about the top 10 scores
      var productData = products.results.slice(0,10);

      // sort the data
      var sortedData = [];
      productData.forEach(function(product) {
        sortedData.push( {
          label: product.key + ' (' + product.matching_results + ')',
          score: Number((product.aggregations[0].value).toFixed(2))
        });
      });
      sortedData.sort(function (a, b) {
        return b.score - a.score;
      });

      sortedData.forEach(function(product) {
        labels.push(product.label);
        scores.push(product.score);
      });
    }

    var ret = {
      labels: labels,
      datasets: [{
        label: 'Scores (range 0.0 to 5.0)',
        data: scores,
        backgroundColor: 'rgb(149, 223, 168)'
      }]
    };

    return ret;
  }

  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occured which has changed the list of 
  // items we are graphing.
  componentWillReceiveProps(nextProps) {
    this.setState({ products: nextProps.products });
  }

  /**
   * render - return the chart object to render.
   */
  render() {
    const options = {
      responsive: true,
      legend: {
        position: 'bottom'
      }
    };

    return (
      <div className="top-ranking-chart">
        <Grid.Row>
          <div className="top-ranking-chart">
            <RC2
              type={ 'horizontalBar' }
              options={ options }
              data={ this.getChartData() }
              height={ 200 }
            />
          </div>
        </Grid.Row>
      </div>
    );
  }
}

// type check to ensure we are called correctly
TopRatedChart.propTypes = {
  products: PropTypes.object,
};
