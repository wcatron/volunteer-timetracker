import * as React from "react"
import { Provider } from "react-redux"
import { Route, browserHistory, IndexRoute, Router } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import App from './components/App'

import Index from './components/static/Index'
import Totals from './components/static/Totals'

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="totals" component={Totals} />
    </Route>
);

function authentication(nextState, replace, callback) {
    console.log('Check Authentication!')
    callback()
}