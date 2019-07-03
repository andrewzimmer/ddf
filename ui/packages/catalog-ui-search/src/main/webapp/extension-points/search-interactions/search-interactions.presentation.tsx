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
import styled from '../../react-component/styles/styled-components'
const { Menu } = require('../../react-component/menu')
const Dropdown = require('../../react-component/dropdown')
const SearchFormList = require('../../component/search-form-list/search-form-list')

export type Props = {
  triggerQueryForm: (formId: any) => void
  triggerReset: () => void
  model: any
}

export const Divider = () => {
  return <div className="is-divider" />
}

export const Icon = styled.div`
  display: inline-block;
  text-align: center;
  width: ${({ theme }) => theme.minimumButtonSize};
  line-height: ${({ theme }) => theme.minimumButtonSize};
  height: ${({ theme }) => theme.minimumButtonSize};
`

export const Text = styled.div`
  width: 100%;
  display: inline-block;
  vertical-align: top;
  line-height: ${({ theme }) => theme.minimumButtonSize};
  height: ${({ theme }) => theme.minimumButtonSize};
`

export const CustomSearchFormDropdown = ({ model }: { model: any }) => {
  return (
    <Dropdown
      anchor={
        <Text>
          <Icon className="cf cf-search-forms" />
          Use Another Search Form
        </Text>
      }
    >
      <Menu onChange={() => {}}>
        <SearchFormList model={model} />
      </Menu>
    </Dropdown>
  )
}
