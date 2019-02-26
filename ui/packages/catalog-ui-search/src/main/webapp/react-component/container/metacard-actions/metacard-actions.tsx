/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/

import { hot } from 'react-hot-loader'
import * as React from 'react'
const _ = require('underscore')
import styled from '../../styles/styled-components'
const store = require('../../../js/store.js')
import MapActions from '../map-actions'

type Props = {
  options: any
}

type State = {
  model: Backbone.Model
  exportActions: any
  otherActions: any
}

const Root = styled.div`
  overflow: auto;
  height: 100%;
  padding: 0px ${props => props.theme.largeSpacing};

  .is-header {
    text-align: left;
  }
  .actions {
    padding: 0px ${props => props.theme.largeSpacing};
  }
  .map-actions {
    margin-top: ${props => props.theme.minimumSpacing};
  }
  a {
    display: block;
    margin-top: ${props => props.theme.minimumSpacing};
  }
`

class MetacardActions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    let model
    if (props.options._view.options.selectionInterface) {
      model = props.options._view.options.selectionInterface
        .getSelectedResults()
        .first()
    } else {
      model = store.getSelectedResults().first()
    }

    this.state = {
      model: model,
      exportActions: _.sortBy(
        model.getExportActions().map((action: any) => ({
          url: action.get('url'),
          title: action.getExportType(),
        })),
        (action: any) => action.title.toLowerCase()
      ),
      otherActions: _.sortBy(
        model.getOtherActions().map((action: any) => ({
          url: action.get('url'),
          title: action.get('title'),
        })),
        (action: any) => action.title.toLowerCase()
      ),
    }
  }

  render() {
    const { exportActions, otherActions, model } = this.state
    return (
      <Root>
        <div className="is-divider" />
        <div className="is-header">Export as:</div>
        <div className="is-divider" />
        <div className="actions">
          {exportActions.map((exportAction: any) => {
            return (
              <a href={exportAction.url} target="_blank" key={exportAction.url}>
                {exportAction.title}
              </a>
            )
          })}
        </div>
        <div className="is-divider" />
        <div className="map-actions">
          <MapActions model={model} />
        </div>

        {otherActions.length !== 0 && (
          <>
            <div className="is-header">Various:</div>
            <div className="is-divider" />
            <div className="actions">
              {otherActions.map((otherAction: any) => {
                return (
                  <a
                    href={otherAction.url}
                    target="_blank"
                    key={otherAction.url}
                  >
                    {otherAction.title}
                  </a>
                )
              })}
            </div>
            <div className="is-divider" />
          </>
        )}
      </Root>
    )
  }
}

export default hot(module)(MetacardActions)
