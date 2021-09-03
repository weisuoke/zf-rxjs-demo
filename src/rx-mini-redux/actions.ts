import { TodoActionTypes } from './types'

export const loadTodoItemsAction = () => {
  return {
    type: TodoActionTypes.LoadTodoItems,
    payload: null,
  }
}

export const addTodoItemAction = (payload: any) => {
  return {
    type: TodoActionTypes.AddTodoItem,
    payload,
  }
}

export const toggleTodoItemAction = (payload: any) => {
  return {
    type: TodoActionTypes.ToggleTodoItem,
    payload,
  }
}
