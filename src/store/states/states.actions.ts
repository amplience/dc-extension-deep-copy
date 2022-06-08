import { WorkflowState } from 'dc-management-sdk-js';

export const SET_STATES = 'SET_STATES';

export const setStates = (value: WorkflowState[]) => ({
  type: SET_STATES,
  value,
});
