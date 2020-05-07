import {GlobalStatus} from '@sanity/components/presence'
import {useGlobalPresence} from 'part:@sanity/base/hooks/presence'
import client from 'part:@sanity/base/client'
import React from 'react'

export function GlobalPresence() {
  const {projectId} = client.config()
  const presence = useGlobalPresence()
  return <GlobalStatus presence={presence} projectId={projectId} />
}
