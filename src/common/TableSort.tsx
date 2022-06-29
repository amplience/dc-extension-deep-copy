import React, { useMemo } from 'react';
import { makeStyles, Button, Menu, MenuItem } from '@material-ui/core';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { useDispatch, useSelector } from 'react-redux';
import { Done } from '@material-ui/icons';
import { getContentItems } from '../store/contentItems/contentItems.actions';
import { RootStateInt } from '../../types/types';

interface Option {
  label: string;
  value: string;
  order: string;
}
const useStyles = makeStyles(() => ({
  label: {
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '16px',
    paddingLeft: 0,
    color: '#999999',
    marginRight: '16px',
  },
  wrap: {},
  root: {
    border: 'none',
  },
  menu: {
    '& li': {
      fontSize: '12px',
    },
  },
  gutters: {
    paddingLeft: '32px',
    paddingRights: '20px',
  },
  selected: {
    color: '#039be5 !important',
    backgroundColor: 'transparent !important',

    '& > svg': {
      display: 'block !important',
    },
  },
  actions: {
    marginLeft: '5px',
  },
  iconClass: {
    display: 'none !important',
    position: 'absolute',
    left: '10px',
    fontSize: '16px !important',
  },
  btn: {
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '16px',
    paddingLeft: 0,
    color: '#333333',
    textTransform: 'none',

    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    color: '#999999',
  },
}));

const options: Option[] = [
  {
    label: 'Date modified newest',
    value: 'lastModifiedDate',
    order: 'desc',
  },
  {
    label: 'Date modified oldest',
    value: 'lastModifiedDate',
    order: 'asc',
  },
  {
    label: 'Date created newest',
    value: 'createdDate',
    order: 'desc',
  },
  {
    label: 'Date created oldest',
    value: 'createdDate',
    order: 'asc',
  },
  {
    label: 'Name A-Z',
    value: 'label',
    order: 'asc',
  },
  {
    label: 'Name Z-A',
    value: 'label',
    order: 'desc',
  },
  {
    label: 'Content type A-Z',
    value: 'contentType',
    order: 'asc',
  },
  {
    label: 'Content type Z-A',
    value: 'contentType',
    order: 'desc',
  },
];

function TableSort() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { sort }: any = useSelector(
    (state: RootStateInt) => state.contentItems
  );
  const selectedSort = useMemo(
    () =>
      options.find(
        ({ value, order }) =>
          sort && value === sort.name && order === sort.order
      ),
    [sort]
  );

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState: any) => (
        <div className={classes.wrap}>
          <span className={classes.label}>Sort by</span>
          <Button
            variant="text"
            classes={{
              root: classes.btn,
            }}
            {...bindTrigger(popupState)}
            endIcon={
              <ArrowDropDownIcon
                classes={{ root: classes.icon }}
                fontSize="large"
              />
            }
          >
            {selectedSort && selectedSort.label}
          </Button>
          <Menu
            getContentAnchorEl={null}
            className={classes.menu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            {...bindMenu(popupState)}
          >
            {options.map(({ label, value, order }, index) => (
              <MenuItem
                key={index}
                classes={{
                  selected: classes.selected,
                  gutters: classes.gutters,
                }}
                selected={
                  selectedSort &&
                  value === selectedSort.value &&
                  selectedSort.order === order
                }
                onClick={() => {
                  popupState.close();
                  dispatch(
                    getContentItems(0, null, {
                      name: value,
                      order,
                    })
                  );
                }}
              >
                <>
                  <Done fontSize="small" className={classes.iconClass} />
                  {label}
                </>
              </MenuItem>
            ))}
          </Menu>
        </div>
      )}
    </PopupState>
  );
}

export default TableSort;
