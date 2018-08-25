import * as React from 'react'
import { createStore, combineReducers, compose, applyMiddleware, Store, StoreEnhancer } from 'redux'
import { persistState, createDevTools, IDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'
import promiseMiddleware from '../reducers/clientMiddleware'
import ReduxThunk from 'redux-thunk' 
import DevTools from '../components/DevTools'

import rootReducer from '../reducers';

import { routerReducer, routerMiddleware } from 'react-router-redux'

declare const window: any;
const environment: any = typeof window !== 'undefined' ? window : this;

const enhancer = compose(
  applyMiddleware(
    ReduxThunk,
  ),
  applyMiddleware(
    promiseMiddleware
  ),
  DevTools.instrument()
)

export function configureStore(initialState) {

  const store = createStore(
    rootReducer,
    initialState,
    enhancer
  )
  
  return store
}