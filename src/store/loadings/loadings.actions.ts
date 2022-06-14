export const SET_CONTENT = 'SET_CONTENT';
export const SET_DEPENDENCIES = 'SET_DEPENDENCIES';
export const SET_VALIDATION_LOADING = 'SET_VALIDATION_LOADING';
export const SET_COPY = 'SET_COPY';

export const setContentLoader = (value: boolean) => ({
  type: SET_CONTENT,
  value,
});
export const setValidationLoader = (value: boolean) => ({
  type: SET_VALIDATION_LOADING,
  value,
});
export const setDependenciesLoader = (value: boolean) => ({
  type: SET_DEPENDENCIES,
  value,
});
export const setCopyLoader = (value: boolean) => ({
  type: SET_COPY,
  value,
});
