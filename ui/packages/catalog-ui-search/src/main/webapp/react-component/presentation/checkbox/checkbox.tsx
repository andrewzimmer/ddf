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
import * as React from 'react'
import { hot } from 'react-hot-loader'
import styled from '../../styles/styled-components'

type Props = {
  isSelected: boolean
  onClick?: (e: any) => void
}

const Box = styled.input`
  display: inline;
  margin-right: ${props => props.theme.mediumSpacing} !important;
  margin-top: 0px !important;
  text-align: center;
  vertical-align: middle;
`
const Checkbox = (props: Props) => {
  const isSelected = props.isSelected
  return <Box type="checkbox" checked={isSelected} onChange={props.onClick} />
}

export default hot(module)(Checkbox)
