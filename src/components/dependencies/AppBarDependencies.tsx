import { AppBar, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ContentItemsInterface,
  LoadingsInterface,
  RootStateInt,
} from '../../../types/types';

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
  invalid: {
    color: '#FF3366',
  },
}));

function AppBarComponent() {
  const classes = useStyles();
  const { selected, validation }: ContentItemsInterface = useSelector(
    (state: RootStateInt) => state.contentItems
  );
  const { validation: validationLoader, dependencies }: LoadingsInterface =
    useSelector((state: RootStateInt) => state.loadings);
  const [invalid, setInvalid] = useState(0);

  useEffect(() => {
    let invalidItems = 0;

    if (validation) {
      Object.keys(validation).map((id) =>
        validation[id].isValid ? invalidItems : invalidItems++
      );

      setInvalid(invalidItems);
    }
  }, [setInvalid, validation]);
  return (
    <AppBar classes={{ root: classes.navbar }} position="static">
      <p
        className={`${classes.navbarText} ${
          invalid ? `${classes.invalid}` : ''
        }`}
      >
        {validationLoader || dependencies
          ? `Please wait while we identify all content items linked to ${
              selected ? `"${selected.label}"` : '...'
            }`
          : invalid
          ? `${invalid} invalid content item${
              invalid > 1 ? 's' : ''
            } need to be corrected before copying`
          : `${
              selected ? `"${selected.label}"` : 'Selected Content Item'
            } is ready for copying`}
      </p>
    </AppBar>
  );
}

export default AppBarComponent;
