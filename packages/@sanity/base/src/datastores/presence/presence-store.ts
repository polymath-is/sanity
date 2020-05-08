import {BehaviorSubject, defer, EMPTY, from, merge, of, timer} from 'rxjs'
import {
  flatMap,
  map,
  mapTo,
  mergeMap,
  mergeMapTo,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
  toArray,
  withLatestFrom,
  publishReplay,
  refCount
} from 'rxjs/operators'
import {groupBy, omit} from 'lodash'
import {createReflectorTransport} from './message-transports/reflectorTransport'

import userStore from '../user'
import {PresenceLocation} from './types'

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

// const purgeOld$ = timer(0, 10000).pipe(mapTo({type: 'purgeOld', sessionId: SESSION_ID}))
const purgeOld$ = EMPTY

const real$ = merge(
  events$.pipe(
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
)

const mock$ = defer(() =>
  from(
    'pqSMwf6hH,p-xRcD0xpnFA8R,p-rwpCNNWtVnlz,pnLYqNfv5,priDVVmy8,p0NFOU0j8,pTDl2jw8d,pH1ZwC8i9,pZSfuDqFB,pHMeQnTse,p-Syl5Bs4nLHcr,ppzqWGWNb,pDQYzJbyS,pZyoPHKUs,pQzJQHSWI,p4Tyi2Be5,pb9vii060,pE8yhOisw,pgqD5dmam,pNIRxUDCs,p-gTOWmkXiXc5m,p-BJNcObnSkvpZ,p7Fd2C6Cj,p-ef4VzXpTUVfe,p3exSgYCx,pbIQRYViC,p8GJaTEhN,p27ewL8aM,p-tOOQeqfD8JLu,p3udQwtNP,p-KSTLBLgxkgR1,pAxG0VlQB,pYg97z75S,pdLr4quHv,pkJXiDgg6,pkl4UAKcA'
      .split(',')
      .slice(0, 4)
      .map((id, n) => ({
        type: 'sync',
        identity: id,
        sessionId: id + n,
        timestamp: new Date().toISOString(),
        state: [
          {
            type: 'document',
            // documentId: 'presence-test',
            documentId: 'foo-bar',
            path: ['bestFriend']
            // path: ['customInputWithDefaultPresence', 'row3', 'cell3']
          }
        ]
      }))
  )
)

export const sessions$ = defer(() => merge(mock$, real$)).pipe(
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
    console.warn('Unknown event', event)
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

export const documentPresence = (documentId: string) => {
  return globalPresence$.pipe(
    switchMap(globalPresence =>
      from(globalPresence).pipe(
        flatMap(presenceItem =>
          (presenceItem.locations || [])
            .filter(item => item.documentId === documentId)
            .map(state => ({
              user: presenceItem.user,
              status: presenceItem.status,
              lastActiveAt: presenceItem.lastActiveAt,
              path: state?.path || []
            }))
        ),
        toArray()
      )
    )
  )
}
