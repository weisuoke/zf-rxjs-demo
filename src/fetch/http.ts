import { MonoTypeOperatorFunction, Observable, Subject, throwError, merge, Subscription, lastValueFrom } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { mergeMap, share, filter, retryWhen, catchError, takeUntil, throwIfEmpty, map } from 'rxjs/operators'
import { RequestConfig, DataQueryErrorType, FetchError, FetchResponse } from 'src/types/fetch'
import { RequestQueue } from './request'
import { RequestQueueWorker } from './requestWorker'
import { ResponseQueue } from './response'
import { parseInitFromOptions, parseResponseBody, parseUrlFromOptions } from './utils'

export interface HttpDependencies {
  fromFetch: (input: string | Request, init?: RequestInit) => Observable<Response>
}

export class Http {
  // 取消请求
  private cancleRequests: Subject<string> = new Subject<string>()
  private HTTP_REQUEST_CANCELED = -1
  private readonly requestQueue: RequestQueue
  private readonly responseQueue: ResponseQueue
  private dependencies: HttpDependencies = {
    fromFetch: fromFetch,
  }
  constructor(deps?: HttpDependencies) {
    // 实例化自定义参数合并
    if (deps) {
      this.dependencies = {
        ...this.dependencies,
        ...deps,
      }
    }
    this.internalFetch = this.internalFetch.bind(this)
    // 创建请求流
    this.requestQueue = new RequestQueue()
    // 创建响应流
    this.responseQueue = new ResponseQueue(this.requestQueue, this.internalFetch)
    // 创建请求工作者
    new RequestQueueWorker(this.requestQueue, this.responseQueue, {})
  }
  internalFetch<T>(options: RequestConfig): Observable<FetchResponse<T>> {
    if (options.requestId) {
      this.cancleRequests.next(options.requestId)
    }
    options = this.parseRequestOptions(options)
    const fromFetchStream = this.getFromFetchStream<T>(options)
    const failureStream = fromFetchStream.pipe(this.toFailureStream<T>(options))
    const successStream = fromFetchStream.pipe(filter(response => response.ok))
    //合并两个流，平行处理
    return merge(successStream, failureStream).pipe(
      // `catchError` 捕获流的错误
      catchError((err: FetchError) => throwError(() => this.processRequestError(options, err))),
      this.handleStreamCancellation(options)
    )
  }
  private handleStreamCancellation(options: RequestConfig): MonoTypeOperatorFunction<FetchResponse<any>> {
    return inputStream =>
      inputStream.pipe(
        // takeUntil 直到流发生就结束
        takeUntil(
          this.cancleRequests.pipe(
            filter(requestId => {
              let cancelRequest = false
              if (options && options.requestId && options.requestId === requestId) {
                cancelRequest = true
              }
              return cancelRequest
            })
          )
        ),
        // 因为takeUntil虽然结束流，但没有发出任何值 `throwIfEmpty`源`Observable`完成但没有发出值，会发生一个错误，告诉API调用方
        throwIfEmpty(() => ({
          type: DataQueryErrorType.Cancelled,
          cancelled: true,
          data: null,
          status: this.HTTP_REQUEST_CANCELED,
          statusText: 'Request was aborted',
          config: options,
        }))
      )
  }
  // 失败流
  private toFailureStream<T>(options: RequestConfig): MonoTypeOperatorFunction<FetchResponse<T>> {
    return inputStream =>
      inputStream.pipe(
        filter(response => response.ok === false),
        mergeMap(response => {
          const { status, statusText, data } = response
          const fetchErrorResponse: FetchError = { status, statusText, data, config: options }
          return throwError(() => fetchErrorResponse)
        }),
        // `retryWhen`当发生错误时
        retryWhen((attempts: Observable<any>) => {
          return attempts.pipe(
            mergeMap((error, i) => {
              // 这里可以处理retry逻辑 伪代码
              // const firstAttempt = i === 0 && options.retry === 0
              // if (error.status === 401  && firstAttempt) {
              //     return from(this.yourRequestApi()).pipe(

              //     );
              //   }
              return throwError(() => error)
            })
          )
        })
      )
  }
  private parseRequestOptions(options: RequestConfig): RequestConfig {
    options.retry = options.retry ?? 0
    return options
  }
  private getFromFetchStream<T>(options: RequestConfig): Observable<FetchResponse<T>> {
    // 参数处理
    const url = parseUrlFromOptions(options)
    const init = parseInitFromOptions(options)
    //
    return this.dependencies.fromFetch(url, init).pipe(
      mergeMap(async response => {
        const { status, statusText, ok, headers, url, type, redirected } = response
        const data = await parseResponseBody<T>(response, options.responseType)
        const fetchResposne: FetchResponse<T> = {
          status,
          statusText,
          ok,
          data,
          headers,
          url,
          type,
          redirected,
          config: options,
        }
        return fetchResposne
      }),
      share() // 转成多播可以分成成功流、失败流，然后再合并
    )
  }
  request<T = any>(options: RequestConfig): Promise<T> {
    // 在rxjs6使用toPromise `lastValueFrom`也是转成Promise，但是在结束时才取值，更符合流的设计
    return lastValueFrom(this.fetch<T>(options).pipe(map((response: FetchResponse<T>) => response.data)))
  }
  fetch<T>(options: RequestConfig): Observable<FetchResponse<T>> {
    const id = options.requestId || Date.now().toString()
    const requestQueue = this.requestQueue
    // 这里比较关键，第一次看可能会感觉有点绕....
    return new Observable(observer => {
      // Subscription 是在订阅Observable时返回的对象，同时我们也可以使用它作为多个订阅的容器，当它被取消订阅时，其中的所有订阅也将被取消
      const subscriptions: Subscription = new Subscription()

      // 我们这里开始订阅`下面响应流隐藏返回的订阅`
      subscriptions.add(
        // 获取响应流
        this.responseQueue.getResponses<T>(id).subscribe(result => {
          //  这段代码做了下面2件事
          // 首先，我们从结果中(result.observable)订阅结果并传入上面的observer对象，通过传递外部observer对象，然后对结果进行更新，result.observable 通过fetch<T>这个函数传递给订阅者
          // 其次 我们添加了由result.observable.subscribe(observer)隐式返回的订阅
          subscriptions.add(result.observable.subscribe(observer))
        })
      )
      // 我们让`requestQueue`知道这个id，开始发送请求
      this.requestQueue.add(id, options)

      // 当 fetch<T>这个函数返回的Observable发生unsubscribed/errored/completed/canceled,这个返回函数将会被调用取消订阅
      return function unsubscribe() {
        // 取消订阅时，将请求队列中状态设置完成
        requestQueue.setDone(id)
        // 取消订阅时上面的添加的隐式订阅也将取消,上面说的订阅容器就是这个作用
        subscriptions.unsubscribe()
      }
    })
  }
  processRequestError(options: RequestConfig, err: FetchError): FetchError {
    err.data = err.data ?? { message: 'Unexpected error' }
    if (typeof err.data == 'string') {
      err.data = {
        error: err.statusText,
        response: err.data,
        message: err.data,
      }
    }
    //
    if (err.data && !err.data.message && typeof err.data.error === 'string') {
      err.data.message = err.data.error
    }
    return err
  }
  get<T = any>(url: string, params?: any, requestId?: string): Promise<T> {
    return this.request({ method: 'GET', url, params, requestId })
  }
  delete<T = any>(url: string): Promise<T> {
    return this.request({ method: 'DELETE', url })
  }
  post<T = any>(url: string, data?: any): Promise<T> {
    return this.request({ method: 'POST', url, data })
  }
  patch<T = any>(url: string, data: any): Promise<T> {
    return this.request({ method: 'PATCH', url, data })
  }
  put<T = any>(url: string, data: any): Promise<T> {
    return this.request({ method: 'PUT', url, data })
  }
}

export const http = new Http()
