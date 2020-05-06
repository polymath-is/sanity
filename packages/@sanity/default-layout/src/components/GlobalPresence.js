import PresenceStatus from 'part:@sanity/components/presence/presence-status'
import usePresence from 'part:@sanity/base/hooks/collaborators'
import React from 'react'

export function GlobalPresence() {
  const collaborators = usePresence()
  console.log(collaborators)
  return <PresenceStatus collaborators={collaborators} />
}
