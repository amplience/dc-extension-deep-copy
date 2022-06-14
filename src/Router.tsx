import React from 'react';
import { useSelector } from 'react-redux';
import { createBrowserHistory } from 'history';
import { Route, Switch } from 'react-router-dom';
import { Router } from 'react-router';
import AppBar from './components/contentItems/AppBar';
import AppBarDependencies from './components/dependencies/AppBarDependencies';
import Loader from './common/Loader';
import { RootStateInt } from '../types/types';
import ContentItems from './components/contentItems/ContentItems';
import Dependencies from './components/dependencies/Dependencies';

let location = window.location.pathname;
const lastSlash = location.lastIndexOf('/');
if (lastSlash !== location.length - 1) {
  location = location.substring(0, lastSlash + 1);
}

export const history = createBrowserHistory({ basename: location });

function RouterComponent() {
  const {
    connected,
  }: {
    connected: boolean;
  } = useSelector((state: RootStateInt) => ({
    connected: state.sdk.connected,
  }));

  return connected ? (
    <Router history={history}>
      <Switch>
        <Route exact path="/:id">
          <>
            <AppBarDependencies />
            <Dependencies />
          </>
        </Route>
        <Route path="/">
          <>
            <AppBar />
            <ContentItems />
          </>
        </Route>
      </Switch>
    </Router>
  ) : (
    <Loader className="content-loader" />
  );
}

export default RouterComponent;
