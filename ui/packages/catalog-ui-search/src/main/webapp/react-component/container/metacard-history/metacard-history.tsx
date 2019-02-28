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
import fetch from '../../utils/fetch'
const store = require('../../../js/store.js')
const Common = require('../../../js/Common.js')
const ResultUtils = require('../../../js/ResultUtils.js')
const moment = require('moment')
const announcement = require('component/announcement')
import MetacardHistoryPresentation from '../../presentation/metacard-history'

type Props = {
  selectionInterface: any
}

type State = {
  model: Backbone.Model
  history: any
  selectedVersion: any
  loading: boolean
}

class MetacardHistory extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    let model
    if (props.selectionInterface) {
      model = props.selectionInterface.getSelectedResults().first()
    } else {
      model = store.getSelectedResults().first()
    }

    this.state = {
      model: model,
      history: [],
      selectedVersion: undefined,
      loading: true,
    }

    this.loadData()
  }

  loadData = () => {
    setTimeout(() => {
      fetch(`./internal/history/${this.state.model.get('metacard').get('id')}`)
        .then(response => {
          if (response.status === 204) {
            return []
          }
          return response.json()
        })
        .then(history => {
          history.sort((historyItem1: any, historyItem2: any) => {
            return (
              moment.unix(historyItem2.versioned) -
              moment.unix(historyItem1.versioned)
            )
          })
          history.forEach((historyItem: any, index: any) => {
            historyItem.niceDate = Common.getMomentDate(
              moment.unix(historyItem.versioned.seconds).valueOf()
            )
            historyItem.versionNumber = history.length - index
          })
          this.setState({ history, loading: false })
        })
    }, 1000)
  }

  clickWorkspace = (event: any) => {
    const selectedVersion = event.currentTarget.getAttribute('data-id')
    this.setState({ selectedVersion })
  }

  revertToSelectedVersion = () => {
    this.setState({ loading: true })
    fetch(
      `./internal/history/revert/${this.state.model
        .get('metacard')
        .get('id')}/${this.state.selectedVersion}`
    )
      .then(response => response.json())
      .then(() => {
        this.state.model
          .get('metacard')
          .get('properties')
          .set('metacard-tags', ['revision'])
        ResultUtils.refreshResult(this.state.model)
      })
      .then(() => {
        setTimeout(() => {
          //let solr flush
          this.state.model.trigger('refreshdata')
          if (
            this.state.model
              .get('metacard')
              .get('properties')
              .get('metacard-tags')
              .indexOf('revision') >= 0
          ) {
            announcement.announce({
              title: 'Waiting on Reverted Data',
              message:
                "It's taking an unusually long time for the reverted data to come back.  The item will be put in a revisionlike state (read-only) until data returns.",
              type: 'warn',
            })
          }
          this.loadData()
        }, 2000)
      })
  }

  render() {
    const { history, selectedVersion, loading } = this.state
    return (
      <MetacardHistoryPresentation
        clickWorkspace={this.clickWorkspace}
        revertToSelectedVersion={this.revertToSelectedVersion}
        history={history}
        selectedVersion={selectedVersion}
        loading={loading}
      />
    )
  }
}

export default hot(module)(MetacardHistory)
