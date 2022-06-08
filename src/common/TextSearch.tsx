import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, makeStyles, TextField } from '@material-ui/core';
import debounce from 'lodash/debounce';
import { Search, Clear } from '@mui/icons-material';
import { FilterInt, RootStateInt } from '../../types/types';
import {
  getContentItems,
  setFilter,
} from '../store/contentItems/contentItems.actions';

export const useStyles = makeStyles(() => ({
  searchBtn: {
    position: 'absolute',
    left: '5px',
    top: '8px',
    zIndex: 2,
    color: '#666666',
  },
  clearBtn: {
    position: 'absolute',
    right: 0,
    top: '5px',
  },
  input: {
    backgroundColor: 'transparent',

    '& > div': {
      backgroundColor: 'transparent',
    },
    '& input': {
      padding: '7px 24px 7px 28px',
      borderRadius: '6px',
      border: '1px solid #CCCCCC',
      background: '#F2F2F2',
      color: '#808080',
    },
  },
}));
function TextSearch() {
  const classes = useStyles();
  const dispatch = useDispatch();

  const dispatchDebounce = (value: string) => {
    dispatch(
      getContentItems(1, {
        ...filter,
        text: value,
      })
    );
  };
  const debouncedGetContentItems = debounce(dispatchDebounce, 1000);

  const {
    filter,
  }: {
    filter: FilterInt;
  } = useSelector((state: RootStateInt) => state.contentItems);
  const [visibleClear, setVisibleClear] = useState(Boolean(filter.text));
  return (
    <div style={{ position: 'relative' }}>
      <Search classes={{ root: classes.searchBtn }} fontSize="small" />
      <TextField
        placeholder="Find content..."
        variant="filled"
        name="label"
        value={filter.text}
        style={{
          minWidth: 250,
        }}
        classes={{
          root: classes.input,
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setVisibleClear(true);
          dispatch(
            setFilter({
              ...filter,
              text: e.target.value,
            })
          );
          debouncedGetContentItems(e.target.value);
        }}
      />
      {visibleClear ? (
        <IconButton
          title="Clear"
          aria-label="clear"
          size="small"
          onClick={() => {
            setVisibleClear(false);
            dispatch(
              setFilter({
                ...filter,
                text: '',
              })
            );
            debouncedGetContentItems('');
          }}
          classes={{ root: classes.clearBtn }}
        >
          <Clear fontSize="small" />
        </IconButton>
      ) : null}
    </div>
  );
}

export default TextSearch;
