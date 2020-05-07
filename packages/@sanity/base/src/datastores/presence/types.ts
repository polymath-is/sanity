export type Status = 'online' | 'editing' | 'inactive'
export type PathElement = string | number | {_key: string}

export interface User {
  id: string
  displayName?: string
  imageUrl?: string
}

export type PresentUser = {
  user: User
  status?: Status
  sessions?: Session[]
}

export interface Session {
  id: string
  locations: Location[]
}

export interface Location {
  documentId: string
  path: PathElement[]
}
