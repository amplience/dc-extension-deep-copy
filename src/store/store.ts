import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import logger from 'redux-logger';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { contentItemsReducer } from './contentItems/contentItems.reducer';
import { errorReducer } from './error/error.reducer';
import { loadingsReducer } from './loadings/loadings.reducer';
import { sdkReducer } from './sdk/sdk.reducer';
import { contentTypesReducer } from './contentTypes/contentTypes.reducer';
import { statesReducer } from './states/states.reducer';

export const rootReducer = combineReducers({
  contentItems: contentItemsReducer,
  error: errorReducer,
  loadings: loadingsReducer,
  sdk: sdkReducer,
  states: statesReducer,
  contentTypes: contentTypesReducer,
});

export const store = createStore(
  rootReducer,
  compose(applyMiddleware(thunkMiddleware as ThunkMiddleware, logger))
);

export type AppDispatch = typeof store.dispatch;
