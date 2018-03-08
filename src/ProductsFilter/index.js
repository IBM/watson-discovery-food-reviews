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

import PropTypes from 'prop-types';
import FilterContainer from '../FilterBase/FilterContainer';

/**
 * EntitiesFilter - A container component for Entity objects.
 * This object appears on the web page and allows the user to
 * filter matches based on an 'entity' value. It's core functionality
 * comes from its parents class - the FilterContainer.
 */
class ProductsFilter extends FilterContainer {
  constructor(...props) {
    super(...props);

    this.state = {
      products: this.props.products,
      selectedProducts: this.props.selectedProducts
    };
  }

  /**
   * getSelectedCollection - Override parent class to return collection 
   * of selected entity items.
   */
  getSelectedCollection() {
    const { selectedProducts } = this.state;
    return selectedProducts;
  }

  /**
   * getCollection - Override parent class to return collection 
   * of all entity items.
   */
  getCollection() {
    const { products } = this.state;
    return products;
  }

  /**
   * getContainerTitle - Override parent class to return title of 
   * the filter container. 
   */
  getContainerTitle() {
    return 'Products';
  }
  
  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occured which has changed the list of 
  // entities, or which entities are selected.
  componentWillReceiveProps(nextProps) {
    this.setState({ products: nextProps.products });
    this.setState({ selectedProducts: nextProps.selectedProducts });
  }
}

// type check to ensure we are called correctly
ProductsFilter.propTypes = {
  products: PropTypes.array,
  selectedProducts: PropTypes.object,
};

// export so we are visible to parent
module.exports = ProductsFilter;
