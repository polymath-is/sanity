import {User} from '../user/createUserStore'

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
  type: 'document'
  documentId: string
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

export {User}

export type GlobalPresence = {
  userId: string
  status: Status
  lastActiveAt: LastActiveAt
  locations: PresenceLocation[]
}
