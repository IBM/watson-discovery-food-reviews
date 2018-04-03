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
import { Container, List, Table, Grid, Divider } from 'semantic-ui-react';

/**
 * This object renders the results of the search query on the web page. 
 * Each result item, or 'match', will display a title, description, and
 * sentiment value.
 */

const Match = props => (
  <div>
    <Grid className='matches-grid'>
      <Grid.Row>
        <Grid.Column width={12} floated='left'>
          <List>
            <List.Item className='matches-list-item'>
              <List.Content>
                <List.Header className='matches-title'>
                  <List.Description>
                    <span dangerouslySetInnerHTML={{__html: props.title}}></span>
                  </List.Description>
                </List.Header>
              </List.Content>
              <List.Content>
                <List.Description>
                  <span dangerouslySetInnerHTML={{__html: props.text}}></span>
                </List.Description>
              </List.Content>
            </List.Item>
          </List>
        </Grid.Column>
        <Grid.Column width={4} floated='right'>
          <Table collapsing compact='very' size='small'>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Date:</Table.Cell>
                <Table.Cell className='ratings-data-value'>{ props.date }</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell >Rating:</Table.Cell>
                <Table.Cell className='ratings-data-value'>{ props.score }</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  Helpfulness Rating:
                </Table.Cell>
                <Table.Cell className='ratings-data-value'>{ props.helpRating }%</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Sentiment:</Table.Cell>
                <Table.Cell  className='ratings-data-value'
                  style={{backgroundColor: props.sentimentColor}}>
                  { props.sentiment }
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>

    <Divider clearing/>

  </div>
);

// type check to ensure we are called correctly
Match.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  helpRating: PropTypes.number.isRequired,
  sentiment: PropTypes.number.isRequired,
  sentimentColor: PropTypes.string.isRequired
};

const Matches = props => (
  <div>
    <Container fluid textAlign='left'>
      {/* <div className="match-entry-list" style={{height: 500, overflow: 'auto'}}> */}
      <div className="match-entry-list">
        <List divided verticalAlign='middle'>
          {props.matches.map(item =>
            <Match
              key={ item.id }
              title={ getTitle(item) }
              text={ getText(item) }
              highlightText={ item.highlightText }
              score={ item.score }
              date={ item.date }
              helpRating ={ item.helpRating }
              sentiment={ Math.round(item.sentimentScore * 100) / 100 }
              sentimentColor={ getSentimentColor(item) }
            />)
          }
        </List>
      </div>
    </Container>
  </div>
);

// type check to ensure we are called correctly
Matches.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired
};

// format title, setting backgroud color for all highlighted words
const getTitle = (item) => {
  if (item.highlight.showHighlight && item.highlight.field === 'title') {
    var str = '<style>hilite {background:#ffffb3;}</style>';
    item.highlight.indexes.forEach(function(element) {
      str = str + item.title.substring(0, element.startIdx) +
        '<hilite>' +
        item.title.substring(element.startIdx, element.endIdx) +
        '</hilite>' +
        item.title.substring(element.endIdx);
    });
    return str;
  } else {
    return item.title ? item.title : 'No Title';
  }
};

// format text, setting background color for all highlighted words
const getText = (item) => {
  if (item.highlight.showHighlight && item.highlight.field === 'text') {
    var str = '<style>hilite {background:#ffffb3;}</style>';
    var currIdx = 0;
    item.highlight.indexes.forEach(function(element) {
      str = str + item.text.substring(currIdx, element.startIdx) +
        '<hilite>' +
        item.text.substring(element.startIdx, element.endIdx) +
        '</hilite>';
      currIdx = element.endIdx;
    });
    str = str + item.text.substring(currIdx);
    return str;
  } else {
    return item.text ? item.text : 'No Description';
  }
};

/**
 * getSentimentColor - set background color for cell based on 
 * positive or negative sentiment.
 */
const getSentimentColor = item => {
  if (item.sentimentLabel === 'negative') {
    return 'rgb(227, 122, 110)';
  } else {
    return 'rgb(115, 203, 173)';
  }
};

// export so we are visible to parent
module.exports = Matches;
