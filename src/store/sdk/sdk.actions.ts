import { DashboardExtension, init } from 'dc-extensions-sdk';
import { Dispatch } from 'redux';
import { DynamicContent } from 'dc-management-sdk-js';
import { setError } from '../error/error.actions';
import { SDKInterface, ParamsInt } from '../../../types/types';
import { defaultSdk } from './sdk.reducer';

export const SET_SDK = 'SET_SDK';

export const setSDK = (value: SDKInterface) => ({
  type: SET_SDK,
  value,
});

export const fetchSDK = () => async (dispatch: Dispatch) => {
  try {
    const extension: DashboardExtension = await init();
    const params: ParamsInt = {
      ...defaultSdk.params,
      ...extension.params.installation,
      ...extension.params.instance,
    };

    const users = await extension.users.list();

    return dispatch(
      setSDK({
        SDK: extension,
        params,
        connected: true,
        users,
        dcManagement: new DynamicContent({}, {}, extension && extension.client),
      })
    );
  } catch (e: any) {
    return dispatch(setError(e.toString()));
  }
};
