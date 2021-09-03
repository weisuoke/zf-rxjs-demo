import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

export interface AppRouteComponentProps<T = {}, Q = Record<string, any>> extends RouteComponentProps<T> {
  route: RouteDescriptor
  queryParams?: Q
}

export type AppRouteComponent<T = any> = React.ComponentType<AppRouteComponentProps<T>>

export interface RouteDescriptor {
  path: string
  component: AppRouteComponent<any>
  pageClass?: string
  name?: string
}
