import React from 'react';
import {
  makeStyles,
  Table as TableComponent,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@material-ui/core';
import { ContentItem } from 'dc-management-sdk-js';

interface Column {
  id: string;
  width?: number;
  className?: string;
  ignoreWrap?: boolean;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
  format?: (value: any) => any;
}

interface TableComponentProps {
  columns: Column[];
  data: object[] | ContentItem[];
  onDoubleClick: Function;
  className?: string;
}

const useStyles = makeStyles(() => ({
  root: {
    padding: '0 44px',
  },
  cell: {
    padding: '12px',
  },
  withSvg: {
    padding: '6px',

    '& svg': {
      verticalAlign: 'middle',
    },
  },
  row: {
    '&:first-child': {
      '& > td': {
        borderTop: '1px solid rgba(224, 224, 224, 1);',
      },
    },
  },
}));

function Table({
  columns,
  data,
  onDoubleClick,
  className = '',
}: TableComponentProps) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <TableContainer>
        <TableComponent aria-label="sticky table">
          <TableBody className={className}>
            {data.map((row: any, index: number) => (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={`row_${index}`}
                classes={{
                  root: classes.row,
                }}
                onDoubleClick={() => onDoubleClick(row)}
              >
                {columns.map((column, ind) => {
                  const value = row[column.id];
                  return (
                    <TableCell
                      key={`cell_${index}_${ind}`}
                      align={column.align}
                      width={column.width || 'auto'}
                      classes={{
                        root: column.className ? classes.withSvg : classes.cell,
                      }}
                      style={{
                        minWidth: column.width,
                        maxWidth: column.width,
                      }}
                    >
                      {column.ignoreWrap ? (
                        column.format && typeof column.format === 'function' ? (
                          column.format(value || row)
                        ) : (
                          value
                        )
                      ) : (
                        <span
                          style={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {column.format && typeof column.format === 'function'
                            ? column.format(value || row)
                            : value}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </TableComponent>
      </TableContainer>
    </Paper>
  );
}

Table.defaultProps = {
  className: '',
};

export default Table;
