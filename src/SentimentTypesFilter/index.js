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
import { Form, Container, Checkbox } from 'semantic-ui-react';

/**
 * CategoriesFilter - A container component for Category objects.
 * This object appears on the web page and allows the user to
 * filter matches based on a 'category' value. It's core functionality
 * comes from its parents class - the FilterContainer.
 */
export default class SentimentTypesFilter extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = { 
      sentimentFilter: this.props.sentimentFilter
    };
  }

  handleChange(event, { value }) {
    const { sentimentFilter } = this.state;
    console.log("Sentiment Filter Changed: " + value);
    this.setState({ sentimentFilter: value });
    this.props.onSentimentFilterChange({
      sentimentFilter: value
    })
  }

  render() {
    return (
      <Container textAlign='left'>
        <div className="matches--list">
          <Checkbox
            className='filter-checkbox'
            radio
            fitted
            label='All Reviews'
            name='sentimentGroup'
            value='all'
            checked={this.state.sentimentFilter === 'all'}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div className="matches--list">
          <Checkbox
            className='filter-checkbox'
            radio
            fitted
            label='Only Positive Reviews'
            name='sentimentGroup'
            value='positive'
            checked={this.state.sentimentFilter === 'positive'}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div className="matches--list">
          <Checkbox
            className='filter-checkbox'
            radio
            fitted
            label='Only Negative Reviews'
            name='sentimentGroup'
            value='negative'
            checked={this.state.sentimentFilter === 'negative'}
            onChange={this.handleChange.bind(this)}
          />
        </div>
      </Container>
    );
  }
}

// type check to ensure we are called correctly
SentimentTypesFilter.propTypes = {
  sentimentFilter: PropTypes.string,
  onSentimentFilterChange: PropTypes.func.isRequired
};
