import { Observable, Subject } from 'rxjs'
import { RequestConfig } from 'src/types/fetch'

export interface QueueState extends Record<string, { state: RequestStatus; options: RequestConfig }> {}
export enum RequestStatus {
  Pending,
  InProgress,
  Done,
}
export interface RequestQueueUpdate {
  noOfInProgress: number
  noOfPending: number
  state: QueueState
}
interface QueueStateEntry {
  id: string
  options?: RequestConfig
  state: RequestStatus
}
export class RequestQueue {
  // 内部流状态
  private state: QueueState = {}
  // 内部的请求队列流
  private queue: Subject<QueueStateEntry> = new Subject<QueueStateEntry>()
  // 对内部队列状态进行更新的外部流
  private updates: Subject<RequestQueueUpdate> = new Subject<RequestQueueUpdate>()
  constructor(debug = false) {
    // 订阅请求状态并更新状态 pending inProgress done
    this.queue.subscribe(entry => {
      const { id, state, options } = entry
      // 初始化状态为pending
      if (!this.state[id]) {
        this.state[id] = { state: RequestStatus.Pending, options: {} as RequestConfig }
      }
      // 状态为done时删除当前id配置并更新发布状态
      if (state === RequestStatus.Done) {
        delete this.state[id]
        const update = this.getUpdate(this.state)
        this.publishUpdate(update, debug)
        return
      }
      this.state[id].state = state
      if (options) {
        this.state[id].options = options
      }
      const update = this.getUpdate(this.state)
      this.publishUpdate(update, debug)
    })
  }
  add(id: string, options: RequestConfig) {
    this.queue.next({ id, options, state: RequestStatus.Pending })
  }
  setInProgress(id: string) {
    this.queue.next({ id, state: RequestStatus.InProgress })
  }
  setDone(id: string) {
    this.queue.next({ id, state: RequestStatus.Done })
  }
  //当请求流有更新时，外部可以通过`getUpdates`订阅更新后的流
  getUpdates(): Observable<RequestQueueUpdate> {
    return this.updates.asObservable()
  }
  private publishUpdate(update: RequestQueueUpdate, debug: boolean) {
    this.updates.next(update)
    if (debug) this.printState(update)
  }
  private getUpdate(state: QueueState): RequestQueueUpdate {
    const noOfInProgress = Object.keys(state).filter(key => state[key].state === RequestStatus.InProgress).length
    const noOfPending = Object.keys(state).filter(key => state[key].state === RequestStatus.Pending).length
    return { noOfInProgress, noOfPending, state }
  }
  private printState(update: RequestQueueUpdate) {
    const entriesWithoutOptions = Object.keys(update.state).reduce((memo, key) => {
      const entry = { id: key, state: update.state[key].state }
      memo.push(entry)
      return memo
    }, [] as Array<{ id: string; state: RequestStatus }>)
    console.log('RequestQueue noOfStarted', update.noOfInProgress)
    console.log('RequestQueue noOfNotStarted', update.noOfPending)
    console.log('RequestQueue state', entriesWithoutOptions)
  }
}
