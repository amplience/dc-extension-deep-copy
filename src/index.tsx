import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { fetchSDK } from './store/sdk/sdk.actions';
import reportWebVitals from './reportWebVitals';
import App from './App';
import './App.css';

// @ts-ignore
store.dispatch(fetchSDK());

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();
