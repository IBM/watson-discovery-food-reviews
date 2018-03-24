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
import { Grid, Menu, Dropdown, Divider } from 'semantic-ui-react';
import { Line } from 'react-chartjs-2';
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
export default class ProductTrendChart extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      productTrendData: this.props.productTrendData || null,
      productTrendLoading: this.props.productTrendLoading || false,
      productTrendError: this.props.productTrendError,
      productTrendProductId: utils.NO_PRODUCT_ITEM,
      products: this.props.products 
    };
  }

  /**
   * filterTypeChange - user has selected a new filter type. This will
   * change the filter type values available to select from.
   */
  productChange(event, selection) {
    this.setState({
      productTrendProductId: utils.NO_PRODUCT_ITEM,
      productTrendData: null
    });

    this.props.onGetTrendDataRequest({
      productId: selection.value
    });
  }

  /**
   * getChartData - based on what group filter user has selected, accumulate 
   * all of the data needed to render the trending chart.
   */
  getChartData() {
    const { productTrendData } = this.state;

    var labels = [];
    var scores = [];
    
    if (productTrendData && productTrendData.matching_results) {
      productTrendData.aggregations[0].results.forEach(function(result) {
        if (result.aggregations[0].value) {
          labels.push(result.key_as_string.substring(0,10));
          scores.push(Number((result.aggregations[0].value).toFixed(2)));
        }
      });
    }

    var ret = {
      labels: labels,
      datasets: [{
        label: 'Avg Scores (range -1.0 to 1.0)',
        data: scores,
        backgroundColor: 'rgba(0,255,0,0.6)'
      }]
    };

    return ret;
  }

  /**
   * getTermOptions - get the term items available to be selected by the user.
   */
  getProductOptions() {
    const { products } = this.state;
    var options = [{ key: -1, value: utils.NO_PRODUCT_ITEM, text: utils.NO_PRODUCT_ITEM }];

    if (products.results) {
      products.results.map(item =>
        options.push({key: item.key, value: item.key, text: item.key})
      );
    }

    return options;
  }
  
  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occured which has changed the list of 
  // items we are graphing, OR the graph data has arrived.
  componentWillReceiveProps(nextProps) {
    this.setState({ productTrendData: nextProps.productTrendData });
    this.setState({ productTrendLoading: nextProps.productTrendLoading });
    this.setState({ productTrendError: nextProps.productTrendError });
    this.setState({ productTrendProductId: nextProps.productTrendProductId });
    this.setState({ products: nextProps.products });
  }

  /**
   * render - return the trending chart object to render.
   */
  render() {
    const { productTrendLoading, productTrendProductId } = this.state;
    
    const options = {
      responsive: true,
      legend: {
        position: 'bottom'
      }
    };

    return (
      <div className="trend-chart">
        <Menu  className='term-menu' compact floated={true}>
          <Dropdown 
            item
            scrolling
            value={ productTrendProductId }
            loading={ productTrendLoading }
            onChange={ this.productChange.bind(this) }
            options={ this.getProductOptions() }
          />
        </Menu>

        <Divider clearing hidden/>
        <Grid.Row>
          <div className="trending-chart">
            <Line
              type={ 'line' }
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
ProductTrendChart.propTypes = {
  products: PropTypes.object,
  productTrendData: PropTypes.object,
  productTrendLoading: PropTypes.bool,
  productTrendError: PropTypes.object,
  productTrendProductId: PropTypes.string,
  onGetTrendDataRequest: PropTypes.func.isRequired
};
