import {useState, useEffect} from 'react'
import {collaborators$} from 'part:@sanity/base/presence'

export default function useCollaborators() {
  const [collaborators, setCollaborators] = useState([])
  useEffect(() => {
    const subscription = collaborators$.subscribe(collaborators => setCollaborators(collaborators))
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return collaborators
}
