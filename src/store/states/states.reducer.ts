import { AnyAction } from 'redux';
import { WorkflowState } from 'dc-management-sdk-js';
import { SET_STATES } from './states.actions';

export function statesReducer(
  state = {
    data: [],
  },
  action: AnyAction
): {
  data: WorkflowState[];
} {
  switch (action.type) {
    case SET_STATES:
      return {
        ...state,
        data: action.value as WorkflowState[],
      };
    default:
      return state;
  }
}
