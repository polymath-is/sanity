/* eslint-disable react/no-multi-comp */
import React from 'react'
import {IntentLink} from 'part:@sanity/base/router'
import styles from './ListItem.css'
import UserAvatar from './UserAvatar'
import {Collaborator, Size, Status} from './types'
import {flatten} from 'lodash'

function Content({
  collaborator,
  status = 'inactive',
  size = 'small'
}: {
  collaborator: Collaborator
  status?: Status
  size?: Size
}) {
  return (
    <div className={styles.inner} data-size={size}>
      <div className={styles.avatar}>
        <UserAvatar user={collaborator.user} size={size} status={status} />
      </div>
      <div className={styles.userInfo}>
        <span className={styles.name} title={collaborator.user.displayName}>
          {collaborator.user.displayName}
        </span>
      </div>
    </div>
  )
}

type Props = {
  status: Status
  collaborator: Collaborator
  size?: Size
  onClick?: () => void
}

export default function ListItem(props: Props) {
  const {collaborator} = props

  const documentId = flatten(
    collaborator.sessions.map(session => session.locations.map(loc => loc.documentId))
  )[0]

  if (documentId) {
    return (
      <IntentLink className={styles.intentLink} intent="edit" params={{id: documentId}}>
        <Content collaborator={collaborator} {...props} />
      </IntentLink>
    )
  }
  return <Content collaborator={collaborator} {...props} />
}
