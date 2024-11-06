import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './controllers/App';
import './i18n';
import { displayWelcomeMessage } from './services/console';

import 'react-tooltip/dist/react-tooltip.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './styles/reset.css';

displayWelcomeMessage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
