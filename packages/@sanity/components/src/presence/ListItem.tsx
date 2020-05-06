/* eslint-disable react/no-multi-comp */
import React from 'react'
import {IntentLink} from 'part:@sanity/base/router'
import styles from './ListItem.css'
import AvatarProvider from './UserAvatar'
import {Size, Status, Collaborator} from './types'
import ts from '@now/node/dist/typescript/lib/tsserverlibrary'
import Session = ts.server.Session

function Content({
  id,
  user,
  status = 'inactive',
  size = 'small'
}: {
  id: string
  user: Collaborator
  status?: Status
  size?: Size
}) {
  return (
    <div className={styles.inner} data-size={size}>
      <div className={styles.avatar}>
        <AvatarProvider size={size} status={status} userId={id} />
      </div>
      <div className={styles.userInfo}>
        <span className={styles.name} title={user.displayName}>
          {user.displayName}
        </span>
      </div>
    </div>
  )
}

type Props = {
  id: string
  status: Status
  sessions?: Session[]
  size?: Size
  onClick?: () => void
}

export default function ListItem(props: Props) {
  const {sessions, user} = props

  // TODO
  // Temp solution: Find first session with a document id to decide param for intent link
  const session = sessions && sessions.find(session => session.state?.documentId)

  if (session?.state?.documentId) {
    return (
      <IntentLink
        className={styles.intentLink}
        intent="edit"
        params={{id: session.state.documentId}}
      >
        <Content user={user} {...props} />
      </IntentLink>
    )
  }
  return <Content user={user} {...props} />
}
