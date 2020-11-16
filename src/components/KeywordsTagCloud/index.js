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

  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occurred which has changed the list 
  // items we are showing.
  static getDerivedStateFromProps(props, state) {
    for (var i=0; i<props.keywords.results.length; i++) {
      if ((props.keywords.results[i].key != state.keywords.results[i].key) ||
          (props.keywords.results[i].matching_results != state.keywords.results[i].matching_results)) {
        return {
          keywords: props.keywords,
        };
      }
    } 

    // Return null to indicate no change to state.
    return null;
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
