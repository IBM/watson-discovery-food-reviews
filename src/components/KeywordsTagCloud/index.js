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
import { TagCloud } from 'react-tagcloud';
import { Header, Icon } from 'semantic-ui-react';

var _gDoUpdate = true;    // determines if we render update or not

/**
 * This object renders a tag cloud object that appears in the right column
 * of the home page. It contains selectable terms that the user can use
 * to filter the match list. It is essentially like the filter objects, but
 * in a different format. It comes with a drop down menu where the user can
 * select what filter (entities, categories, concepts, keywords, or entity
 * types) values to display in the cloud.
 */
export default class KeywordsTagCloud extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      keywords: this.props.keywords
    };
  }

  /**
   * getTagCloudItems - return all keyword values
   */
  getTagCloudItems() {
    const {
      keywords
    } = this.state;

    var oldArray = JSON.parse(JSON.stringify(keywords.results));

    // the values are taken from a collection that contains 'number
    // of matches' for the item. We don't want to show those numbers
    // so remove them from our new collection.
    var idx;
    var newArray = [];
    for (idx = 0; idx < oldArray.length; idx++) {
      var obj = oldArray[idx];
      obj.value = obj.key; // + ' (' + obj.matching_results + ')';
      obj.count = obj.matching_results;
      delete(obj.key);
      delete(obj.matching_results);
      newArray.push(obj); 
    }
    return newArray;
  }

  /**
   * setsAreEqual - shallow test to see if two data sets are equal.
   */
  setsAreEqual(arr1, arr2) {
    if (arr1.length != arr2.length) {
      return false;
    }

    for (var i=0; i<arr1.length; i++) {
      if ((arr1[i].key != arr2[i].key) ||
          (arr1[i].matching_results != arr2[i].matching_results)) {
        return false;
      }
    } 
    return true;
  }
  
  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occurred which has changed the list 
  // items we are showing.
  componentWillReceiveProps(nextProps) {
    const { 
      keywords,
    } = this.state;

    _gDoUpdate = false;
    
    if (! this.setsAreEqual(keywords.results, nextProps.keywords.results)) {
      this.setState({ keywords: nextProps.keywords });
      _gDoUpdate = true;
    }
  }

  // Only do update if something has changed
  // NOTE: we need to do this for this specific component because it
  // draws itself randomly each time, which we want to avoid when
  // nothing has changed.
  /*eslint no-unused-vars: ["error", { "args": "none" }]*/
  shouldComponentUpdate(nextProps, nextState) {
    if (_gDoUpdate) {
      return true;
    } else {
      _gDoUpdate = true;
      return false;
    }
  }

  /**
   * render - return all the tag cloud objects to render.
   */
  render() {
    const options = {
      luminosity: 'light',
      hue: 'blue'
    };

    return (
      <div>
        <Header as='h2' block inverted textAlign='left'>
          <Icon name='cloud' inverted/>
          <Header.Content>
            Keywords
            <Header.Subheader>
              Tag Cloud
            </Header.Subheader>
          </Header.Content>
        </Header>
        <div>
          <TagCloud 
            tags={ this.getTagCloudItems() }
            minSize={16}
            maxSize={64}
            colorOptions={options}
          />
        </div>
      </div>
    );
  }
}

KeywordsTagCloud.propTypes = {
  keywords: PropTypes.object
};
