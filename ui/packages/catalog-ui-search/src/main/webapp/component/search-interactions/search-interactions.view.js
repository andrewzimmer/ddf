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

import * as React from 'react'
const Marionette = require('marionette')
const template = require('./search-interactions.hbs')
const CustomElements = require('../../js/CustomElements.js')
const DropdownModel = require('../dropdown/dropdown.js')
const SearchFormSelectorDropdownView = require('../dropdown/search-form-selector/dropdown.search-form-selector.view.js')
const ConfirmationView = require('../confirmation/confirmation.view.js')
const user = require('../singletons/user-instance.js')
const properties = require('../../js/properties.js')

module.exports = Marionette.LayoutView.extend({
  template() {
    return (
      <React.Fragment>
        {this.options.searchFormTitles.map(form => {
          return (
            <div
              className="interaction interaction-form"
              title={`Use the ${form} Form to construct the search.`}
              data-help={`Use the ${form} Form to construct the search.`}
              onClick={() => this.triggerFormSwitch(form)}
            >
              <div className="interaction-icon fa fa-search" />
              <div className="interaction-text">{form}</div>
            </div>
          )
        })}
        <div className="is-divider composed-menu" />
        <div
          className="interaction interaction-type"
          title="Change the form used to construct the search."
          data-help="Change the form used to construct the search."
        />
        <div className="is-divider composed-menu" />
        <div
          className="interaction interaction-reset"
          title="Resets the search form."
          data-help="Resets the search form."
          onClick={this.triggerReset}
        >
          <div className="interaction-icon fa fa-undo" />
          <div className="interaction-text">Reset</div>
        </div>
      </React.Fragment>
    )
  },
  tagName: CustomElements.register('search-interactions'),
  className: 'composed-menu',
  regions: {
    searchType: '.interaction-type',
  },
  onRender() {
    this.listenTo(
      this.model,
      'change:type closeDropdown',
      this.triggerCloseDropdown
    )
    this.generateSearchFormSelector()
  },
  generateSearchFormSelector() {
    this.searchType.show(
      new SearchFormSelectorDropdownView({
        model: new DropdownModel(),
        modelForComponent: this.model,
        selectionInterface: this.options.selectionInterface,
      }),
      {
        replaceElement: true,
      }
    )
  },
  triggerCloseDropdown() {
    this.$el.trigger('closeDropdown.' + CustomElements.getNamespace())
  },
  triggerReset() {
    this.listenTo(
      ConfirmationView.generateConfirmation({
        prompt: 'Are you sure you want to reset the search?',
        no: 'Cancel',
        yes: 'Reset',
      }),
      'change:choice',
      function(confirmation) {
        if (confirmation.get('choice')) {
          const defaults =
            this.model.get('type') === 'custom'
              ? this.model.toJSON()
              : undefined
          this.model.resetToDefaults(defaults)
          this.triggerCloseDropdown()
        }
      }.bind(this)
    )
  },
  triggerFormSwitch(title) {
    this.model.set('type', title)
    user.getQuerySettings().set('type', title)
    user.savePreferences()
    this.triggerCloseDropdown()
  },
  serializeData() {
    return {
      experimental: properties.hasExperimentalEnabled(),
    }
  },
})
