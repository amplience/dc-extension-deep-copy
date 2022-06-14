import React from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import { RootStateInt } from '../../types/types';

const useStyles = makeStyles(() => ({
  loading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    background: '#ffffff',
    opacity: 0.75,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 500,
    fontSize: '18px',
    marginBottom: '25px',
  },
  description: {
    fontWeight: 400,
    fontSize: '14px',
    marginBottom: '30px',
  },
  block: {
    width: 450,
    textAlign: 'center',
  },
}));

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: '14px !important',
  borderRadius: 6,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#e5e5e5',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 6,
    backgroundColor: '#039BE5',
  },
}));

function CopyLoaderOverlay() {
  const classes = useStyles();
  const { copiedCount = 0, selectedDependencies = [] }: any = useSelector(
    (state: RootStateInt) => state.contentItems
  );
  return (
    <div className={classes.loading}>
      <div className={classes.block}>
        <p className={classes.title}>Copy in progress</p>
        <BorderLinearProgress
          variant="determinate"
          value={(copiedCount * 100) / selectedDependencies.length}
        />
        {copiedCount ? (
          <p className={classes.description}>
            {copiedCount} linked content items being copied
          </p>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

export default CopyLoaderOverlay;
