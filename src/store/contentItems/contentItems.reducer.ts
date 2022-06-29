import { AnyAction } from 'redux';

import {
  SET_CONTENT_ITEMS,
  SET_CONTENT_ITEMS_PAGINATION,
  SET_DEPENDENCIES_TREE,
  SET_FACETS,
  SET_FILTER,
  SET_SORT,
  SET_VALIDATION,
  CAN_COPY,
  SET_COPY_COUNT,
  RESET_VALIDATION,
  SET_SELECTED,
} from './contentItems.actions';

import { ContentItemsInterface } from '../../../types/types';

const defaultState = {
  data: [],
  selected: undefined,
  selectedDependencies: undefined,
  validation: {},
  canCopy: false,
  copiedCount: 0,
  facets: {
    repositories: [],
    contentTypes: [],
    statuses: [],
    assignees: [],
  },
  sort: {
    name: 'lastModifiedDate',
    order: 'desc',
  },
  filter: {
    contentTypes: [],
    assignees: [],
    statuses: [],
    repositories: '',
    text: '',
  },
  pagination: { page: 0, totalCount: 0 },
};

export function contentItemsReducer(
  state = defaultState,
  action: AnyAction
): ContentItemsInterface {
  switch (action.type) {
    case SET_CONTENT_ITEMS:
      return {
        ...state,
        data: [...action.value],
      };
    case SET_CONTENT_ITEMS_PAGINATION:
      return {
        ...state,
        pagination: { ...action.value },
      };
    case SET_FACETS:
      return {
        ...state,
        facets: { ...action.value },
      };
    case SET_FILTER:
      return {
        ...state,
        filter: { ...action.value },
      };
    case SET_SORT:
      return {
        ...state,
        sort: { ...action.value },
      };
    case SET_VALIDATION:
      return {
        ...state,
        validation: {
          ...state.validation,
          [action.value.id]: action.value,
        },
      };
    case RESET_VALIDATION:
      return {
        ...state,
        validation: {},
      };
    case SET_SELECTED:
      return {
        ...state,
        selected: action.value || undefined,
      };
    case SET_DEPENDENCIES_TREE:
      return {
        ...state,
        selectedDependencies: action.value,
        selected:
          action.value && action.value.length ? action.value[0] : undefined,
      };
    case CAN_COPY:
      return {
        ...state,
        canCopy: Boolean(action.value),
      };
    case SET_COPY_COUNT:
      return {
        ...state,
        copiedCount: Number(action.value),
      };
    default:
      return state;
  }
}
