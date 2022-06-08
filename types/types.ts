import { DashboardExtension } from 'dc-extensions-sdk';
import {
  ContentItem,
  DynamicContent,
  ContentType,
  WorkflowState,
} from 'dc-management-sdk-js';

export interface Option {
  label: string;
  value: string | number;
  key?: any;
  color?: string;
  count?: number;
}

export interface Pagination {
  page: number;
  totalCount: number;
}

export interface ContentItemsInterface {
  data: ContentItem[];
  selected: ContentItem | undefined;
  selectedDependencies: ContentItem[] | undefined;
  validation: any;
  canCopy: boolean;
  copiedCount: number;
  facets: {
    repositories: Option[];
    contentTypes: Option[];
    statuses: Option[];
    assignees: Option[];
  };
  sort: {
    name: string;
    order: string;
  };
  filter: {
    contentTypes: string[];
    statuses: string[];
    assignees: string[];
    repositories: string;
    text: string;
  };
  pagination: Pagination;
}

export interface LoadingsInterface {
  content: boolean;
  dependencies: boolean;
  validation: boolean;
  copy: boolean;
}

export interface ParamsInt {
  hub: string;
}

export interface UserInterface {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
}

export interface SDKInterface {
  connected: boolean;
  SDK?: DashboardExtension;
  dcManagement?: DynamicContent;
  users: UserInterface[];
  params: ParamsInt;
}

export interface FilterInt {
  contentTypes: any[];
  statuses: any[];
  assignees: any[];
  repositories: string;
  text: string;
}

export interface FacetsInt {
  repositories: Option[];
  contentTypes: Option[];
  statuses: Option[];
  assignees: Option[];
}

export interface RootStateInt {
  contentItems: ContentItemsInterface;
  sdk: SDKInterface;
  error: string;
  loadings: LoadingsInterface;
  contentTypes: {
    data: ContentType[];
  };
  states: {
    data: WorkflowState[];
  };
}
