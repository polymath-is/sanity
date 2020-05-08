/* eslint-disable react/no-multi-comp */
import {useId} from '@reach/auto-id'
import AvatarProvider from './UserAvatar'
import React from 'react'
import {PopoverList} from './index'
import {RegionReporter} from '@sanity/overlayer'
import {FieldPresence, Position, PresentUser} from './types'

type RegionProps = {
  presence: PresentUser[]
  position: Position
}

type Props = {
  presence: FieldPresence[]
  component: React.ComponentType<{presence: FieldPresence[]}>
}
export function PresenceRegion({presence, component}: {presence: FieldPresence[]}) {
  return <RegionReporter id={useId()} data={{presence}} component={component} />
}
