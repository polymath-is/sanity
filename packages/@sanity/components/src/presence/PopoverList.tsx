/* eslint-disable react/no-multi-comp */
import React from 'react'
import styles from './PopoverList.css'
import ListItem from './ListItem'
import {User, Size, Position} from './types'
import {Tooltip} from 'react-tippy'
import Avatar from './Avatar'

type Props = {
  userList: User[]
  avatarSize?: Size
  position?: 'top' | 'bottom'
  arrowPosition?: Position
  withStack?: boolean
  trigger?: 'mouseenter' | 'click'
  children?: any
  distance?: number
  disabled?: boolean
}

export default function PopoverList({
  userList = [],
  position = 'top',
  distance = 10,
  avatarSize,
  withStack = true,
  trigger = 'mouseenter',
  children,
  disabled = false,
  arrowPosition
}: Props) {
  const html = (
    <ul className={styles.list}>
      {userList.length > 0 ? (
        userList.map(user => (
          <li key={user.identity}>
            <ListItem
              id={user.identity}
              status={user.status}
              sessions={user?.sessions}
              size={avatarSize}
            />
          </li>
        ))
      ) : (
        <li className={styles.empty}>Looks like it's just you...</li>
      )}
    </ul>
  )
  return (
    <Tooltip
      html={html}
      disabled={disabled}
      interactive
      position={position}
      trigger={trigger}
      animation="scale"
      arrow
      theme="light"
      distance={distance}
      duration={50}
    >
      {withStack && userList.length > 1 && (
        <Avatar label="" position={arrowPosition} color="grey">
          +{userList.length}
        </Avatar>
      )}
      {children && children}
    </Tooltip>
  )
}
