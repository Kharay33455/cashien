import ReactDOM from 'react-dom/client';
import './static/index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);

reportWebVitals();
