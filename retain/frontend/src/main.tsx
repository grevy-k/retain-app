import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';
import { AuthProvider } from './context/AuthProvider';
import { ThemeModeProvider } from './context/ThemeModeProvider';

// The entry point of the application. Renders the App component inside a StrictMode wrapper, with Redux, React Router, AuthProvider, and ThemeModeProvider contexts.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeModeProvider>
    </Provider>
  </StrictMode>
);