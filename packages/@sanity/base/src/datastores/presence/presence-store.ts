import {
  BehaviorSubject,
  defer,
  EMPTY,
  from,
  interval,
  merge,
  Observable,
  MonoTypeOperatorFunction
} from 'rxjs'
import {
  debounceTime,
  filter,
  flatMap,
  map,
  mergeMap,
  mergeMapTo,
  scan,
  share,
  switchMap,
  take,
  tap,
  toArray,
  withLatestFrom
} from 'rxjs/operators'
import {groupBy, omit} from 'lodash'
import {createBifurTransport} from './message-transports/bifurTransport'

import userStore from '../user'
import {PresenceLocation, Session} from './types'
import {bifur} from '../../client/bifur'
import {
  DisconnectEvent,
  RollCallEvent,
  StateEvent,
  TransportEvent
} from './message-transports/transport'
import {mock$} from './mock-events'

// todo: consider using sessionStorage for this instead as it will survive page reloads
// but need to figure out this means first:
// Opening a page in a new tab or window creates a new session with the value of the top-level browsing context, which differs from how session cookies work.
// https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
export const SESSION_ID = Math.random()
  .toString(32)
  .substring(2)

const [presenceEvents$, sendMessage] = createBifurTransport(bifur, SESSION_ID)

const locationChange = new BehaviorSubject(null)

export const setLocation = (nextLocation: PresenceLocation[]) => {
  locationChange.next(nextLocation)
}

export const reportLocation = (locations: PresenceLocation[]) =>
  sendMessage({type: 'state', locations: locations})

const requestRollCall = () => sendMessage({type: 'rollCall'})

const debug = <T>(...args: any[]): MonoTypeOperatorFunction<T> => source$ =>
  source$.pipe(tap(value => console.log(...[...args, value])))

const rollCallRequests$ = presenceEvents$.pipe(
  filter((event: TransportEvent): event is RollCallEvent => event.type === 'rollCall')
)

// Interval to report my own location at
const reportLocationInterval$ = interval(10000)

const rollCallReplies$ = merge(locationChange, reportLocationInterval$, rollCallRequests$).pipe(
  debounceTime(200),
  withLatestFrom(locationChange),
  switchMap(([, location]) => reportLocation(location)),
  mergeMapTo(EMPTY)
)

// This is my rollcall to other clients
const initialRollCall$ = defer(() => from(requestRollCall()).pipe(take(1), mergeMapTo(EMPTY)))

const syncEvent$ = merge(initialRollCall$, presenceEvents$).pipe(
  filter(
    (event: TransportEvent): event is StateEvent | DisconnectEvent =>
      event.type === 'state' || event.type === 'disconnect'
  ),
  share()
)

const states$ = merge(syncEvent$, mock$).pipe(
  scan(
    (keyed, event) =>
      event.type === 'disconnect'
        ? omit(keyed, event.sessionId)
        : {...keyed, [event.sessionId]: event},
    {}
  )
)

const allSessions$: Observable<Session[]> = merge(states$, rollCallReplies$).pipe(
  map(sessions => Object.values(sessions))
)

const concatValues = <T>(prev: T[], curr: T): T[] => prev.concat(curr)

export const usersWithSessions$ = allSessions$.pipe(
  map(sessions => groupBy(sessions, 'userId')),
  map((grouped): {userId: string; sessions: Session[]}[] =>
    Object.keys(grouped).map(userId => {
      return {
        userId,
        sessions: grouped[userId]
      }
    })
  )
)

export const globalPresence$ = usersWithSessions$.pipe(
  switchMap(usersWithSessions =>
    from(usersWithSessions).pipe(
      map(userWithSession => ({
        userId: userWithSession.userId,
        status: 'online',
        lastActiveAt: userWithSession.sessions.sort()[0]?.lastActiveAt,
        locations: (userWithSession.sessions || [])
          .map(session => session.locations || [])
          .reduce(concatValues, [])
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

export const documentPresence = (documentId: string) => {
  return globalPresence$.pipe(
    switchMap(globalPresence =>
      from(globalPresence).pipe(
        flatMap(presenceItem =>
          (presenceItem.locations || [])
            .filter(item => item.documentId === documentId)
            .map(location => ({
              user: presenceItem.user,
              status: presenceItem.status,
              lastActiveAt: presenceItem.lastActiveAt,
              path: location.path || []
            }))
        ),
        toArray()
      )
    )
  )
}
