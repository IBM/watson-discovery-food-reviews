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

import 'isomorphic-fetch';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Matches from './components/Matches';
import PaginationMenu from './components/PaginationMenu';
import EntitiesFilter from './components/EntitiesFilter';
import CategoriesFilter from './components/CategoriesFilter';
import ConceptsFilter from './components/ConceptsFilter';
import KeywordsFilter from './components/KeywordsFilter';
import EntityTypesFilter from './components/EntityTypesFilter';
import SentimentChart from './components/SentimentChart';
import KeywordsTagCloud from './components/KeywordsTagCloud';
import CommonQueryPanel from './components/CommonQueryPanel';
import CustomQueryPanel from './components/CustomQueryPanel';
import { Tab, Grid, Dimmer, Button, Menu, Dropdown, Divider, Loader, Accordion, Icon, Header, Statistic } from 'semantic-ui-react';
const utils = require('../lib/utils');

/**
 * Main React object that contains all objects on the web page.
 * This object manages all interaction between child objects as
 * well as making search requests to the discovery service.
 */
class Main extends React.Component {
  constructor(...props) {
    super(...props);
    const { 
      // query data
      reviewers,
      entities, 
      categories, 
      concepts, 
      keywords,
      entityTypes,
      productNames,
      data,
      numMatches,
      numPositive,
      numNeutral,
      numNegative,
      error,
      // query params
      searchQuery,
      sentimentFilter,
      productNameFilter,
      reviewerIdFilter,
      sortOrder,
      // for filters
      selectedEntities,
      selectedCategories,
      selectedConcepts,
      selectedKeywords,
      selectedEntityTypes,
      // matches panel
      currentPage,
      // common query panel
      commonQueryData,
      currentCommonQueryCategory,   // eslint-disable-line no-unused-vars
      currentCommonQueryType,       // eslint-disable-line no-unused-vars
      // custom query panel
      customQueryData,
      // sentiment chart
      sentimentTerm
    } = this.props;

    // change in state fires re-render of components
    this.state = {
      // query data
      reviewers: reviewers && parseReviewers(reviewers),
      entities: entities && parseEntities(entities),
      categories: categories && parseCategories(categories),
      concepts: concepts && parseConcepts(concepts),
      keywords: keywords && parseKeywords(keywords),
      entityTypes: entityTypes && parseEntityTypes(entityTypes),
      productNames: productNames && parseProductNames(productNames),
      data: data,   // data should already be formatted
      numMatches: numMatches || 0,
      numPositive: numPositive || 0,
      numNeutral: numNeutral || 0,
      numNegative: numNegative || 0,
      loading: false,
      error: error,
      // original set of items that can be used in common and custom
      // queries and not be effected by limiting queries performed
      // on main dashboard.
      origCategories: categories && parseCategories(categories),
      origProductNames: productNames && parseProductNames(productNames),
      origReviewers: reviewers && parseReviewers(reviewers),
      // query params
      searchQuery: searchQuery || '',
      sortOrder: sortOrder || utils.sortKeys[0].sortBy,
      sentimentFilter: sentimentFilter || 'ALL',
      productNameFilter: productNameFilter || 'ALL',
      reviewerIdFilter: reviewerIdFilter || 'ALL',
      // used by filters
      selectedEntities: selectedEntities || new Set(),
      selectedCategories: selectedCategories || new Set(),
      selectedConcepts: selectedConcepts || new Set(),
      selectedKeywords: selectedKeywords || new Set(),
      selectedEntityTypes: selectedEntityTypes || new Set(),
      // common query data
      commonQueryData: commonQueryData,
      currentCommonQueryCategory: utils.NO_CATEGORY_SELECTED,
      currentCommonQueryType: 0,
      // custom query data
      customQueryData: customQueryData,
      // sentiment chart
      sentimentTerm: sentimentTerm || utils.ALL_TERM_ITEM,
      // misc panel
      currentPage: currentPage || '1',  // which page of matches are we showing
      activeFilterIndex: utils.SENTIMENT_DATA_INDEX, // which filter index is expanded/active
    };
  }

  /**
   * handleAccordionClick - (callback function)
   * User has selected one of the 
   * filter boxes to expand and show values for.
   */
  handleAccordionClick(e, titleProps) {
    const { index } = titleProps;
    const { activeFilterIndex } = this.state;
    const newIndex = activeFilterIndex === index ? -1 : index;
    this.setState({ activeFilterIndex: newIndex });
  }

  /**
   * filtersChanged - (callback function)
   * User has selected one of the values from within
   * one of the filter boxes. This results in making a new qeury to
   * the disco service.
   */
  filtersChanged() {
    const { searchQuery  } = this.state;
    this.fetchData(searchQuery, false);
  }

  /**
   * handleClearAllFiltersClick - (callback function)
   * User has selected button to clear out all filters.
   * This results in making a new qeury to the disco
   * service with no filters turned on.
   */
  handleClearAllFiltersClick() {
    const { searchQuery  } = this.state;
    this.fetchData(searchQuery, true);
  }

  /**
   * pageChanged - (callback function)
   * User has selected a new page of results to display.
   */
  pageChanged(data) {
    this.setState({ currentPage: data.currentPage });
  }

  /**
   * applySentimentFilter - (callback function)
   * User has selected what type of sentiment to filter on.
   * This results in making a new qeury to the disco service.
   */
  applySentimentFilter(event, data) {
    this.setState({ sentimentFilter: data.value });
  }
  
  /**
   * applyProductNameFilter - (callback function)
   * User has selected what product ID filter on.
   * This results in making a new qeury to the disco service.
   */
  applyProductNameFilter(event, data) {
    this.setState({ productNameFilter: data.value });
  }

  /**
   * applyReviewerIdFilter - (callback function)
   * User has selected what type of review (pos or neg) to filter on.
   * This results in making a new qeury to the disco service.
   */
  applyReviewerIdFilter(event, data) {
    this.setState({ reviewerIdFilter: data.value });
  }

  /**
   * componentDidUpdate - one of the above filters has been changed
   * so perform a new disco search.
   */
  componentDidUpdate(prevProps, prevState) {
    const { searchQuery, sentimentFilter, productNameFilter, reviewerIdFilter } = this.state;
    if ((sentimentFilter != prevState.sentimentFilter) || 
        (productNameFilter != prevState.productNameFilter) ||
        (reviewerIdFilter != prevState.reviewerIdFilter)) {
      // true = clear all filters for new search
      this.fetchData(searchQuery, true);
    }
  }

  /**
   * sentimentTermChanged - (callback function)
   * User has selected a new term to use in the sentiment
   * chart. Keep track of this so that main stays in sync.
   */
  sentimentTermChanged(data) {
    const { term } = data;
    this.setState({ sentimentTerm: term });
  }

  /**
   * sortOrderChange - (callback function)
   * User has changed how to sort the matches (defaut
   * is by highest score first). Save the value for
   * all subsequent queries to discovery.
   */
  sortOrderChange(event, selection) {
    const { data, sortOrder } = this.state;
    console.log('sortOrder: ' + sortOrder);
    if (sortOrder != selection.value) {

      // get internal version of the sort key
      var sortKey = '';
      for (var i=0; i<utils.sortKeys.length; i++) {
        if (utils.sortKeys[i].sortBy === selection.value) {
          sortKey = utils.sortKeys[i].sortBy;
          break;
        }
      }
      data.results = this.sortData(data, sortKey);

      // save off external key in case we do another query to Discovery
      this.setState({
        data: data,
        sortOrder: selection.value
      });
    }
  }

  sortData(data, sortKey) {
    var sortedData = data.results.slice();
    var sortBy = require('sort-by');
    
    sortedData.sort(sortBy(sortKey));
    return sortedData;
  }

  /**
   * fetchCustomQueryData - (callback function)
   * This builds the query used to perform all of the
   * custom queries provide to the user in the 'custom queries'
   * tab panel.
   */
  fetchCustomQueryData(data) {
    var { queryData } = data;

    queryData.loading = true;
    this.setState({
      customQueryData: queryData
    });

    // apply user specified filters
    var filterString = '';
    if (queryData.sentiment.length > 1) {
      if (queryData.sentiment !== 'ALL') {
        filterString = 'enriched_text.sentiment.document.label::' + queryData.sentiment;
      }
    }

    if (queryData.productName.length > 1) {
      if (queryData.productName !== 'ALL') {
        if (filterString != '') {
          filterString = filterString + ',';
        }
        filterString = filterString + 'enriched_text.entities.type::Product,enriched_text.entities.text::' + queryData.productName;
      }
    }

    // add any reviewer ID filter, if selected
    if (queryData.reviewer.length > 1) {
      if (queryData.reviewer !== 'ALL') {
        if (filterString != '') {
          filterString = filterString + ',';
        }
        filterString = filterString + 'UserId::' + queryData.reviewer;  // ex: 'A3PIHY8BD4AF7D'
      }
    }
    
    const qs = queryString.stringify({
      query: queryData.query,
      queryType: 'natural_language_query',
      filters: filterString,
      count: 1000,
      // don't sort so we get most relevant results first
      sort: ''
    });
    
    // send request
    fetch(`/api/customQuery?${qs}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        // const util = require('util');
        console.log('+++ DISCO CUSTOM 1 QUERY RESULTS +++');
        // console.log(util.inspect(json.aggregations[0].results, false, null));
        console.log('numMatches: ' + json.result.matching_results);

        let rawData = {};
        rawData['rawResponse'] = json;
        queryData.data = rawData;
        queryData.loading = false;
        queryData.error = null;
        this.setState({
          customQueryData: queryData
        });
      })
      .catch(response => {
        queryData.data = null;
        queryData.loading = false;
        queryData.error = (response.status === 429) ? 'Number of free queries per month exceeded' : 'Error fetching results';
        queryData.query = '';
        queryData.sentiment = 'ALL';
        queryData.productName = 'ALL';
        queryData.reviewer = 'ALL';
        queryData.placeHolder = 'Enter search string...';
        this.setState({
          customQueryData: queryData
        });
        // eslint-disable-next-line no-console
        console.error(response);
      });
  }

  /**
   * fetchCommonQueryData - (callback function)
   * This builds the query used to perform all of the
   * common queries provide to the user in the 'common queries'
   * tab panel.
   */
  fetchCommonQueryData(data) {
    var { category, queryType } = data;
    var { commonQueryData } = this.state;

    // make a copy so we can modify and update state
    var queryData = commonQueryData;

    if (category === utils.NO_CATEGORY_SELECTED) {
      queryData[queryType].data = null;
      queryData[queryType].loading = false;
      queryData[queryType].error = null;
      queryData[queryType].category = category;
      this.setState({
        commonQueryData: queryData,
        currentCommonQueryCategory: category,
        currentCommonQueryType: queryType
      });
      return;
    }

    queryData[queryType].loading = true;
    queryData[queryType].category = category;
    this.setState({
      commonQueryData: queryData,
      currentCommonQueryCategory: category,
      currentCommonQueryType: queryType
    });

    const qs = queryString.stringify(utils.getCommonQueryString(queryType, category));

    // send request
    fetch(`/api/customQuery?${qs}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        // const util = require('util');
        console.log('+++ DISCO COMMON 2 QUERY RESULTS +++');
        // console.log(util.inspect(json.aggregations[0].results, false, null));
        console.log('numMatches: ' + json.result.matching_results);

        let rawData = {};
        rawData['rawResponse'] = json;
        queryData[queryType].data = rawData;
        queryData[queryType].loading = false;
        queryData[queryType].error = null;
        queryData[queryType].category = category;
        this.setState({
          commonQueryData: queryData
        });
      })
      .catch(response => {
        queryData[queryType].data = null;
        queryData[queryType].loading = false;
        queryData[queryType].error = (response.status === 429) ? 'Number of free queries per month exceeded' : 'Error fetching results';
        queryData[queryType].category = utils.NO_CATEGORY_SELECTED;
        this.setState({
          commonQueryData: queryData
        });
        // eslint-disable-next-line no-console
        console.error(response);
      });
  }

  /**
   * fetchData - build the query that will be passed to the
   * discovery service.
   */
  fetchData(query, clearFilters) {
    const searchQuery = query;
    var {
      selectedEntities,
      selectedCategories,
      selectedConcepts,
      selectedKeywords,
      selectedEntityTypes,
      sortOrder,
    } = this.state;

    // clear filters if this a new text search
    if (clearFilters) {
      selectedEntities.clear();
      selectedCategories.clear();
      selectedConcepts.clear();
      selectedKeywords.clear();
      selectedEntityTypes.clear();
    }

    // console.log("QUERY2 - selectedCategories: ");
    // for (let item of selectedCategories)
    //   console.log(util.inspect(item, false, null));
    // console.log("QUERY2 - searchQuery: " + searchQuery);
    
    this.setState({
      loading: true,
      currentPage: '1',
      searchQuery
    });

    scrollToMain();
    history.pushState({}, {}, `/${searchQuery.replace(/ /g, '+')}`);
    const filterString = this.buildFilterStringForQuery();

    // build query string, with filters and optional params
    const qs = queryString.stringify({
      query: searchQuery,
      filters: filterString,
      count: 1000,
      sort: sortOrder,
      queryType: 'natural_language_query',
      returnPassages: false
    });

    // send request
    fetch(`/api/search?${qs}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        var data = utils.parseData(json);

        // format the data for UI
        data = utils.formatData(data, filterString);
        data.results = this.sortData(data, sortOrder);

        // add up totals for the sentiment of reviews
        var totals = utils.getTotals(data);

        console.log('+++ DISCO RESULTS +++');
        // const util = require('util');
        // console.log(util.inspect(data.results, false, null));
        console.log('numMatches: ' + data.results.length);

        this.setState({
          data: data,
          reviewers: parseReviewers(json),
          entities: parseEntities(json),
          categories: parseCategories(json),
          concepts: parseConcepts(json),
          keywords: parseKeywords(json),
          entityTypes: parseEntityTypes(json),
          productNames: parseProductNames(json),
          loading: false,
          numMatches: data.results.length,
          numPositive: totals.numPositive,
          numNegative: totals.numNegative,
          numNeutral: totals.numNeutral,
          error: null,
          sentimentTerm: utils.ALL_TERM_ITEM,
        });
        scrollToMain();
      })
      .catch(response => {
        this.setState({
          error: (response.status === 429) ? 'Number of free queries per month exceeded' : 'Error fetching results',
          loading: false,
          data: null
        });
        // eslint-disable-next-line no-console
        console.error(response);
      });
  }
  
  /**
   * buildFilterStringForFacet - build the filter string for
   * one set of filter objects.
   */
  buildFilterStringForFacet(collection, keyName, firstOne) {
    var str = '';
    var firstValue = firstOne; 
    if (collection.size > 0) {
      collection.forEach(function(value) {
        // remove the '(count)' from each entry, if it exists.
        // note - tag cloud items don't have '(count)'s.
        var idx = value.lastIndexOf(' (');
        if (idx >= 0) {
          value = value.substr(0, idx);
        }
        if (firstValue) {
          firstValue = false;
          str = keyName;
        } else {
          str = str + ',' + keyName;
        }
        str = str + '"' + value + '"';
      });
    }
    return str;
  }

  /**
   * buildFilterStringForQuery - convert all selected filters into a string
   * to be added to the search query sent to the discovery service
   */
  buildFilterStringForQuery() {
    var {
      selectedEntities, 
      selectedCategories, 
      selectedConcepts,
      selectedKeywords,
      selectedEntityTypes,
      sentimentFilter,
      productNameFilter,
      reviewerIdFilter
    } = this.state;
    var filterString = '';
    
    // add any entities filters, if selected
    var entitiesString = this.buildFilterStringForFacet(selectedEntities,
      'enriched_text.entities.text::', true);
    filterString = filterString + entitiesString;
      
    // add any category filters, if selected
    var categoryString = this.buildFilterStringForFacet(selectedCategories,
      'enriched_text.categories.label::', filterString === '');
    filterString = filterString + categoryString;

    // add any concept filters, if selected
    var conceptString = this.buildFilterStringForFacet(selectedConcepts,
      'enriched_text.concepts.text::', filterString === '');
    filterString = filterString + conceptString;

    // add any keyword filters, if selected
    var keywordString = this.buildFilterStringForFacet(selectedKeywords,
      'enriched_text.keywords.text::', filterString === '');
    filterString = filterString + keywordString;

    // add any entities type filters, if selected
    var entityTypesString = this.buildFilterStringForFacet(selectedEntityTypes,
      'enriched_text.entities.type::', filterString === '');
    filterString = filterString + entityTypesString;

    // and sentiment filter, if selected
    if (typeof sentimentFilter !== 'undefined' && sentimentFilter.length > 1) {
      if (sentimentFilter !== 'ALL') {
        if (filterString != '') {
          filterString = filterString + ',';
        }
        filterString = filterString + 'enriched_text.sentiment.document.label::' + sentimentFilter;
      }
    }

    // add any product name filter, if selected
    if (typeof productNameFilter !== 'undefined' && productNameFilter.length > 1) {
      if (productNameFilter !== 'ALL') {
        if (filterString != '') {
          filterString = filterString + ',';
        }
        filterString = filterString + 'enriched_text.entities.type::Product,enriched_text.entities.text::' + productNameFilter;
      }
    }

    // add any reviewer ID filter, if selected
    if (typeof reviewerIdFilter !== 'undefined' && reviewerIdFilter.length > 1) {
      if (reviewerIdFilter !== 'ALL') {
        if (filterString != '') {
          filterString = filterString + ',';
        }
        filterString = filterString + 'UserId::' + reviewerIdFilter;
      }
    }
    
    console.log('FilterString: ' + filterString);
    return filterString;
  }

  /**
   * getMatches - return collection matches to be rendered.
   */
  getMatches() {
    const { data, currentPage } = this.state;

    if (!data) {
      return null;
    }

    // get one page of matches
    var page = parseInt(currentPage);
    var startIdx = (page - 1) * utils.ITEMS_PER_PAGE;
    var pageOfMatches = data.results.slice(startIdx,startIdx+utils.ITEMS_PER_PAGE);

    return (
      <Matches 
        matches={ pageOfMatches }
      />
    );
  }

  /**
   * getPaginationMenu - return pagination menu to be rendered.
   */
  getPaginationMenu() {
    const { numMatches } = this.state;
    
    if (numMatches > 1) {
      return (
        <div className='matches-pagination-bar'>
          <PaginationMenu
            numMatches={numMatches}
            onPageChange={this.pageChanged.bind(this)}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  /**
   * getSentimentFilter - return values to be displayed in the sentiment filter.
   */
  getSentimentFilter() {
    const { sentimentFilter } = this.state;
    const reviewSentimentOptions = [
      { key: 'ALL', value: 'ALL', text: 'Show All Reviews' },
      { key: 'POS', value: 'positive', text: 'Show Positive Reviews' },
      { key: 'NEG', value: 'negative', text: 'Show Negative Reviews' }
    ];

    return (
      <Dropdown 
        className='top-filter-class'
        defaultValue={ sentimentFilter }
        search
        selection
        scrolling
        options={ reviewSentimentOptions }
        onChange={ this.applySentimentFilter.bind(this) }
      />
    );
  }

  /**
   * getProductNameFilter - return product IDs to be displayed in the product filter.
   */
  getProductNameFilter() {
    const { productNames, productNameFilter } = this.state;
    var showProductNameOptions = [
      { key: 'ALL', value: 'ALL', text: 'For All Products' }
    ];

    // make sure we don't show obvious bad results from our query to pull out product names
    const badValues = ['product', 'food', 'this', 'these', 'it'];

    productNames.results.forEach(function(entry) {
      if (! badValues.includes(entry.key)) {
        showProductNameOptions.push({
          key: entry.key,
          value: entry.key,
          text: 'For Product: ' + entry.key + ' (' + entry.matching_results + ')'
        });
      }
    });

    return (
      <Dropdown 
        className='top-filter-class'
        defaultValue={ productNameFilter }
        search
        selection
        scrolling
        options={ showProductNameOptions }
        onChange={ this.applyProductNameFilter.bind(this) }
      />
    );
  }

  /**
   * getReviewerFilter - return values to be displayed in the reviewers filter.
   */
  getReviewerFilter() {
    const { reviewers, reviewerIdFilter } = this.state;
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

    return (
      <Dropdown 
        defaultValue={ reviewerIdFilter }
        search
        selection
        scrolling
        options={ showReviewersOptions }
        onChange={ this.applyReviewerIdFilter.bind(this) }
      />
    );
  }

  /**
   * getEntitiesFilter - return entities filter object to be rendered.
   */
  getEntitiesFilter() {
    const { entities, selectedEntities } = this.state;
    if (!entities) {
      return null;
    }
    return (
      <EntitiesFilter 
        onFilterItemsChange={this.filtersChanged.bind(this)}
        entities={entities.results}
        selectedEntities={selectedEntities}
      />
    );
  }

  /**
   * getCategoriesFilter - return categories filter object to be rendered.
   */
  getCategoriesFilter() {
    const { categories, selectedCategories } = this.state;
    if (!categories) {
      return null;
    }
    return (
      <CategoriesFilter 
        onFilterItemsChange={this.filtersChanged.bind(this)}
        categories={categories.results}
        selectedCategories={selectedCategories}
      />
    );
  }

  /**
   * getConceptsFilter - return concepts filter object to be rendered.
   */
  getConceptsFilter() {
    const { concepts, selectedConcepts } = this.state;
    if (!concepts) {
      return null;
    }
    return (
      <ConceptsFilter 
        onFilterItemsChange={this.filtersChanged.bind(this)}
        concepts={concepts.results}
        selectedConcepts={selectedConcepts}
      />
    );
  }

  /**
   * getKeywordsFilter - return keywords filter object to be rendered.
   */
  getKeywordsFilter() {
    const { keywords, selectedKeywords } = this.state;
    if (!keywords) {
      return null;
    }
    return (
      <KeywordsFilter
        onFilterItemsChange={this.filtersChanged.bind(this)}
        keywords={keywords.results}
        selectedKeywords={selectedKeywords}
      />
    );
  }

  /**
   * getEntityTypeFilter - return entity types filter object to be rendered.
   */
  getEntityTypesFilter() {
    const { entityTypes, selectedEntityTypes } = this.state;
    if (!entityTypes) {
      return null;
    }
    return (
      <EntityTypesFilter
        onFilterItemsChange={this.filtersChanged.bind(this)}
        entityTypes={entityTypes.results}
        selectedEntityTypes={selectedEntityTypes}
      />
    );
  }

  /**
   * getPanelHeader - return main panel header object to be rendered.
   */
  getPanelHeader() {
    return (
      <Grid.Row className='main-panel-header'>
        <Grid.Column width={16} verticalAlign='middle' textAlign='center'>
          <Header as='h1' textAlign='center'>
            Food Reviews
          </Header>
        </Grid.Column>
      </Grid.Row>
    );
  }

  /**
   * render - return all the home page object to be rendered.
   */
  render() {
    const { loading, data, error,
      entities, categories, concepts, keywords, entityTypes,
      origCategories, origProductNames, origReviewers,
      selectedEntities, selectedCategories, 
      selectedConcepts,selectedKeywords, selectedEntityTypes,
      numMatches, numPositive, numNeutral, numNegative,
      commonQueryData, currentCommonQueryCategory, currentCommonQueryType, customQueryData,
      sentimentTerm, sortOrder } = this.state;

    // used for filter accordions
    const { activeFilterIndex } = this.state;

    const stat_items = [
      { key: 'matches', label: 'REVIEWS', value: numMatches },
      { key: 'positive', label: 'POSITIVE', value: numPositive },
      { key: 'neutral', label: 'NEUTRAL', value: numNeutral },
      { key: 'negative', label: 'NEGATIVE', value: numNegative }
    ];

    var filtersOn = false;
    if (selectedEntities.size > 0 ||
      selectedCategories.size > 0 ||
      selectedConcepts.size > 0 ||
      selectedKeywords.size > 0 ||
      selectedEntityTypes.size > 0) {
      filtersOn = true;
    }

    const mainTabs = [
      // dashboard tab
      { menuItem: { key: 'dashboard', icon: 'dashboard', content: 'Dashboard' },
        render: () =>
          <Tab.Pane attached='bottom'>
            <div>
              <Grid className='search-grid' celled='internally'>
                { this.getPanelHeader() }
                <Grid.Row className='selection-header' color={'blue'}>
                  <Grid.Column width={16} textAlign='center'>
                    { this.getSentimentFilter() }
                    { this.getProductNameFilter() }
                    { this.getReviewerFilter() }
                  </Grid.Column>
                </Grid.Row>

                {/* Results Panel */}

                <Grid.Row className='matches-grid-row'>

                  {/* Drop-Down Filters */}

                  <Grid.Column className='main-panel-column' width={3}>
                    <Header as='h2' block inverted textAlign='left'>
                      <Icon name='filter' />
                      <Header.Content>
                        Filter
                        <Header.Subheader>
                          By Enrichments
                        </Header.Subheader>
                      </Header.Content>
                    </Header>

                    {filtersOn ? (
                      <Button
                        compact
                        size='tiny'
                        basic
                        color='red'
                        content='clear all'
                        icon='remove'
                        onClick={this.handleClearAllFiltersClick.bind(this)}
                      />
                    ) : null}

                    <Accordion styled>
                      <Accordion.Title
                        active={activeFilterIndex == utils.ENTITY_DATA_INDEX}
                        index={utils.ENTITY_DATA_INDEX}
                        onClick={this.handleAccordionClick.bind(this)}>
                        <Icon name='dropdown' />
                        Entities
                      </Accordion.Title>
                      <Accordion.Content
                        active={activeFilterIndex == utils.ENTITY_DATA_INDEX}
                        style={{maxHeight: 350, overflow: 'auto'}}>
                        {this.getEntitiesFilter()}
                      </Accordion.Content>
                    </Accordion>
                    
                    <Accordion styled>
                      <Accordion.Title
                        active={activeFilterIndex == utils.CATEGORY_DATA_INDEX}
                        index={utils.CATEGORY_DATA_INDEX}
                        onClick={this.handleAccordionClick.bind(this)}>
                        <Icon name='dropdown' />
                        Categories
                      </Accordion.Title>
                      <Accordion.Content
                        active={activeFilterIndex == utils.CATEGORY_DATA_INDEX}
                        style={{maxHeight: 350, overflow: 'auto'}}>
                        {this.getCategoriesFilter()}
                      </Accordion.Content>
                    </Accordion>
                    
                    <Accordion styled>
                      <Accordion.Title
                        active={activeFilterIndex == utils.CONCEPT_DATA_INDEX}
                        index={utils.CONCEPT_DATA_INDEX}
                        onClick={this.handleAccordionClick.bind(this)}>
                        <Icon name='dropdown' />
                        Concepts
                      </Accordion.Title>
                      <Accordion.Content
                        active={activeFilterIndex == utils.CONCEPT_DATA_INDEX}
                        style={{maxHeight: 350, overflow: 'auto'}}>
                        {this.getConceptsFilter()}
                      </Accordion.Content>
                    </Accordion>
                    
                    <Accordion styled>
                      <Accordion.Title
                        active={activeFilterIndex == utils.KEYWORD_DATA_INDEX}
                        index={utils.KEYWORD_DATA_INDEX}
                        onClick={this.handleAccordionClick.bind(this)}>
                        <Icon name='dropdown' />
                        Keywords
                      </Accordion.Title>
                      <Accordion.Content
                        active={activeFilterIndex == utils.KEYWORD_DATA_INDEX}
                        style={{maxHeight: 350, overflow: 'auto'}}>
                        {this.getKeywordsFilter()}
                      </Accordion.Content>
                    </Accordion>

                    <Accordion styled>
                      <Accordion.Title
                        active={activeFilterIndex == utils.ENTITY_TYPE_DATA_INDEX}
                        index={utils.ENTITY_TYPE_DATA_INDEX}
                        onClick={this.handleAccordionClick.bind(this)}>
                        <Icon name='dropdown' />
                        Entity Types
                      </Accordion.Title>
                      <Accordion.Content
                        active={activeFilterIndex == utils.ENTITY_TYPE_DATA_INDEX}
                        style={{maxHeight: 350, overflow: 'auto'}}>
                        {this.getEntityTypesFilter()}
                      </Accordion.Content>
                    </Accordion>

                  </Grid.Column>
                  
                  {/* Results */}

                  <Grid.Column className='main-panel-column' width={9}>
                    <Grid.Row>
                      <Header as='h2' block inverted textAlign='left'>
                        <Icon name='list layout' />
                        <Header.Content>
                          Reviews
                          <Header.Subheader>
                            Show/Hide Reviews with Enrichment, Sentiment, Product and Reviewer Filters
                          </Header.Subheader>
                        </Header.Content>
                      </Header>
                      {loading ? (
                        <div className="results">
                          <div className="loader--container" style={{height: 572}}>
                            <Dimmer active inverted>
                              <Loader>Loading</Loader>
                            </Dimmer>
                          </div>
                        </div>
                      ) : data ? (
                        <div className="results">
                          <div className="row">
                            <div>
                              <Statistic.Group
                                className='stat-group'
                                size='mini'
                                color='grey'
                                items={ stat_items }
                              />
                              <Menu compact className="sort-dropdown">
                                <Icon name='sort' size='large' bordered inverted />
                                <Dropdown
                                  item
                                  onChange={ this.sortOrderChange.bind(this) }
                                  value={ sortOrder }
                                  options={ utils.sortTypes }
                                />
                              </Menu>
                            </div>
                            <div>
                              {this.getMatches()}
                            </div>
                          </div>
                        </div>
                      ) : error ? (
                        <div className="results">
                          <div className="_container _container_large">
                            <div className="row">
                              {JSON.stringify(error)}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </Grid.Row>

                    <Divider clearing hidden/>

                    {/* Pagination Menu */}

                    <Grid.Row>
                      {this.getPaginationMenu()}
                    </Grid.Row>
                  </Grid.Column>

                  <Grid.Column className='main-panel-column' width={4}>

                    {/* Sentiment Chart Region */}

                    <Grid.Row className='rrr'>
                      <SentimentChart
                        entities={entities}
                        categories={categories}
                        concepts={concepts}
                        keywords={keywords}
                        entityTypes={entityTypes}
                        term={sentimentTerm}
                        onSentimentTermChanged={this.sentimentTermChanged.bind(this)}
                      />
                    </Grid.Row>

                    <Divider hidden/>
                    <Divider/>
                    <Divider hidden/>

                    <Grid.Row>
                      <KeywordsTagCloud
                        keywords={keywords}
                      />
                    </Grid.Row>
                    
                  </Grid.Column>

                </Grid.Row>
              </Grid>
            </div>
          </Tab.Pane>
      },
      
      // Common Queries Tab
      { menuItem: { key: 'common-queries', icon: 'unordered list', content: 'Sample Queries' },
        render: () =>
          <Tab.Pane attached='bottom'>
            <div>
              <Grid className='search-grid' celled='internally'>
                { this.getPanelHeader() }
                <Grid.Row color={'blue'}>
                  <Grid.Column width={16} verticalAlign='middle' textAlign='center'>
                    <Header className='graph-panel-subheader' as='h3' textAlign='center'>
                    </Header>
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                  <Grid.Column  className='query-panel' width={16} textAlign='center'>
                    <CommonQueryPanel
                      queryData={commonQueryData}
                      categories={origCategories}
                      category={currentCommonQueryCategory}
                      queryType={currentCommonQueryType}
                      onGetCommonQueryRequest={this.fetchCommonQueryData.bind(this)}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          </Tab.Pane>
      },

      // Interactive Queries Tab
      { menuItem: { key: 'interactive-queries', icon: 'search', content: 'Interactive Queries' },
        render: () =>
          <Tab.Pane attached='bottom'>
            <div>
              <Grid className='search-grid' celled='internally'>
                { this.getPanelHeader() }
                <Grid.Row color={'blue'}>
                  <Grid.Column width={16} verticalAlign='middle' textAlign='center'>
                    <Header className='graph-panel-subheader' as='h3' textAlign='center'>
                    </Header>
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                  <Grid.Column  className='query-panel' width={16} textAlign='center'>
                    <CustomQueryPanel
                      queryData={customQueryData}
                      productNames={origProductNames}
                      reviewers={origReviewers}
                      onGetCustomQueryRequest={this.fetchCustomQueryData.bind(this)}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          </Tab.Pane>
      }

    ];

    return (
      <div>
        <Tab 
          className='tab-content'
          menu={{ inverted: true, attached: true }}
          panes={ mainTabs } />
      </div>
    );
  }
}

/**
 * parseReviewers - convert raw search results into collection of reviewers.
 */
const parseReviewers = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.REVIEWER_DATA_INDEX].results
});

/**
 * parseEntities - convert raw search results into collection of entities.
 */
const parseEntities = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.ENTITY_DATA_INDEX].results
});

/**
 * parseCategories - convert raw search results into collection of categories.
 */
const parseCategories = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.CATEGORY_DATA_INDEX].results
});

/**
 * parseConcepts - convert raw search results into collection of concepts.
 */
const parseConcepts = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.CONCEPT_DATA_INDEX].results
});

/**
 * parseKeywords - convert raw search results into collection of keywords.
 */
const parseKeywords = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.KEYWORD_DATA_INDEX].results
});

/**
 * parseEntityTypes - convert raw search results into collection of entity types.
 */
const parseEntityTypes = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.ENTITY_TYPE_DATA_INDEX].results
});

/**
 * parseProductName - convert raw search results into collection of product names.
 * NOTE product names requires a multiple nested query to find:
 * nested(enriched_text.entities).filter(enriched_text.entities.type:Product).term(enriched_text.entities.text)
 */
const parseProductNames = data => ({
  rawResponse: Object.assign({}, data),
  results: data.result.aggregations[utils.PRODUCT_NAME_INDEX].aggregations[0].aggregations[0].results
});


/**
 * scrollToMain - scroll window to show 'main' rendered object.
 */
function scrollToMain() {
  setTimeout(() => {
    const scrollY = document.querySelector('main').getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, scrollY);
  }, 0);
}

// type check to ensure we are called correctly
Main.propTypes = {
  data: PropTypes.object,
  sentiments: PropTypes.object,
  properties: PropTypes.object,
  reviewers: PropTypes.object,
  entities: PropTypes.object,
  categories: PropTypes.object,
  concepts: PropTypes.object,
  keywords: PropTypes.object,
  entityTypes: PropTypes.object,
  productNames: PropTypes.object,
  origCategories: PropTypes.object,
  origReviewers: PropTypes.object,
  origProductNames: PropTypes.object,
  searchQuery: PropTypes.string,
  selectedSentiments: PropTypes.object,
  selectedProperties: PropTypes.object,
  selectedReviewers: PropTypes.object,
  selectedEntities: PropTypes.object,
  selectedCategories: PropTypes.object,
  selectedConcepts: PropTypes.object,
  selectedKeywords: PropTypes.object,
  selectedEntityTypes: PropTypes.object,
  numMatches: PropTypes.number,
  numPositive: PropTypes.number,
  numNeutral: PropTypes.number,
  numNegative: PropTypes.number,
  currentPage: PropTypes.string,
  sortOrder: PropTypes.string,
  sentimentFilter: PropTypes.string,
  productNameFilter: PropTypes.string,
  reviewerIdFilter: PropTypes.string,
  commonQueryData: PropTypes.array,
  currentCommonQueryCategory: PropTypes.string,
  currentCommonQueryType: PropTypes.number,
  customQueryData: PropTypes.object,
  sentimentTerm: PropTypes.string,
  error: PropTypes.object
};

module.exports = Main;
