import React from 'react'
import {User} from './types'
import {split, splitRight} from './utils'
import {uniqBy, sortBy} from 'lodash'
import {AVATAR_WIDTH, MAX_AVATARS} from './constants'
import {PopoverList, StackCounter} from './index'
import styles from './FieldPresence.css'
import UserAvatar from './UserAvatar'

interface FieldPresence {
  user: User
  sessionId: string
  lastActiveAt: string
}

interface Props {
  presence: FieldPresence[]
  position?: any
}

export function FieldPresence({presence, position}: Props) {
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

  return (
    <div className={styles.root}>
      <div className={styles.inner} style={{height: AVATAR_WIDTH}}>
        {avatars.map((av, i) => (
          <div
            key={av.key}
            style={{
              position: 'absolute',
              transform: `translate3d(${i * -AVATAR_WIDTH}px, 0px, 0px)`,
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
