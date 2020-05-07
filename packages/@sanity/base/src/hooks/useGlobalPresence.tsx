import {useState, useEffect} from 'react'
import {presence$} from '../datastores/presence'

export function useGlobalPresence() {
  const [presence, setPresence] = useState([])
  useEffect(() => {
    const subscription = presence$.subscribe(collaborators => setPresence(collaborators))
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return presence
}
