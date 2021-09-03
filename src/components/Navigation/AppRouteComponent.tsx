import React from 'react'
import { AppRouteComponentProps } from 'src/types/routeDescriptor'

export interface Props extends Omit<AppRouteComponentProps, 'queryParams'> {}

export default class AppRouteComponent extends React.PureComponent<Props> {
  componentDidMount() {
    this.updateBodyClassNames()
  }
  componentWillUnmount() {
    this.updateBodyClassNames(true)
  }
  getPageClasses() {
    return this.props.route.pageClass ? this.props.route.pageClass.split(/\s/) : []
  }
  updateBodyClassNames(clear = false) {
    for (const cls of this.getPageClasses()) {
      clear ? document.body.classList.remove(cls) : document.body.classList.add(cls)
    }
  }
  render() {
    const { props } = this
    const RouteComponent = props.route.component
    return <RouteComponent {...props} />
  }
}
