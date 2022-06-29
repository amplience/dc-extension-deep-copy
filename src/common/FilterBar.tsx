import React, { useEffect, useState } from 'react';
import {
  Popover,
  makeStyles,
  FormControl,
  FormControlLabel,
  RadioGroup,
  FormLabel,
  Radio,
  Checkbox,
  FormGroup,
} from '@material-ui/core';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import {
  getContentItems,
  setFilter as setFilterValue,
} from '../store/contentItems/contentItems.actions';
import {
  FacetsInt,
  FilterInt,
  Option,
  Pagination,
  RootStateInt,
} from '../../types/types';
import { FilterIcon } from '../icons/Icons';

export const useStyles = makeStyles(() => ({
  colorContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterCont: {
    padding: '16px 0',
    height: 'calc(100% - 80px)',
  },
  totalLabel: {
    margin: '16px',
  },
  colorDiv: {
    height: 18,
    width: 18,
    borderRadius: '3px',
    display: 'inline-block',
  },
  filterBtn: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: '0 16px',
    height: 24,
    width: 24,
    minHeight: 24,
    minWidth: 24,
    borderRadius: 3,
    '& image': {
      width: 24,
      height: 24,
    },
    '&:hover': {
      backgroundColor: '#c5c5c5',
    },
  },
  filterBar: {
    display: 'flex',
    margin: '10px 0 10px 12px',
    paddingLeft: '12px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  filterLabel: {
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '16px',
    paddingLeft: 0,
    color: '#666666',
  },
  filterIconWrap: {
    whiteSpace: 'nowrap',
  },
  filterStatus: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
    },
    '& button': {
      height: 12,
      width: 12,
      minWidth: 12,
      minHeight: 12,
      cursor: 'pointer',
      margin: '2px 0 0 8px',
      '& svg': {
        width: 13,
        height: 13,
      },
    },
    '& > button, a': {
      border: 'none',
      borderRadius: 8,
      padding: '2px 8px 2px 0',
      margin: '4px 8px 4px 0',
      backgroundColor: '#f2f2f2',
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      width: 'unset',
      height: 'unset',
      minWidth: 'unset',
      minHeight: 'unset',
    },
    '& label': {
      fontSize: 12,
      color: '#333',
      fontWeight: 400,
      margin: '3px 0',
      cursor: 'pointer',
    },
  },
  filterName: {
    fontSize: 12,
    color: '#666',
    margin: '0 8px 0 0',
    fontWeight: 400,
    fontFamily: 'Roboto',
  },
  filterValue: {
    display: 'flex',
    margin: '5px 0',
    '& button': {
      height: 12,
      width: 12,
      minWidth: 12,
      minHeight: 12,
      cursor: 'pointer',
      margin: '2px 0 0 8px',
      '& svg': {
        width: 13,
        height: 13,
      },
    },
    '& > button, a': {
      border: 'none',
      borderRadius: 8,
      padding: '2px 8px',
      margin: '4px 8px 4px 0',
      backgroundColor: '#f2f2f2',
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      width: 'unset',
      height: 'unset',
      minWidth: 'unset',
      minHeight: 'unset',
    },
  },
  popover: {
    minWidth: 800,
    height: 'calc(100vh - 80px)',
  },
  group: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexWrap: 'unset',
  },
  overflow: {
    overflow: 'hidden',
  },
  filterHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottom: '1px solid #e5e5e5',

    '& span': {
      fontSize: 14,
      fontWeight: 500,
    },

    '& h3': {
      fontSize: 14,
      fontWeight: 500,
      margin: 0,
    },

    '& button': {
      marginRight: 20,
      height: 30,
      lineHeight: 30,
      minHeight: 30,
      borderRadius: 3,
      boxShadow: 'none!important',
    },
  },
  filterOptions: {
    display: 'flex',
    padding: '16px 8px 16px 16px',
    height: 'calc(100% - 36px)',

    '& > fieldset': {
      minWidth: 200,
      marginRight: '30px',
    },

    '& legend': {
      fontSize: 14,
      fontWeight: 500,
      padding: '23px 0',
      color: 'rgba(0, 0, 0, 0.87)',
    },

    '& span': {
      transition: 'opacity .15s',
      marginBottom: 0,
      outline: 'none',
      fontSize: 13,
    },

    '& hr': {
      margin: '0 16px',
    },
  },
  radio: {
    '& svg': {
      width: 16,
      height: 16,
    },
  },
}));

export function FilterStatus({ label, onClear }: any) {
  return (
    <button type="reset">
      {label}
      <IconButton size="small" onClick={onClear}>
        <ClearIcon />
      </IconButton>
    </button>
  );
}

function FilterBar() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    filter: appliedFilter,
    facets,
    pagination: { totalCount },
  }: {
    filter: FilterInt;
    facets: FacetsInt;
    pagination: Pagination;
  } = useSelector((state: RootStateInt) => state.contentItems);
  const [filter, setFilter] = useState<FilterInt>(appliedFilter);

  const dispatchDebounce = (filter?: FilterInt, onlyFacets?: boolean) => {
    dispatch(getContentItems(1, filter, null, onlyFacets));
  };
  const debouncedGetContentItems = debounce(dispatchDebounce, 1000);

  useEffect(() => {
    debouncedGetContentItems(filter);
  }, [filter, dispatch]);

  const applyFilter = (
    filterItem: FilterInt,
    popupState: any,
    onlyFacets?: boolean
  ) => {
    dispatch(
      setFilterValue({
        ...filterItem,
        text: appliedFilter.text,
      })
    );
    dispatch(getContentItems(1, filterItem, null, onlyFacets));
    popupState.close();
  };

  const onRemoveFilterValue = (
    key: 'assignees' | 'contentTypes' | 'statuses',
    id: string
  ) => {
    const currentList: string[] = filter[key] || [];

    if (currentList.includes(id)) {
      currentList.splice(currentList.indexOf(id), 1);

      setFilter({
        ...filter,
        [key]: currentList,
      });

      debouncedGetContentItems({
        ...filter,
        [key]: currentList,
      });
    }
  };

  const handleChange = (
    key: 'assignees' | 'contentTypes' | 'statuses',
    id: any
  ) => {
    const currentList: string[] = filter[key] || [];

    if (currentList.includes(id)) {
      currentList.splice(currentList.indexOf(id), 1);

      return setFilter({
        ...filter,
        [key]: currentList,
      });
    }

    return setFilter({
      ...filter,
      [key]: [...currentList, id],
    });
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  function FilterBlock({
    name,
    keyName,
    options,
  }: {
    name: string;
    keyName: 'assignees' | 'contentTypes' | 'statuses';
    options: Option[];
  }) {
    return (
      <FormControl component="fieldset">
        <FormLabel component="legend">{name}</FormLabel>
        <FormGroup aria-label={name} className={classes.group}>
          {options.map(
            ({ label, value, count, color }: Option, index: number) => (
              <div className={classes.colorContainer} key={index}>
                <FormControlLabel
                  value={value}
                  control={
                    <Checkbox
                      checked={
                        filter[keyName] && filter[keyName].includes(value)
                      }
                      className={classes.radio}
                      onChange={() => handleChange(keyName, value || '')}
                      color="primary"
                    />
                  }
                  label={`${label} (${count})`}
                />
                {color ? (
                  <div
                    style={{ backgroundColor: color }}
                    className={classes.colorDiv}
                  />
                ) : null}
              </div>
            )
          )}
        </FormGroup>
      </FormControl>
    );
  }

  const currentRepo = facets.repositories.find(
    (el: Option) => el.value === filter.repositories
  );

  const clearFilter = (key = 'repositories') => {
    setFilter({
      ...filter,
      [key]: '',
    });
    dispatch(
      setFilterValue({
        ...filter,
        [key]: '',
      })
    );

    debouncedGetContentItems({
      ...filter,
      [key]: '',
    });
  };

  const handleSetFilter = (e: any, key = 'repositories') => {
    setFilter({
      ...filter,
      [key]: e.target.value || '',
    });
  };

  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div className={classes.filterBar}>
          <div className={classes.filterStatus}>
            {appliedFilter.repositories ? (
              <>
                <h3 className={classes.filterName}>Repository</h3>
                <FilterStatus
                  popupState={popupState}
                  label={currentRepo && currentRepo.label}
                  value={appliedFilter.repositories}
                  onClear={() => clearFilter()}
                />
              </>
            ) : null}
            {appliedFilter.assignees.length ? (
              <>
                <h3 className={classes.filterName}>Assignee</h3>
                {appliedFilter.assignees.map((id: string) => {
                  const user = facets.assignees.find(
                    (el: Option) => el.value === id
                  );

                  return (
                    user && (
                      <FilterStatus
                        popupState={popupState}
                        label={user && user.label}
                        value={id}
                        onClear={() => onRemoveFilterValue('assignees', id)}
                      />
                    )
                  );
                })}
              </>
            ) : null}
            {appliedFilter.contentTypes.length ? (
              <>
                <h3 className={classes.filterName}>Content Type</h3>

                {appliedFilter.contentTypes.map((id: string) => {
                  const ct = facets.contentTypes.find(
                    (el: Option) => el.value === id
                  );
                  return (
                    ct && (
                      <FilterStatus
                        popupState={popupState}
                        label={ct && ct.label}
                        value={id}
                        onClear={() => onRemoveFilterValue('contentTypes', id)}
                      />
                    )
                  );
                })}
              </>
            ) : null}
            {appliedFilter.statuses.length ? (
              <>
                <h3 className={classes.filterName}>Status</h3>
                {appliedFilter.statuses.map((id: string) => {
                  const elem = facets.statuses.find(
                    (el: Option) => el.value === id
                  );
                  return (
                    elem && (
                      <FilterStatus
                        popupState={popupState}
                        label={elem && elem.label}
                        value={id}
                        onClear={() => onRemoveFilterValue('statuses', id)}
                      />
                    )
                  );
                })}
              </>
            ) : null}
          </div>
          <div className={classes.filterIconWrap}>
            <FormLabel className={classes.filterLabel}>Filters</FormLabel>
            <IconButton
              className={classes.filterBtn}
              aria-label="toggle"
              size="small"
              {...bindTrigger(popupState)}
            >
              <FilterIcon />
            </IconButton>
          </div>
          <Popover
            {...bindPopover(popupState)}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={() => {
              setFilter(filter);
              applyFilter(filter, popupState);
              popupState.close();
            }}
            classes={{
              paper: classes.overflow,
            }}
          >
            <div className={classes.popover}>
              <div className={classes.filterHeading}>
                <span>Filter by</span>
              </div>
              <div className={classes.filterCont}>
                <FormLabel className={classes.totalLabel}>
                  {totalCount} content items match the filters
                </FormLabel>
                <div className={classes.filterOptions}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Repository</FormLabel>
                    <RadioGroup
                      aria-label="Repository"
                      name="repository"
                      value={filter.repositories}
                      onChange={(e) => handleSetFilter(e)}
                    >
                      <FormControlLabel
                        value=""
                        control={
                          <Radio className={classes.radio} color="primary" />
                        }
                        label="All"
                      />
                      {facets.repositories.map(
                        ({ value, label }: Option, index: number) => (
                          <FormControlLabel
                            key={index}
                            value={value}
                            control={
                              <Radio
                                className={classes.radio}
                                color="primary"
                              />
                            }
                            label={label}
                          />
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FilterBlock
                    name="Assignees"
                    keyName="assignees"
                    options={facets.assignees}
                  />
                  <FilterBlock
                    name="Content Types"
                    keyName="contentTypes"
                    options={facets.contentTypes}
                  />
                  <FilterBlock
                    name="Statuses"
                    keyName="statuses"
                    options={facets.statuses}
                  />
                </div>
              </div>
            </div>
          </Popover>
        </div>
      )}
    </PopupState>
  );
}

export default FilterBar;
