import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import { ProSidebarProvider } from 'react-pro-sidebar';
import {Provider} from 'react-redux';
import UserStore from './stores/User'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={UserStore}>
      <ProSidebarProvider>
        <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </ProSidebarProvider>
    </Provider>
  </React.StrictMode>
);
