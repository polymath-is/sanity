import {useState, useEffect} from 'react'
import {globalPresence$} from '../datastores/presence'

export function useGlobalPresence() {
  const [presence, setPresence] = useState([])
  useEffect(() => {
    const subscription = globalPresence$.subscribe(collaborators => setPresence(collaborators))
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return presence
}
