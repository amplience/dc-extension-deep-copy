import {
  ContentItem,
  DynamicContent,
  ContentGraph,
  ContentType,
  WorkflowState,
} from 'dc-management-sdk-js';
import arrayToTree from 'array-to-tree';
import { UserInterface } from '../../types/types';

interface Props {
  contentItem: ContentItem;
  dcManagement: DynamicContent | undefined;
  contentTypes: ContentType[];
  users: UserInterface[];
  states: WorkflowState[];
}

const convertTreeToList = (tree: any, acc: any) => {
  tree.forEach((item: any) => {
    const parent = acc.find(({ id }: any) => id === item.parentId);

    acc.push({
      ...item,
      level: parent ? (parent.level || 0) + 1 : 0,
    });

    if (item.children) {
      convertTreeToList(item.children, acc);
    }
  });

  return acc;
};

export const deepCopy = async (
  ids: string[],
  contentItemProvider: (id: string) => Promise<ContentItem>,
  contentItemPicker: (
    original: ContentItem,
    body: any,
    parentId: string | undefined
  ) => Promise<ContentItem>
): Promise<any> => {
  const cache: any = {};
  const mapping: any = {};
  const updateAfter: any = {};

  const processItem = (
    id: string,
    parentId: string | undefined
  ): Promise<ContentItem> => {
    if (cache[id]) {
      return cache[id];
    }
    return (cache[id] = contentItemProvider(id)
      .then((item) => {
        // visit children
        const links = ContentGraph.extractLinks(item.body);

        return Promise.all(
          links.map(async (link) => {
            if (cache[link.id]) {
              // eslint-disable-next-line no-return-await
              return item;
            }
            return processItem(link.id, item.id);
          })
        ).then(() => item);
      })
      .then((item) => {
        // Rewrite the body so that linked items point to the id of the copy
        const body: any = JSON.parse(JSON.stringify(item.body));
        const links = ContentGraph.extractLinks(body);
        let needUpdateAfter = false;
        // eslint-disable-next-line no-restricted-syntax
        for (const link of links) {
          if (!mapping[link.id]) {
            needUpdateAfter = true;
          }
          link.id = mapping[link.id] || link.id;
        }

        // Let the application choose how to copy the item
        const newItem = contentItemPicker(item, body, parentId);

        return newItem.then((newItemValue) => {
          mapping[item.id] = newItemValue.id;
          if (needUpdateAfter) {
            updateAfter[newItemValue.id] = true;
          }

          return {
            ...newItem,
            parentId,
          };
        });
      }));
  };

  await Promise.all(ids.map((id) => processItem(id, undefined)));

  return {
    mapping,
    updateAfter,
  };
};

export const getContentDependency = async ({
  contentItem,
  dcManagement,
  contentTypes,
  users,
  states,
}: Props) => {
  const structure = {
    id: contentItem.id,
    label: contentItem.label,
    locale: contentItem.locale,
    assignees: contentItem.assignees,
    lastModifiedDate: contentItem.lastModifiedDate,
    schema: contentItem.body._meta.schema,
    children: [],
  };
  const flatList: any = [];
  if (!dcManagement) {
    return structure;
  }
  await deepCopy(
    [contentItem.id],
    dcManagement.contentItems.get,
    async (
      contentItem,
      body,
      parentId: string | undefined
    ): Promise<ContentItem> => {
      const ct =
        contentTypes &&
        contentTypes.find(
          ({ contentTypeUri }: any) => contentTypeUri === body._meta.schema
        );
      const {
        id,
        label,
        locale,
        lastModifiedDate,
        assignees = [],
        workflow,
        body: itemBody,
      } = contentItem;
      flatList.push({
        id,
        label,
        locale,
        parentId,
        schema: ct || {},
        lastModifiedDate,
        status:
          states &&
          states.find(({ id }: WorkflowState) => id === workflow?.state),
        assignees: assignees.map((assignee) =>
          users.find(({ id: userId }: { id: string }) => assignee === userId)
        ),
        body: itemBody,
      });
      return contentItem;
    }
  );

  const sortedList = arrayToTree(flatList, {
    parentProperty: 'parentId',
    customID: 'id',
  });

  return convertTreeToList(sortedList, []);
};
