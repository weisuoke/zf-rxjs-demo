import React, { PureComponent } from 'react'
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom'
import AppRouteComponent from 'src/components/Navigation/AppRouteComponent'
import { routes } from 'src/router'

class AppScheduler extends PureComponent<RouteComponentProps> {
  renderRoutes() {
    return routes.map(route => (
      <Route
        exact
        path={route.path}
        key={route.path}
        render={props => <AppRouteComponent {...props} {...this.props} route={route} />}
      />
    ))
  }
  renderComponent() {
    return <Switch>{this.renderRoutes()}</Switch>
  }
  render() {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <button>
            <a href="/rx-mini-redux-todo">3.1 rx-mini-redux</a>
          </button>
          <button>
            <a href="/fetch">3.2 fetch示例</a>
          </button>
          <button disabled>
            <a href="#">3.3 operator实战 制作中...</a>
          </button>
        </div>
        <div style={{ width: '800px', margin: '60px auto ' }}>{this.renderComponent()}</div>
      </>
    )
  }
}
export default withRouter(AppScheduler)
