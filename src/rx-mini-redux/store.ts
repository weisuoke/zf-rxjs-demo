import { BehaviorSubject } from 'rxjs'
export interface TodoItem {
  id: number
  name: string
  done: boolean
}
export interface TodoState {
  loading: boolean
  list: TodoItem[]
}
export const store$ = new BehaviorSubject<TodoState>({
  loading: false,
  list: [],
})
