import { of, concat, delay } from 'rxjs'
import { TodoItem, TodoState } from './store'
import { TodoActionTypes } from './types'
export const todoReducer = (currentState: TodoState, action: any) => {
  switch (action.type) {
    case TodoActionTypes.LoadTodoItems: {
      const loadingState = { ...currentState, loading: true }
      const loadingState$ = of(loadingState)

      const newState = { ...currentState } as any
      newState.list = [
        ...newState.list,
        { id: 1, name: 'Todo Item 1', done: false },
        { id: 2, name: 'Todo Item 2', done: true },
        { id: 3, name: 'Todo Item 3', done: false },
      ]
      const newState$ = of(newState).pipe(delay(1000))
      return concat(loadingState$, newState$)
    }
    case TodoActionTypes.AddTodoItem:
      const loadingState = { ...currentState, loading: true }
      const loadingState$ = of(loadingState)

      const newState = {
        ...currentState,
        list: [
          ...currentState.list,
          {
            id: currentState.list.length + 1,
            name: action.payload,
            done: false,
          },
        ],
        loading: false,
      }
      console.log(newState, action)
      const newState$ = of(newState).pipe(delay(500))
      return concat(loadingState$, newState$)
    case TodoActionTypes.ToggleTodoItem: {
      const loadingState = { ...currentState, loading: true }
      const loadingState$ = of(loadingState)

      const newState = {
        ...currentState,
        list: currentState.list.map((todo: TodoItem) => ({
          ...todo,
          done: +action.payload === todo.id ? !todo.done : todo.done,
        })),
        loading: false,
      }
      const newState$ = of(newState).pipe(delay(500))

      return concat(loadingState$, newState$)
    }
  }
  // 如果没有可以处理的 action type 直接返回原来的内容
  return of(currentState)
}
