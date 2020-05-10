/* eslint-disable @typescript-eslint/no-use-before-define,react/no-multi-comp */
import React from 'react'
import {splitRight} from './utils'
import {sortBy, uniqBy} from 'lodash'
import {AVATAR_WIDTH, MAX_AVATARS} from './constants'
import {StackCounter} from './index'
import styles from './FieldPresence.css'
import UserAvatar from './UserAvatar'
import {PresenceRegion} from './Region'
import {FieldPresence as FieldPresenceT, Position} from './types'

interface Props {
  presence: FieldPresenceT[]
}

export function FieldPresence({presence}: Props) {
  return <PresenceRegion presence={presence} component={FieldPresenceInner} />
}

interface InnerProps {
  presence: FieldPresenceT[]
  position: Position
}

function FieldPresenceInner({presence, position}: InnerProps) {
  const sorted = sortBy(
    uniqBy(presence || [], item => item.user.id),
    presence => presence.lastActiveAt
  )
  const [hidden, visible] = splitRight(sorted, MAX_AVATARS)

  const avatars = [
    ...visible.reverse().map(visible => ({
      key: visible.user.id,
      element: <UserAvatar position={position} user={visible.user} />
    })),
    hidden.length >= 2
      ? {
          key: 'counter',
          element: <StackCounter count={hidden.length} />
        }
      : null
  ].filter(Boolean)

  const width = 8 + (AVATAR_WIDTH - 8) * MAX_AVATARS
  const right = width - AVATAR_WIDTH
  return (
    <div className={styles.root}>
      <div className={styles.inner} style={{width: width}}>
        {avatars.map((av, i) => (
          <div
            key={av.key}
            style={{
              position: 'absolute',
              transform: `translate3d(${right - (AVATAR_WIDTH - 8) * i}px, 0px, 0px)`,
              transitionProperty: 'transform',
              transitionDuration: '200ms',
              transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
              zIndex: 100 - i
            }}
          >
            {av.element}
          </div>
        ))}
      </div>
    </div>
  )
}
