import {PresenceTransitionRenderer} from './PresenceTransitionRenderer'
import React from 'react'
import {Tracker} from '@sanity/overlayer'
import {AbsoluteOverlayRenderer} from './AbsoluteOverlayRenderer'

export function Overlay(props: {children: React.ReactNode}) {
  return <Tracker component={AbsoluteOverlayRenderer}>{props.children}</Tracker>
}
