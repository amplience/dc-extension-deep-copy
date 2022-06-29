import { AnyAction } from 'redux';
import {
  SET_CONTENT,
  SET_COPY,
  SET_DEPENDENCIES,
  SET_VALIDATION_LOADING,
} from './loadings.actions';
import { LoadingsInterface } from '../../../types/types';

const defaultState = {
  content: false,
  dependencies: false,
  validation: false,
  copy: false,
};

export function loadingsReducer(
  state = defaultState,
  action: AnyAction
): LoadingsInterface {
  switch (action.type) {
    case SET_CONTENT:
      return {
        ...state,
        content: Boolean(action.value),
      };
    case SET_DEPENDENCIES:
      return {
        ...state,
        dependencies: Boolean(action.value),
      };
    case SET_VALIDATION_LOADING:
      return {
        ...state,
        validation: Boolean(action.value),
      };
    case SET_COPY:
      return {
        ...state,
        copy: Boolean(action.value),
      };
    default:
      return state;
  }
}
