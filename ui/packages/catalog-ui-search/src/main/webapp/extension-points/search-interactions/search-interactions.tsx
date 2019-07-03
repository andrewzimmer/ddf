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
import { hot } from 'react-hot-loader'
import ExtensionPoints from '../extension-points'

import SearchInteractionsContainer from './search-interactions.container'
import {
  Props as PresentationProps,
  SearchInteractionMenu,
  SearchFormMenuItem,
  CustomSearchFormMenuItem,
  Text,
  Divider,
  Icon,
} from './search-interactions.presentation'

export type SearchInteractionProps = {
  model: any
  onClose: () => void
}

const SearchInteractions = (props: SearchInteractionProps) => (
  <SearchInteractionsContainer model={props.model} onClose={props.onClose}>
    {(props: PresentationProps) => {
      return (
        <SearchInteractionMenu
          onClick={(formId: any) => props.triggerQueryForm(formId)}
        >
          {ExtensionPoints.queryForms.map(form => {
            return (
              <SearchFormMenuItem
                key={form.id}
                value={form.id}
                title={`Use the ${form.title} Form to construct the search.`}
                help={`Use the ${form.title} Form to construct the search.`}
              >
                <Text>
                  <Icon className="fa fa-search" />
                  {form.title}
                </Text>
              </SearchFormMenuItem>
            )
          })}
          <Divider />
          <CustomSearchFormMenuItem
            model={props.model}
            key={'formSelector'}
            value={'formSelector'}
            title="Change the form used to construct the search."
            help="Change the form used to construct the search."
          />
          <Divider />
          <SearchFormMenuItem
            key={'reset'}
            value={'reset'}
            title="Resets the search form."
            help="Resets the search form."
            onClick={() => props.triggerReset()}
          >
            <Text>
              <Icon className="fa fa-undo" />
              Reset
            </Text>
          </SearchFormMenuItem>
        </SearchInteractionMenu>
      )
    }}
  </SearchInteractionsContainer>
)

export default hot(module)(SearchInteractions)
