import { useState, useEffect } from 'react'
import { Observable } from 'rxjs'

function useObservable<T>(input$: Observable<T>, inititalState?: T): T | undefined {
  const [value, setValue] = useState(inititalState)
  useEffect(() => {
    const subscription = input$.subscribe({
      next(value) {
        setValue(value)
      },
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [input$])

  return value
}

export default useObservable
