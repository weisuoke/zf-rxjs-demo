import { SafeDynaimcImport } from 'src/components/DyanmicImports/SfaeDynamicImport'
import { RouteDescriptor } from 'src/types/routeDescriptor'

export const routes: RouteDescriptor[] = [
  {
    path: '/fetch',
    component: SafeDynaimcImport(() => import('src/views/Fetch')),
  },
  {
    path: '/rx-mini-redux-todo',
    component: SafeDynaimcImport(() => import('src/views/Todo')),
  },
]
