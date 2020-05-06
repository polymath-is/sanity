import React from 'react'
import UsersIcon from 'part:@sanity/base/users-icon'
import styles from './GlobalStatus.css'
import PopoverList from './PopoverList'
import {MAX_AVATARS} from './constants'
import {splitRight} from './utils'
import {uniqBy} from 'lodash'
import StackCounter from './StackCounter'
import {Collaborator} from './types'
import UserAvatar from './UserAvatar'

interface Props {
  projectId: string
  collaborators: Collaborator[]
}

export default function GlobalStatus({projectId, collaborators}: Props) {
  const [hiddenUsers, visibleUsers] = splitRight(collaborators, 1)
  const showCounter = hiddenUsers.length >= MAX_AVATARS - 1 || collaborators.length === 0
  return (
    <div className={styles.root}>
      <PopoverList
        collaborators={collaborators}
        avatarSize="medium"
        isGlobal
        projectId={projectId}
        trigger="click"
      >
        <div className={styles.inner} tabIndex={-1}>
          {/* Only show this on mobile */}
          <div className={styles.mobileContent}>
            <div className={styles.icon}>
              {collaborators.length > 0 && (
                <div className={styles.statusIndicator} aria-label={`Online collaborators`} />
              )}
              <UsersIcon />
            </div>
          </div>
          {/* Show avatars laid out like on a field */}
          <div className={styles.avatars}>
            {showCounter && <StackCounter count={hiddenUsers.length} />}
            {visibleUsers.map(collaborator => (
              <div className={styles.avatarOverlap} key={collaborator.user.id}>
                <UserAvatar user={collaborator.user} fillColor="currentColor" color="#ea5fb1" />
              </div>
            ))}
          </div>
        </div>
      </PopoverList>
    </div>
  )
}
