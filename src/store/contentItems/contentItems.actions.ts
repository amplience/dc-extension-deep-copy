import { Dispatch } from 'redux';
import {
  ContentItem,
  ContentRepository,
  EnumFacet,
  WorkflowState,
  ContentGraph,
} from 'dc-management-sdk-js';
import compact from 'lodash/compact';
import { history } from '../../App';
import { setError } from '../error/error.actions';
import {
  setContentLoader,
  setCopyLoader,
  setDependenciesLoader,
  setValidationLoader,
} from '../loadings/loadings.actions';
import {
  FacetsInt,
  FilterInt,
  Option,
  Pagination,
  RootStateInt,
} from '../../../types/types';
import { setContentTypes } from '../contentTypes/contentTypes.actions';
import { setStates } from '../states/states.actions';
import { deepCopy, getContentDependency } from '../../utils/ContentDependency';
import {
  AmplienceSchemaValidator,
  defaultSchemaLookup,
} from '../../utils/SchemaValidator';
import paginator from '../../utils/paginator';
import { AppDispatch } from '../store';

export const SET_CONTENT_ITEMS = 'SET_CONTENT_ITEMS';
export const SET_CONTENT_ITEMS_PAGINATION = 'SET_CONTENT_ITEMS_PAGINATION';
export const SET_FACETS = 'SET_FACETS';
export const SET_FILTER = 'SET_FILTER';
export const SET_SORT = 'SET_SORT';
export const SET_DEPENDENCIES_TREE = 'SET_DEPENDENCIES_TREE';
export const SET_VALIDATION = 'SET_VALIDATION';
export const CAN_COPY = 'CAN_COPY';
export const SET_COPY_COUNT = 'SET_COPY_COUNT';
export const RESET_VALIDATION = 'RESET_VALIDATION';
export const SET_SELECTED = 'SET_SELECTED';

export const setContent = (value: ContentItem[]) => ({
  type: SET_CONTENT_ITEMS,
  value,
});

export const canCopy = (value: boolean) => ({
  type: CAN_COPY,
  value,
});

export const setCopyCount = (value: number) => ({
  type: SET_COPY_COUNT,
  value,
});

export const setSort = (value: { name: string; order: string }) => ({
  type: SET_SORT,
  value,
});

export const setFacets = (value: FacetsInt) => ({
  type: SET_FACETS,
  value,
});

export const setFilter = (value: FilterInt) => ({
  type: SET_FILTER,
  value,
});

export const setPagination = (value: Pagination) => ({
  type: SET_CONTENT_ITEMS_PAGINATION,
  value,
});

export const getContentItems =
  (
    pageNumber: number,
    filterNew?: any,
    sortObject?: any,
    onlyFacets?: boolean
  ) =>
  async (dispatch: Dispatch, getState: () => RootStateInt) => {
    try {
      const {
        sdk: {
          dcManagement,
          users,
          params: { hub: hubId },
        },
        contentItems: { sort, filter: appliedFilter },
        contentTypes: { data: contentTypesList },
        states: { data: statesList },
      }: RootStateInt = getState();
      const filter = filterNew || appliedFilter;
      const sortToApply = sortObject
        ? `${sortObject.name},${sortObject.order}`
        : `${sort.name},${sort.order}`;
      if (!dcManagement) {
        return dispatch(setError('No DC Management SDK found'));
      }

      dispatch(setContentLoader(true));

      if (sortObject) {
        dispatch(setSort(sortObject));
      }
      const hub = await dcManagement.hubs.get(hubId);
      const repositories = (
        await hub.related.contentRepositories.list({ size: 100 })
      ).getItems();

      const repoFilter = (filter && filter.repositories) || '';

      const assigneeFilter: EnumFacet =
        filter && filter.assignees && filter.assignees.length
          ? {
              facetAs: 'ENUM',
              field: 'assignees',
              filter: {
                type: 'IN',
                values: filter && filter.assignees,
              },
            }
          : {
              facetAs: 'ENUM',
              field: 'assignees',
            };

      const schemasFilter: EnumFacet =
        filter && filter.contentTypes && filter.contentTypes.length
          ? {
              facetAs: 'ENUM',
              field: 'schema',
              name: 'schema',
              filter: {
                type: 'IN',
                values: filter.contentTypes.map((el: any) => el.toLowerCase()),
              },
            }
          : {
              facetAs: 'ENUM',
              field: 'schema',
              name: 'schema',
            };

      const statusesFilter: EnumFacet =
        filter && filter.statuses && filter.statuses.length
          ? {
              facetAs: 'ENUM',
              field: 'workflow.state',
              filter: {
                type: 'IN',
                values: filter && filter.statuses,
              },
            }
          : {
              facetAs: 'ENUM',
              field: 'workflow.state',
            };
      const facets = await hub.related.contentItems.facet(
        {
          fields: [schemasFilter, statusesFilter, assigneeFilter],
          returnEntities: !onlyFacets,
        },
        {
          query: `status:"ACTIVE"${
            repoFilter ? `contentRepositoryId:${repoFilter}` : ''
          }${(filter && filter.text) || ''}`,
          page: pageNumber - 1,
          size: 20,
          sort: sortToApply,
        }
      );

      const content = facets.getItems();
      const contentTypes =
        contentTypesList && !contentTypesList.length
          ? await paginator(hub.related.contentTypes.list)
          : contentTypesList;

      const states =
        statesList && !statesList.length
          ? await paginator(hub.related.workflowStates.list)
          : statesList;

      dispatch(setContentTypes(contentTypes));
      dispatch(setStates(states));

      if (facets && facets._facets) {
        dispatch(
          setFacets({
            assignees: compact(
              facets._facets.assignees.map(({ _id, count }) => {
                const user = users.find(
                  ({ id: userId }: { id: string }) => _id === userId
                );

                if (!user && _id === 'UNASSIGNED') {
                  return {
                    label: 'Unassigned',
                    value: _id,
                    count: parseInt(count, 10),
                  };
                }

                return (
                  user && {
                    label: `${user.firstName} ${user.lastName}`,
                    value: user.id,
                    count: parseInt(count, 10),
                  }
                );
              })
            ) as Option[],
            repositories: repositories.map((el: ContentRepository) => ({
              label: el.label,
              value: el.id,
            })) as Option[],
            contentTypes: compact(
              facets._facets.schema.map(({ _id, count }) => {
                const ct =
                  contentTypes &&
                  contentTypes.find(
                    ({ contentTypeUri }: any) =>
                      contentTypeUri &&
                      contentTypeUri.toLowerCase() === _id.toLowerCase()
                  );
                return (
                  ct &&
                  ct.settings && {
                    label: ct.settings.label,
                    value: ct.contentTypeUri,
                    count: parseInt(count, 10),
                  }
                );
              })
            ) as Option[],
            statuses: compact(
              facets._facets.state.map(({ _id, count }) => {
                const state =
                  states && states.find(({ id }: WorkflowState) => id === _id);
                return state
                  ? {
                      label: state.label,
                      value: state.id,
                      color: state.color,
                      count: parseInt(count, 10),
                    }
                  : null;
              })
            ) as Option[],
          })
        );
      }

      if (onlyFacets) {
        return dispatch(setContentLoader(false));
      }

      const mappedContent: ContentItem[] = await Promise.all(
        content.map(
          async ({
            id,
            locale,
            label,
            schema,
            assignees = [],
            lastModifiedDate,
            workflow,
          }) => {
            const ct =
              contentTypes &&
              contentTypes.find(
                ({ contentTypeUri }: any) => contentTypeUri === schema
              );
            return new ContentItem({
              id,
              label,
              locale,
              schema: ct || {},
              lastModifiedDate,
              status:
                states &&
                states.find(({ id }: WorkflowState) => id === workflow?.state),
              assignees: assignees.map((assignee) =>
                users.find(
                  ({ id: userId }: { id: string }) => assignee === userId
                )
              ),
            });
          }
        )
      );

      dispatch(setContent(mappedContent));

      if (facets && facets.page && facets.page.number !== undefined) {
        dispatch(
          setPagination({
            page: facets.page.number + 1,
            totalCount: facets.page.totalElements || 0,
          })
        );
      }

      return dispatch(setContentLoader(false));
    } catch (e: any) {
      dispatch(setError(e.toString()));
      return dispatch(setContentLoader(false));
    }
  };

export const getSelectedWithDependencies =
  (id?: string) =>
  async (dispatch: AppDispatch, getState: () => RootStateInt) => {
    try {
      const {
        contentItems: { selected },
        sdk: {
          dcManagement,
          params: { hub: hubId },
          users,
        },
        contentTypes: { data: contentTypesList },
        states: { data: statesList },
      }: RootStateInt = getState();
      dispatch(setDependenciesLoader(true));
      dispatch({
        type: SET_DEPENDENCIES_TREE,
        value: undefined,
      });
      dispatch(canCopy(false));
      dispatch({
        type: RESET_VALIDATION,
      });
      const contentItemId = id || (selected ? selected.id : '');
      let contentTypes = contentTypesList;

      if (!dcManagement) {
        return false;
      }
      const hub = await dcManagement.hubs.get(hubId);

      if (contentTypesList && !contentTypesList.length) {
        contentTypes = await paginator(hub.related.contentTypes.list);
      }

      const selectedItem = await dcManagement?.contentItems.get(contentItemId);

      dispatch({
        type: SET_SELECTED,
        value: selectedItem,
      });

      const tree = await getContentDependency({
        contentItem: selectedItem || new ContentItem({}),
        dcManagement,
        contentTypes,
        users,
        states: statesList,
      });

      dispatch({
        type: SET_DEPENDENCIES_TREE,
        value: tree,
      });

      dispatch(validateDependencies() as any);
      return dispatch(setDependenciesLoader(false));
    } catch (e: any) {
      dispatch(setError(e.toString()));
      return dispatch(setContentLoader(false));
    }
  };

export const copyItems =
  (changedNames: any) =>
  async (dispatch: Dispatch, getState: () => RootStateInt) => {
    try {
      const startTime = new Date().getTime();
      const {
        contentItems: { selected },
        sdk: { dcManagement },
      }: RootStateInt = getState();
      let copied = 0;
      const idMappingTable: any = {};
      const repoCache: any = {};

      if (!dcManagement) {
        dispatch(setError('No SDK'));
        return dispatch(setValidationLoader(false));
      }

      if (!selected) {
        dispatch(setError('No Content Item to copy'));
        return dispatch(setCopyLoader(false));
      }

      dispatch(setCopyLoader(true));

      const { mapping, updateAfter } = await deepCopy(
        [selected.id],
        dcManagement.contentItems.get,
        async (contentItem, body) => {
          if (idMappingTable[contentItem.id]) {
            dispatch(setCopyCount(++copied));
            return idMappingTable[contentItem.id];
          }

          if (!repoCache[contentItem.contentRepositoryId]) {
            repoCache[contentItem.contentRepositoryId] =
              await dcManagement.contentRepositories.get(
                contentItem.contentRepositoryId
              );
          }

          console.log({
            ...contentItem.toJSON(),
            label: changedNames[contentItem.id] || contentItem.label,
            body: body,
            version: 1,
          });
          idMappingTable[contentItem.id] = await repoCache[
            contentItem.contentRepositoryId
          ].related.contentItems.create(
            new ContentItem({
              ...contentItem.toJSON(),
              label: changedNames[contentItem.id] || contentItem.label,
              body: {
                ...body,
                _meta: {
                  ...body._meta,
                  deliveryKey: null,
                },
              },
              version: 1,
              id: null,
              locale: null,
              workflow: null,
              lastPublishedDate: null,
              assignees: null,
            })
          );

          dispatch(setCopyCount(++copied));

          return idMappingTable[contentItem.id];
        }
      );

      const updateIds = Object.keys(updateAfter);
      if (updateIds.length) {
        await Promise.all(
          updateIds.map(async (id) => {
            const contentItem = await dcManagement.contentItems.get(id);

            const body: any = JSON.parse(JSON.stringify(contentItem.body));
            const links = ContentGraph.extractLinks(body);
            // eslint-disable-next-line no-restricted-syntax
            for (const link of links) {
              link.id = mapping[link.id];
            }

            await contentItem.related.update({
              ...contentItem.toJSON(),
              body,
            });
          })
        );
      }

      const endTime = new Date().getTime();

      if (endTime - startTime < 5000) {
        return setTimeout(() => {
          history.push('/');
          dispatch(setCopyLoader(false));
        }, 5000);
      }

      history.push('/');
      return dispatch(setCopyLoader(false));
    } catch (e: any) {
      dispatch(setError(e.toString()));
      return dispatch(setCopyLoader(false));
    }
  };

export const validateDependencies =
  () => async (dispatch: Dispatch, getState: () => RootStateInt) => {
    try {
      const {
        contentItems: { selectedDependencies },
        sdk: {
          dcManagement,
          params: { hub: hubId },
        },
        contentTypes: { data: contentTypesList },
      }: RootStateInt = getState();
      let contentTypes = contentTypesList;
      let isError = false;

      if (!dcManagement) {
        dispatch(setError('No SDK'));
        return dispatch(setValidationLoader(false));
      }
      dispatch(setValidationLoader(true));
      dispatch(canCopy(false));
      dispatch(setCopyCount(0));

      const hub = await dcManagement.hubs.get(hubId);

      if (contentTypesList && !contentTypesList.length) {
        contentTypes = await paginator(hub.related.contentTypes.list);
      }

      const schemas = await paginator(hub.related.contentTypeSchema.list);

      const validator = new AmplienceSchemaValidator(
        defaultSchemaLookup(contentTypes, schemas)
      );

      if (!selectedDependencies) {
        dispatch(setError('Could not find dependencies'));
        return dispatch(setValidationLoader(false));
      }

      await Promise.all(
        selectedDependencies?.map(async (item) => {
          try {
            const errors = await validator.validate(item.body);
            if (errors.length > 0) {
              isError = true;
              dispatch({
                type: SET_VALIDATION,
                value: {
                  id: item.id,
                  isValid: false,
                  status:
                    'does not validate under the available schema, it may not import correctly',
                },
              });
            } else {
              dispatch({
                type: SET_VALIDATION,
                value: {
                  id: item.id,
                  isValid: true,
                },
              });
            }
          } catch (e) {
            isError = true;
            dispatch(setValidationLoader(false));
            dispatch({
              type: SET_VALIDATION,
              value: {
                id: item.id,
                isValid: false,
                status: 'could not validate',
              },
            });
          }
        })
      );

      if (!isError) {
        dispatch(canCopy(true));
      }
      return dispatch(setValidationLoader(false));
    } catch (e: any) {
      console.log(e);
      dispatch(setError(e.toString()));
      return dispatch(setValidationLoader(false));
    }
  };
