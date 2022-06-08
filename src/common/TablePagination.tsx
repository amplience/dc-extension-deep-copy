import React from 'react';
import { makeStyles, TablePagination } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  text: {
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '16px',
    paddingLeft: '24px',
  },
  root: {
    border: 'none',
    padding: '0 24px',
  },
  actions: {
    marginLeft: '5px',
    borderRight: '1px solid #cccccc',

    '& button': {
      padding: '6px 12px',
    },
  },
}));

interface TablePaginationInterface {
  pagination: {
    page: number;
    totalCount: number;
  };
  changePage: (page: number) => void;
}

function TablePaginationComponent({
  pagination,
  changePage,
}: TablePaginationInterface) {
  const classes = useStyles();

  return pagination.totalCount && pagination.totalCount > 1 ? (
    <TablePagination
      classes={{
        root: classes.root,
        toolbar: classes.text,
        actions: classes.actions,
      }}
      count={pagination.totalCount}
      page={pagination.page - 1}
      rowsPerPageOptions={[20]}
      onPageChange={(event, page) => {
        // eslint-disable-next-line no-unused-expressions
        event && event.stopPropagation();
        changePage(page + 1);
      }}
      rowsPerPage={20}
    />
  ) : null;
}

export default TablePaginationComponent;
