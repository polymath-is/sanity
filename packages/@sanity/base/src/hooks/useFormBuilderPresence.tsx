// import {useState, useEffect} from 'react'
// import {presence$} from '../datastores/presence'
// import {filter, map} from 'rxjs/operators'
//
// export function useDocumentPresence(documentId: string) {
//   const [presence, setPresence] = useState([])
//   useEffect(() => {
//     const subscription = presence$
//       .pipe(
//         map(presence =>
//           presence.filter(item =>
//             item.sessions.some(sess => sess.locations.some(loc => loc.documentId === documentId))
//           )
//         )
//       )
//       .subscribe(collaborators => setPresence(collaborators))
//     return () => {
//       subscription.unsubscribe()
//     }
//   }, [])
//   return presence
// }
