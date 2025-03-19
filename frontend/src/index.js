import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';

// Ensure we can debug routing issues
console.log('React app initializing with router');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<HelmetProvider>
				<App />
			</HelmetProvider>
		</BrowserRouter>
	</React.StrictMode>,
);

// Defer web vitals reporting
if (process.env.NODE_ENV === 'production') {
	import('./reportWebVitals').then(({ default: reportWebVitals }) => {
		reportWebVitals(console.log);
	});
}
