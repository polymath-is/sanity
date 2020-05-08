/* eslint-disable react/no-multi-comp */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React from 'react'
import styles from './presentUserList.css'
import {MAX_AVATARS} from './constants'
import {Position, PresentUser} from './types'
import PopoverList from './PopoverList'
import {splitRight} from './utils'
import StackCounter from './StackCounter'

type ContainerProps = {
  presence: PresentUser[]
  position: Position
  avatarComponent: React.ComponentType<{userId: string; sessionId: string; position: Position}>
  children?: React.ReactNode
}

const AVATAR_WIDTH = 21

export function PresentUserList({
  presence,
  position,
  avatarComponent: AvatarComponent
}: ContainerProps) {
  const [hiddenUsers, visibleUsers] = splitRight(presence, 1)

  const avatars = [
    ...visibleUsers.map(presentUser => ({
      key: presentUser.user.id,
      element: (
        <AvatarComponent
          // @ts-ignore
          position={position}
          userId={presentUser.user.id}
          sessionId={presentUser.user.id}
        />
      )
    })),
    hiddenUsers.length >= MAX_AVATARS - 1
      ? {
          key: 'counter',
          element: <StackCounter count={hiddenUsers.length} />
        }
      : null
  ].filter(Boolean)

  // Calculate a width based on avatar length to position the popoverlist in the center
  const width = avatars.length > MAX_AVATARS ? (AVATAR_WIDTH - 8) * MAX_AVATARS + 6 : 0

  return (
    <div className={styles.root}>
      // @ts-ignore
      <PopoverList presence={presence} disabled={hiddenUsers.length <= 1}>
        <div className={styles.inner} style={{height: AVATAR_WIDTH, minWidth: width}}>
          {avatars.map((av, i) => (
            <div
              key={av.key}
              style={{
                position: 'absolute',
                right: 0,
                transform: `translate3d(${-AVATAR_WIDTH + i * -(AVATAR_WIDTH - 8)}px, 0px, 0px)`,
                transitionProperty: 'transform',
                transitionDuration: '200ms',
                transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
                zIndex: -i,
                marginRight: -AVATAR_WIDTH
              }}
            >
              {av.element}
            </div>
          ))}
        </div>
      </PopoverList>
    </div>
  )
}
