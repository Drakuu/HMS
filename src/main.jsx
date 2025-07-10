import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux"; // Import Provider from react-redux
import store from './app/store';  // Import your Redux store
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>  {/* Wrap App in Provider */}
      <App />
      <ToastContainer position="top-right" autoClose={5000} />
    </Provider>
  </StrictMode>,
)
