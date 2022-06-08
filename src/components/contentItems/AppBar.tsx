import { AppBar, makeStyles } from '@material-ui/core';
import React from 'react';
import FilterBar from '../../common/FilterBar';

const useStyles = makeStyles(() => ({
  navbar: {
    backgroundColor: '#F5F5F5',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: '0 44px',
  },
  navbarText: {
    margin: ' 18px 0',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '16px',
    whiteSpace: 'nowrap',
  },
}));

function AppBarComponent() {
  const classes = useStyles();

  return (
    <AppBar classes={{ root: classes.navbar }} position="static">
      <p className={classes.navbarText}>
        Choose a content item from the list below to copy
      </p>
      <FilterBar />
    </AppBar>
  );
}

export default AppBarComponent;
