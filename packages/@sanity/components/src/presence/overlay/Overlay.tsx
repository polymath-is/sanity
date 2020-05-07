import {PresenceTransitionRenderer} from './PresenceTransitionRenderer'
import React from 'react'
import {Tracker} from '@sanity/overlayer'

export function Overlay(props: {children: React.ReactNode}) {
  return <Tracker component={PresenceTransitionRenderer}>{props.children}</Tracker>
}
