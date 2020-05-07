/* eslint-disable react/no-multi-comp */
import React from 'react'
import {IntentLink} from 'part:@sanity/base/router'
import styles from './ListItem.css'
import UserAvatar from './UserAvatar'
import {GlobalPresence, PresentUser, Size, Status, User} from './types'
import {flatten} from 'lodash'

type Props = {
  status: Status
  user: User
  size?: Size
  onClick?: () => void
}

export function ListItem({user, status = 'inactive', size = 'small'}: Props) {
  return (
    <div className={styles.inner} data-size={size}>
      <div className={styles.avatar}>
        <UserAvatar user={user} size={size} status={status} />
      </div>
      <div className={styles.userInfo}>
        <span className={styles.name} title={user.displayName}>
          {user.displayName}
        </span>
      </div>
    </div>
  )
}

type GlobalPresenceListItemProps = {
  presence: GlobalPresence
  size?: Size
  onClick?: () => void
}

export default function GlobalPresenceListItem(props: GlobalPresenceListItemProps) {
  const {presence, onClick, size} = props
  const documentId = presence.locations.map(location => location.documentId)
  const item = (
    <ListItem user={presence.user} status={presence.status} onClick={onClick} size={size} />
  )
  return documentId ? (
    <IntentLink className={styles.intentLink} intent="edit" params={{id: documentId}}>
      {item}
    </IntentLink>
  ) : (
    item
  )
}
