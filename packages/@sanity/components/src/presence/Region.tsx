/* eslint-disable react/no-multi-comp */
import {useId} from '@reach/auto-id'
import AvatarProvider from './UserAvatar'
import React from 'react'
import {PopoverList} from './index'
import {RegionReporter} from '@sanity/overlayer'
import {Position, PresentUser} from './types'

type RegionReporterProps = {
  presence: PresentUser[]
  position: Position
}

export function PresenceRegion({presence, component, data}) {
  return <RegionReporter id={useId()} data={{presence, ...data}} component={component} />
}

export function PresenceContainerRegion({presence}: RegionReporterProps) {
  return (
    <PresenceRegion
      presence={presence}
      data={{avatarComponent: AvatarProvider}}
      component={PopoverList}
    />
  )
}
