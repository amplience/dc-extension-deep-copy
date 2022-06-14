import React, { useEffect } from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Refresh } from '@mui/icons-material';
import { ContentItem } from 'dc-management-sdk-js';
import { useHistory } from 'react-router-dom';
import Loader from '../../common/Loader';
import TablePagination from '../../common/TablePagination';
import Table from '../../common/Table';
import { AssigneeIcon } from '../../icons/Icons';
import {
  RootStateInt,
  ContentItemsInterface,
  UserInterface,
} from '../../../types/types';
import { getContentItems } from '../../store/contentItems/contentItems.actions';
import TableSort from '../../common/TableSort';
import TextSearch from '../../common/TextSearch';
import { LinkRouter } from '../dependencies/Dependencies';
import { getColour } from '../../utils/assigneeColour';

export const useStyles = makeStyles(() => ({
  refresh: {
    borderRight: '1px solid #cccccc',
    padding: '0 12px',

    '& button': {
      padding: '6px 12px',
    },
  },
  workflow: {
    display: 'inline-flex',
    justifyContent: 'center',
    marginLeft: 0,
    borderRadius: '5px',
    minHeight: '18px',
    lineHeight: '18px',
    width: 'auto',
    minWidth: '60px',
    maxWidth: '100%',
    padding: '0 5px',
  },
  navBarContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '68px',
    backgroundColor: '#fff',
    padding: '0 44px',
    border: 'none',
    justifyContent: 'space-between',
  },
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  styledAssignee: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '5px',
  },
  assigneeWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: '#333',
    fontSize: '13px',
  },
  rightContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function ContentItems() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { content }: any = useSelector((state: RootStateInt) => state.loadings);
  const { data, pagination }: ContentItemsInterface = useSelector(
    (state: RootStateInt) => state.contentItems
  );

  const columns = [
    {
      id: '_label',
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (row: ContentItem) => (
        <>
          <LinkRouter color="inherit" to={`/${row.id}`} underline="none">
            <span title={row.label} className="item-label">
              {row.label}
            </span>
          </LinkRouter>
          {row.locale ? <span className="locale-label">{row.locale}</span> : ''}
        </>
      ),
    },
    {
      id: 'assignees',
      width: 65,
      className: 'withAssignee',
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (assignees: UserInterface[]) => {
        const assigneesList = assignees
          .map((assignee) =>
            assignee ? `${assignee.firstName} ${assignee.lastName}` : ''
          )
          .join(', ');
        return assignees && assignees.length && assignees[0] ? (
          <div className={classes.assigneeWrap}>
            <div
              title={`Assigned to ${assigneesList}`}
              className={classes.styledAssignee}
              style={{ backgroundColor: getColour(assignees[0]) }}
            >
              <span>
                {assignees[0].firstName
                  ? assignees[0].firstName[0].toUpperCase()
                  : 'U'}
              </span>
            </div>
            {assignees.length > 1 ? `+ ${assignees.length - 1}` : ''}
          </div>
        ) : (
          <AssigneeIcon />
        );
      },
    },
    {
      id: '_status',
      width: 160,
      ignoreWrap: true,
      // eslint-disable-next-line react/no-unstable-nested-components
      format: (row: any) => (
        <span
          style={{
            backgroundColor: row.status ? row.status.color : '',
          }}
          className={classes.workflow}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {row.status ? row.status.label : ''}
          </span>
        </span>
      ),
    },
    {
      id: 'schema',
      width: 200,
      format: (schema: any) =>
        schema && schema.settings ? schema.settings.label : '',
    },
    {
      id: 'lastModifiedDate',
      width: 138,
      format: (lastModifiedDate: string) =>
        new Date(lastModifiedDate)
          .toLocaleString('en-GB', {
            hour12: false,
          })
          .replace(',', '')
          .substring(0, 16),
    },
  ];

  useEffect(() => {
    if (pagination && !pagination.page) {
      dispatch(getContentItems(1));
    }
  }, [pagination, dispatch]);

  return (
    <>
      {content ? <Loader className="content-loader" /> : null}
      <div className={classes.navBarContainer}>
        <div className={classes.leftContainer}>
          <TableSort />
        </div>
        <div className={classes.rightContainer}>
          <div className={classes.refresh}>
            <IconButton
              title="Refresh"
              onClick={() => dispatch(getContentItems(1))}
              aria-label="refresh"
            >
              <Refresh />
            </IconButton>
          </div>
          <TablePagination
            pagination={pagination}
            changePage={(page: number) => dispatch(getContentItems(page))}
          />
          <TextSearch />
        </div>
      </div>
      <Table
        onDoubleClick={(row: ContentItem) => {
          history.push(`/${row.id}`);
        }}
        columns={columns}
        data={data}
      />
    </>
  );
}

export default ContentItems;
