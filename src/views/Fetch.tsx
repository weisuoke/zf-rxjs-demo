import React, { useEffect } from 'react'
import { http } from 'src/fetch/http'
import useEventObservable from 'src/hooks/useEventObservable'

const Fetch = () => {
  const [click$, btnClickHandle] = useEventObservable<any>()
  useEffect(() => {
    click$.subscribe(() => {
      http.request({ url: '/search/relative_project?q=123123', method: 'GET', requestId: '111' }).then(res => {
        console.log(res)
      })
      // 同一ID会取消请求
      http.request({ url: '/search/relative_project?q=123123', method: 'GET', requestId: '111' }).then(res => {
        console.log(res)
      })
    })
  }, [])
  return (
    <div>
      <button onClick={btnClickHandle}>请求示例</button>
      <div>本节学习主要在于掌握源码</div>
    </div>
  )
}

export default Fetch
