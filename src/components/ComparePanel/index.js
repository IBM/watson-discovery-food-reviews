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
import { Grid, Header, Table } from 'semantic-ui-react';

/**
 * This object renders a simple table comparing the difference of using
 * discovery with and without a WKS model.
 */
export default class ComparePanel extends React.Component {
  constructor(...props) {
    super(...props);
  }

  /**
   * render - return the comparison table object to render.
   */
  render() {
    
    return (
      <div>
        <Grid>

          <Grid.Row>
            <Grid.Column width={16} textAlign='center'>
              <Header className='graph-panel-subheader' as='h3' textAlign='center'>
                A Comparison of Query Results Highlighting WKS-enable Search Result improvement 
              </Header>
            </Grid.Column>
            <Grid.Column className='compare-panel-table' width={16} textAlign='center'>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className='compare-table-header'>
                      Query
                    </Table.HeaderCell>
                    <Table.HeaderCell className='compare-table-header'>
                      Without WKS
                    </Table.HeaderCell>
                    <Table.HeaderCell className='compare-table-header'>
                      With WKS
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell className='compare-table-row-dark'>
                      What are the major side effects of dibetes treatments?
                    </Table.Cell>
                    <Table.Cell className='compare-table-row-dark'>
                      {  '20 documents with key word hits of "side effects", "diabetes", and "treatments" '}
                    </Table.Cell>
                    <Table.Cell className='compare-table-row-dark'>
                      Get back 6 documents where WKS identified that there is a side effect with a relation to the treatment
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className='compare-table-row-light'>
                      Is Hypoglycaemia a side effect of treatments
                    </Table.Cell>
                    <Table.Cell className='compare-table-row-light'>
                      Get back documents with hypoglycaemia and side effects in the document
                    </Table.Cell>
                    <Table.Cell className='compare-table-row-light'>
                      Get back 9 documents restricted to where WKS found hypoglycaemia as a side effect
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className='compare-table-row-dark'>
                      I want to find the top negative side effects for diabetes treatments
                    </Table.Cell>
                    <Table.Cell className='compare-table-row-dark'>
                      Highlighted health conditions mentioned in the document
                    </Table.Cell>
                    <Table.Cell className='compare-table-row-dark'>
                      Highlights targeted side effects found as a result of diabetes
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}
