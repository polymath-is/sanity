/* eslint-disable react/no-multi-comp */
import React from 'react'
import {IntentLink} from 'part:@sanity/base/router'
import styles from './ListItem.css'
import UserAvatar from './UserAvatar'
import {PresentUser, Size, Status} from './types'
import {flatten} from 'lodash'

function Content({
  presentUser,
  status = 'inactive',
  size = 'small'
}: {
  presentUser: PresentUser
  status?: Status
  size?: Size
}) {
  return (
    <div className={styles.inner} data-size={size}>
      <div className={styles.avatar}>
        <UserAvatar user={presentUser.user} size={size} status={status} />
      </div>
      <div className={styles.userInfo}>
        <span className={styles.name} title={presentUser.user.displayName}>
          {presentUser.user.displayName}
        </span>
      </div>
    </div>
  )
}

type Props = {
  status: Status
  presentUser: PresentUser
  size?: Size
  onClick?: () => void
}

export default function ListItem(props: Props) {
  const {presentUser} = props

  const documentId = flatten(
    presentUser.sessions.map(session => session.locations.map(loc => loc.documentId))
  )[0]

  if (documentId) {
    return (
      <IntentLink className={styles.intentLink} intent="edit" params={{id: documentId}}>
        <Content presentUser={presentUser} {...props} />
      </IntentLink>
    )
  }
  return <Content presentUser={presentUser} {...props} />
}
