import {useState, useEffect} from 'react'
import {documentPresence} from '../datastores/presence'

export function useDocumentPresence(documentId) {
  const [presence, setPresence] = useState([])
  useEffect(() => {
    const subscription = documentPresence(documentId).subscribe(setPresence)
    return () => {
      subscription.unsubscribe()
    }
  }, [documentId])
  return presence
}
