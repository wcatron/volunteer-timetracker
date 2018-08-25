import { combineReducers, Action, applyMiddleware } from 'redux'
import { routerReducer } from 'react-router-redux';

const app = combineReducers({
    routing: routerReducer
})

export default app