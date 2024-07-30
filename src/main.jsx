import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import firebaseConfig from './firebase/config.js'
import { FirebaseAppProvider } from 'reactfire'
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Provider store={store}>
        <App />
      </Provider>
    </FirebaseAppProvider>
  </React.StrictMode>
);

