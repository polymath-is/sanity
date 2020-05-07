export type Status = 'online' | 'editing' | 'inactive'
export type PathElement = string | number | {_key: string}

// Low level data/transport format
export interface Session {
  id: string
  userId: string
  lastActiveAt: LastActiveAt
  locations: PresenceLocation[]
}

// (this is what each client typically exchanges over bifur)
export interface PresenceLocation {
  /* must be an unique id generated from the client, each time a message is received for a given id, it will replace any previous message associated with that id  */
  id: string
  documentId?: string
  path: PathElement[]
  data: PresenceData
}

type LastActiveAt = string // iso date
type PresenceData = {[key: string]: any}

// These are the data prepared and made ready for different types of UI components to use
// Presence data prepared for a single document
interface DocumentPresence {
  userId: string
  sessionId: string
  path: PathElement[]
  lastActiveAt: LastActiveAt
  data: PresenceData
}

export interface User {
  id: string
  displayName?: string
  imageUrl?: string
}

export type GlobalPresence = {
  user: User
  status?: Status
  sessions?: Session[]
}
