import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContext, NavigationProvider, StackNavigation } from '@exponent/ex-navigation';

import App from './containers/App';
import Store from './store';
import Router from './navigation/Router';

const navigationContext = new NavigationContext({ router: Router, store: Store });

export default () => (
  <Provider store={Store}>
    <NavigationProvider context={navigationContext}>
      <App>
        <StackNavigation initialRoute={Router.getRoute('app')} />
      </App>
    </NavigationProvider>
  </Provider>
);
