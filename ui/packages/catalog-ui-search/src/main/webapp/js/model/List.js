/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
const Backbone = require('backbone')
const Query = require('./Query')
const cql = require('../cql.js')
const Common = require('../Common.js')
const properties = require('../properties')
const _ = require('lodash')
require('backbone-associations')

const iconMap = {
  folder: 'fa fa-folder',
  target: 'fa fa-bullseye',
  video: 'fa fa-file-video-o',
  text: 'fa fa-file-text-o',
  word: 'fa fa-file-word-o',
  powerpoint: 'fa fa-file-powerpoint-o',
  excel: 'fa fa-file-excel-o',
  pdf: 'fa fa-file-pdf-o',
  image: 'fa fa-file-image-o',
  audio: 'fa fa-file-audio-o',
  code: 'fa fa-file-code-o',
  archive: 'fa fa-file-archive-o',
  tasks: 'fa fa-tasks',
}

function getRelevantIcon(iconName) {
  return iconMap[iconName]
}

function generateCql(bookmarks) {
  if (bookmarks.length === 0) {
    return ''
  }
  return cql.write({
    type: 'AND',
    filters: [
      {
        type: 'OR',
        filters: bookmarks.map(id => ({
          type: '=',
          value: id,
          property: '"id"',
        })),
      },
      {
        type: 'ILIKE',
        value: '*',
        property: '"metacard-tags"',
      },
    ],
  })
}

module.exports = Backbone.AssociatedModel.extend(
  {
    defaults() {
      return {
        id: Common.generateUUID(),
        title: 'Untitled List',
        'list.cql': '',
        'list.icon': 'folder',
        'list.bookmarks': [],
        query: undefined,
        uploadEnabled: properties.isUploadEnabled(),
      }
    },
    relations: [
      {
        type: Backbone.One,
        key: 'query',
        relatedModel: Query.Model,
        isTransient: true,
      },
    ],
    initialize() {
      this.set(
        'query',
        new Query.Model({
          cql: generateCql(this.get('list.bookmarks')),
        })
      )
      this.listenTo(
        this,
        'update:list.bookmarks change:list.bookmarks',
        this.updateQuery
      )
    },
    removeBookmarks(bookmarks) {
      if (!Array.isArray(bookmarks)) {
        bookmarks = [bookmarks]
      }
      this.set(
        'list.bookmarks',
        this.get('list.bookmarks').filter(id => bookmarks.indexOf(id) === -1)
      )
    },
    addBookmarks(bookmarks) {
      if (!Array.isArray(bookmarks)) {
        bookmarks = [bookmarks]
      }
      this.set('list.bookmarks', _.union(this.get('list.bookmarks'), bookmarks))
    },
    updateQuery() {
      this.get('query').set('cql', generateCql(this.get('list.bookmarks')))
    },
    getIcon() {
      return getRelevantIcon(this.get('list.icon'))
    },
    isEmpty() {
      return this.get('list.bookmarks').length === 0
    },
  },
  {
    getIconMapping() {
      return iconMap
    },
    getIconMappingForSelect() {
      return _.map(iconMap, (value, key) => {
        return {
          label: key,
          value: key,
          class: value,
        }
      })
    },
  }
)
