import { from } from 'rxjs'
import { todoReducer } from './reducer'
import { store$ } from './store'

export const todoDispatcher = (action: any) => {
  from(todoReducer(store$.value, action)).subscribe({
    next: (data: any) => store$.next(data),
    error: data => store$.error(data),
  })
}
