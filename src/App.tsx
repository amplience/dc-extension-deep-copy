import { createBrowserHistory } from 'history';
import { Snackbar } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  makeStyles,
  createTheme,
  ThemeProvider,
} from '@material-ui/core/styles';
import { RootStateInt } from '../types/types';
import { setError } from './store/error/error.actions';
import Router from './Router';

export const history = createBrowserHistory({
  forceRefresh: true,
});

const useStyles = makeStyles(() => ({
  svg: {
    verticalAlign: 'middle',
  },
}));

const theme = createTheme({
  palette: {
    primary: {
      light: '#1ab0f9',
      main: '#039be5',
      dark: '#1ab0f9',
      contrastText: '#fff',
    },
    secondary: {
      main: '#666666',
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { error } = useSelector((state: RootStateInt) => ({
    error: state.error,
  }));

  const message = (
    <span>
      <Warning className={classes.svg} />
      {error}
    </span>
  );

  return (
    <ThemeProvider theme={theme}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={8000}
        open={Boolean(error)}
        onClose={() => dispatch(setError(''))}
        message={message}
      />
      <Router />
    </ThemeProvider>
  );
}

export default App;
