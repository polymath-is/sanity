export type Position = 'top' | 'bottom' | 'inside' | null
export type Status = 'online' | 'editing' | 'inactive'
export type Size = 'xsmall' | 'small' | 'medium'

export type Presence = {
  sessionId: string
  userId: string
  path: string[]
}

type PathElement = string | number | {_key: string}

export type Collaborator = {
  id: string
  displayName?: string
  imageUrl?: string
  status?: Status
  sessions?: Session[]
}

interface Session {
  id: string
  path: PathElement[]
}
