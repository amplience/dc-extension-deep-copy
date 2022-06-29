import { AnyAction } from 'redux';
import { SET_SDK } from './sdk.actions';
import { SDKInterface } from '../../../types/types';

export const defaultSdk = {
  connected: false,
  users: [],
  params: {
    hub: '',
  },
};

export function sdkReducer(
  state = defaultSdk,
  action: AnyAction
): SDKInterface {
  switch (action.type) {
    case SET_SDK:
      return { ...state, ...(action.value as SDKInterface) };
    default:
      return state;
  }
}
