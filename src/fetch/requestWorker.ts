import { RequestQueue, RequestStatus } from './request'
import { ResponseQueue } from './response'
import { filter, mergeMap } from 'rxjs/operators'
import { FetchWorkEntry } from 'src/types'

export class RequestQueueWorker {
  constructor(req: RequestQueue, responseQueue: ResponseQueue, config: any) {
    // const maxParallelRequests = config.http2Enabled ? 1000 : 5
    req
      .getUpdates() // 获取最新的请求流
      .pipe(
        filter(({ noOfPending }) => noOfPending > 0), // 过滤出当前处于pending状态的请求
        mergeMap(({ state }) => {
          const apiRequests = Object.keys(state)
            .filter(k => state[k].state === RequestStatus.Pending)
            .reduce((memo, key) => {
              const entry = { id: key, options: state[key].options }
              memo.push(entry)
              return memo
            }, [] as FetchWorkEntry[])

          return apiRequests
        })
      )
      /**
       * 在中大型应用中，可能会分Base API和用户数据API请求，如果对API 顺序有要求 可以使用concatMap,以下是伪代码
       *  
        concatMap(({ state }) => {
          const apiRequests = Object.keys(state)
            .filter(k => state[k].state === RequestStatus.Pending)
            .reduce((memo, key) => {
              const entry = { id: key, options: state[key].options }
              memo.push(entry)
              return memo
            }, [] as FetchWorkEntry[])
          const dataRequests = Object.keys(state)
            .filter(key => state[key].state === FetchStatus.Pending && isDataQuery(state[key].options.url))
            .reduce((all, key) => {
              const entry = { id: key, options: state[key].options };
              all.push(entry);
              return all;
            }, [] as WorkerEntry[]);
            return apiRequests.concat(dataRequests);
        })
       * 
       */
      .subscribe(({ id, options }) => {
        // 向`responseQueue`添加一个请求
        responseQueue.add(id, options)
      })
  }
}
