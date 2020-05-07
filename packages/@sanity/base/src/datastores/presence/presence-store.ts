import {EMPTY, merge, of, timer, BehaviorSubject, from} from 'rxjs'
import {
  map,
  mapTo,
  scan,
  startWith,
  tap,
  withLatestFrom,
  mergeMapTo,
  switchMap,
  mergeMap,
  toArray
} from 'rxjs/operators'
import {groupBy, omit, flatten} from 'lodash'
import {createReflectorTransport} from './message-transports/reflectorTransport'

import userStore from '../user'
import {GlobalPresence, PathElement, PresenceLocation} from './types'

// todo: consider using sessionStorage for this instead as it will survive page reloads
// but need to figure out this means first:
// Opening a page in a new tab or window creates a new session with the value of the top-level browsing context, which differs from how session cookies work.
// https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
export const SESSION_ID = Math.random()
  .toString(32)
  .substring(2)

const [events$, sendMessages] = createReflectorTransport<PresenceLocation[]>('presence', SESSION_ID)

type PrivacyType = 'anonymous' | 'private' | 'dataset' | 'visible'
const privacy$ = new BehaviorSubject<PrivacyType>('visible')
const location$ = new BehaviorSubject(null)

export const setPrivacy = (privacy: PrivacyType) => {
  privacy$.next(privacy)
}
export const setLocation = (nextLocation: PresenceLocation[]) => {
  location$.next(nextLocation)
}

export const reportLocation = location => {
  return sendMessages([
    {
      type: 'sync',
      state: location
    }
  ])
}

const requestRollCall = () =>
  sendMessages([
    {
      type: 'rollCall'
    }
  ])

const reportLocation$ = merge(
  location$.pipe(switchMap(loc => timer(0, 10000).pipe(mapTo(loc))))
).pipe(
  withLatestFrom(privacy$),
  tap(([loc, privacy]) => {
    if (privacy === 'visible') {
      reportLocation(loc)
    }
  })
)
const purgeOld = sessions => {
  const oldIds = Object.keys(sessions).filter(
    id => new Date().getTime() - new Date(sessions[id].timestamp).getTime() > 60 * 1000
  )
  return omit(sessions, oldIds)
}

const purgeOld$ = timer(0, 10000).pipe(mapTo({type: 'purgeOld', sessionId: SESSION_ID}))

export const sessions$ = merge(
  events$.pipe(
    // tap(console.log),
    withLatestFrom(location$, privacy$),
    mergeMap(([event, location, privacy]) => {
      if (event.type === 'rollCall' && privacy === 'visible') {
        reportLocation(location)
        return EMPTY
      }
      return of(event)
    })
  ),
  purgeOld$,
  merge(reportLocation$).pipe(mergeMapTo(EMPTY))
).pipe(
  scan((sessions, event: any) => {
    if (event.type === 'welcome') {
      // i am connected and can safely request a rollcall
      requestRollCall()
      return sessions
    }
    if (event.type === 'sync') {
      return {...sessions, [event.sessionId]: event}
    }
    if (event.type === 'disconnect') {
      return omit(sessions, event.sessionId)
    }
    if (event.type === 'purgeOld') {
      return purgeOld(sessions)
    }
    return sessions
  }, {}),
  startWith({}),
  map(sessions => Object.values(sessions)),
  map(sessions => groupBy(sessions, 'identity')),
  map(grouped =>
    Object.keys(grouped).map(identity => {
      return {
        identity,
        sessions: grouped[identity]
      }
    })
  )
)
/*
locations: flatten(
            sess.sessions.map(s => ({
              sessionId: s.sessionId,
              locations: (s.state || []).map(state => ({
                documentId: state.documentId,
                path: state.path
              }))
            }))
          )
 */

const concat = (prev, curr) => prev.concat(curr)

export const globalPresence$ = sessions$.pipe(
  switchMap(grouped =>
    from(grouped).pipe(
      map(entry => ({
        userId: entry.identity,
        status: 'online',
        // @ts-ignore
        lastActiveAt: entry.sessions.sort()[0]?.timestamp,
        locations: (entry.sessions || [])
          // @ts-ignore
          .map(s => s.state || [])
          .reduce(concat, [])
          .map(state => ({
            type: state?.type,
            documentId: state?.documentId,
            path: state?.path
          }))
      })),
      toArray()
    )
  ),
  switchMap(presenceWithUserIds =>
    from(presenceWithUserIds).pipe(
      mergeMap(({userId, ...rest}) =>
        from(userStore.getUser(userId)).pipe(
          map(user => ({
            user,
            ...rest
          }))
        )
      ),
      toArray()
    )
  )
)

export const documentPresence$ = (documentId: string) => {
  // return presence$.pipe(filter())
}
