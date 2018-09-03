import * as React from "react"
import { Provider } from "react-redux"
import { Route, browserHistory, IndexRoute, Router } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import App from './components/App'

import Index from './components/static/Index'
import Admin from './components/static/Admin'
import Totals from './components/static/Totals'
import People from './components/static/People'
import Categories from './components/static/Categories'

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="/admin" component={Admin}>
            <IndexRoute component={Totals} />
            <Route path="totals" component={Totals} />
            <Route path="volunteers" component={People} />
            <Route path="categories" component={Categories} />
        </Route>
    </Route>
);

function authentication(nextState, replace, callback) {
    console.log('Check Authentication!')
    callback()
}