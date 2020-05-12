import {defer, from} from 'rxjs'
import {StateEvent} from './message-transports/transport'
import {map, shareReplay} from 'rxjs/operators'

const USERIDS = 'pqSMwf6hH,pnLYqNfv5,priDVVmy8,p0NFOU0j8,pTDl2jw8d,pH1ZwC8i9,pZSfuDqFB,pHMeQnTse,ppzqWGWNb,pDQYzJbyS,pZyoPHKUs,pQzJQHSWI,p4Tyi2Be5,pb9vii060,pE8yhOisw,pgqD5dmam,pNIRxUDCs,p7Fd2C6Cj,p3exSgYCx,pbIQRYViC,p8GJaTEhN,p27ewL8aM,p3udQwtNP,pAxG0VlQB,pYg97z75S,pdLr4quHv,pkJXiDgg6,pkl4UAKcA'.split(
  ','
)

export const mock$ = defer(() => from(USERIDS)).pipe(
  map(
    (id, n): StateEvent => ({
      type: 'state',
      userId: id,
      sessionId: id + n,
      timestamp: new Date().toISOString(),
      locations: [
        {
          type: 'document',
          documentId: 'presence-test',
          // documentId: 'foo-bar',
          // path: ['bestFriend']
          path:
            Math.random() > 0.5
              ? ['nested', Math.random() > 0.3 ? 'first' : 'second']
              : ['address', Math.random() > 0.3 ? 'country' : 'street']
          // path: ['address', Math.random() > 0.5 ? 'country' : 'street']
          // path: ['customInputWithDefaultPresence', 'row3', 'cell3']
        }
      ]
    })
  ),
  shareReplay()
)
