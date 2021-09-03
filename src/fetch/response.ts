import { Observable, Subject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { RequestConfig, FetchResponse, FetchWorkEntry } from 'src/types/fetch'
import { RequestQueue } from './request'

interface ResponsesEntry<T> {
  id: string
  observable: Observable<FetchResponse<T>>
}

export class ResponseQueue {
  // 请求入口流
  private queue: Subject<FetchWorkEntry> = new Subject<FetchWorkEntry>()
  // 响应入口流
  private responses: Subject<ResponsesEntry<any>> = new Subject<ResponsesEntry<any>>()
  constructor(request: RequestQueue, fetch: <T>(options: RequestConfig) => Observable<FetchResponse<T>>) {
    // 订阅`RequestQueue发送过来的请求`
    this.queue.subscribe(entry => {
      const { id, options } = entry
      // 将请求状态更改为进行中，让`RequestQueue`知道这个id开始获取数据
      request.setInProgress(id)
      // 开始通知发送请求
      this.responses.next({ id, observable: fetch(options) })
    })
  }
  // 添加一个响应到`ResponseQueue`并触发事件
  add(id: string, options: RequestConfig) {
    this.queue.next({ id, options })
  }
  // 从`ResponseQueue`取出指定id的响应
  getResponses<T>(id: string): Observable<ResponsesEntry<T>> {
    return this.responses.asObservable().pipe(filter(entry => entry.id === id))
  }
}
