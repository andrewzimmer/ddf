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
// import ExtensionPoints from '../extension-points'
import styled from '../../react-component/styles/styled-components'
// import { hot } from 'react-hot-loader'
const { Menu, MenuItem } = require('../../react-component/menu')
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

const StyledDropdown = styled(Dropdown)`
  height: 100%;
  line-height: inherit;
`

export const SearchInteractionMenu = ({
  onClick,
  children,
}: {
  onClick: (value: any) => void
  children: any
}) => {
  return <Menu onChange={(value: any) => onClick(value)}>{children}</Menu>
}

export const SearchFormMenuItem = ({
  children,
  key,
  value,
  title,
  help,
  onClick,
  onHover
}: {
  children: any
  key: string
  value: string
  title: string
  help: string
  onClick?: () => void
  onHover?: (value:any) => void
}) => {
  const item = onClick ? (
    <MenuItem
      key={key}
      value={value}
      title={title}
      data-help={help}
      onClick={onClick}
    //   onHover={onHover}
    >
      {children}
    </MenuItem>
  ) : (
    <MenuItem key={key} value={value} title={title} data-help={help} onHover={onHover}>
      {children}
    </MenuItem>
  )
  return item
}

export const CustomSearchFormMenuItem = ({
  key,
  value,
  title,
  help,
  model,
}: {
  key: string
  value: string
  title: string
  help: string
  model: any
}) => {
  return (
    <MenuItem
      key={key}
      value={value}
      title={title}
      data-help={help}
      onClick={() => {}}
    >
      <StyledDropdown
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
      </StyledDropdown>
    </MenuItem>
  )
}

// const render = (props: Props) => {
//   const { triggerQueryForm, triggerReset, model } = props
//   return (
//     <Menu onChange={(formId: any) => triggerQueryForm(formId)}>
//       {ExtensionPoints.queryForms.filter(form => !form.disabled).map(form => {
//         return (
//           <MenuItem
//             key={form.id}
//             value={form.id}
//             title={`Use the ${form.title} Form to construct the search.`}
//             data-help={`Use the ${form.title} Form to construct the search.`}
//           >
//             <Text>
//               <Icon className="fa fa-search" />
//               {form.title}
//             </Text>
//           </MenuItem>
//         )
//       })}
//       <div className="is-divider" />
//       <MenuItem
//         key={'formSelector'}
//         value={'formSelector'}
//         title="Change the form used to construct the search."
//         data-help="Change the form used to construct the search."
//         onClick={() => {}}
//       >
//         <StyledDropdown
//           anchor={
//             <Text>
//               <Icon className="cf cf-search-forms" />
//               Use Another Search Form
//             </Text>
//           }
//         >
//           <Menu onChange={() => {}}>
//             <SearchFormList model={model} />
//           </Menu>
//         </StyledDropdown>
//       </MenuItem>
//       <div className="is-divider" />
//       <MenuItem
//         key={'reset'}
//         value={'reset'}
//         title="Resets the search form."
//         data-help="Resets the search form."
//         onClick={() => triggerReset()}
//       >
//         <Text>
//           <Icon className="fa fa-undo" />
//           Reset
//         </Text>
//       </MenuItem>
//     </Menu>
//   )
// }

// export default hot(module)(render)
