import * as React from "react"
import { render } from "react-dom"
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { configureStore } from "./store"
import { AppContainer } from 'react-hot-loader';
import app from './reducers'
const Root = require('./containers/Root').default;

let store = configureStore(app)
const history = syncHistoryWithStore(browserHistory, store);

// Tell Typescript that there is a global variable called module - see below
declare var module: { hot: any };

render(
    <AppContainer>
        <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./containers/Root', () => {
        const NewRoot = require('./containers/Root').default;
        render(
            <AppContainer>
                <NewRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}