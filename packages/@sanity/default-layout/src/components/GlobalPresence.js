import {GlobalStatus} from '@sanity/components/presence'
import {useGlobalPresence} from 'part:@sanity/base/hooks/presence'
import React from 'react'

export function GlobalPresence() {
  const presence = useGlobalPresence()
  return <GlobalStatus presence={presence} />
}
