import React from 'react'
import Loadable from 'react-loadable'
import { AppRouteComponent } from 'src/types'

export const loadComponentHandler = (props: { error: Error; pastDelay: boolean }) => {
  const { error } = props
  if (error) return <div>加载错误</div>

  return null
}

export const SafeDynaimcImport = (loader: () => Promise<any>): AppRouteComponent =>
  Loadable({ loader, loading: loadComponentHandler })
