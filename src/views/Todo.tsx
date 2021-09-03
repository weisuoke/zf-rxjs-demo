import React, { useEffect, useRef } from 'react'
import { fromEvent } from 'rxjs'
import { map, pluck, withLatestFrom } from 'rxjs/operators'
import useEventObservable from 'src/hooks/useEventObservable'
import useObservable from 'src/hooks/useObservable'
import {
  addTodoItemAction,
  loadTodoItemsAction,
  todoDispatcher,
  todoStore,
  toggleTodoItemAction,
} from 'src/rx-mini-redux'
import { TodoItem, TodoState } from 'src/rx-mini-redux/store'
const once: any = []
interface Props {
  list: TodoItem[]
}
function TodoList(props: Props) {
  const [checkbox$, handleCheckboxChange] = useEventObservable<any>()
  useEffect(() => {
    checkbox$.subscribe(e => {
      todoDispatcher(toggleTodoItemAction((e.target as HTMLInputElement).value))
    })
  }, once)
  return (
    <ul>
      {props.list.map((item, i) => (
        <li key={item.id}>
          <label>
            <input
              className="toggleTodoItem form-check-input"
              type="checkbox"
              value={item.id}
              onChange={handleCheckboxChange}
              defaultChecked={item.done}
            />
            <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.name}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

const Todo = () => {
  const [todo$, handleInputChange] = useEventObservable<any>()

  const addButton = useRef<HTMLButtonElement>(null)
  const list = useObservable(todoStore.pipe(map((store: TodoState) => store.list)), []) as TodoItem[]
  const total = useObservable(todoStore.pipe(map(store => store.list.length)))
  const completeTotal = useObservable(todoStore.pipe(map(store => store.list.filter(todo => todo.done).length)))
  const loading = useObservable(todoStore.pipe(map(store => store.loading)))
  useEffect(() => {
    let componented = true
    todoDispatcher(loadTodoItemsAction())

    fromEvent(addButton.current!, 'click')
      .pipe(
        // withLatestFrom 当源`Observalbe` `addButton源`发出事件值时会与`toddo$ Observable`的最新值做一个merge，然后输出
        withLatestFrom(todo$.pipe(pluck('target', 'value'))),
        map(data => data[1])
      )
      .subscribe(val => {
        todoDispatcher(addTodoItemAction(val))
      })
    return () => {
      componented = false
    }
  }, once)
  return (
    <div>
      <h1>Todo List Demo</h1>
      <div>
        <input type="text" className="form-control" onChange={handleInputChange} />
        <button ref={addButton} className="btn btn-primary">
          Add
        </button>
      </div>

      <div>
        <h2>Todos</h2>
        <TodoList list={list} />
      </div>

      <div>
        <div>
          Total: <span>{total}</span>
        </div>
        <div>
          Completed: <span>{completeTotal}</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div style={{ color: 'red' }}>{loading ? 'loading...' : ''}</div>
      </div>
    </div>
  )
}

export default Todo
