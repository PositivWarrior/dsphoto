import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<HelmetProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</HelmetProvider>
	</React.StrictMode>,
);

// Defer web vitals reporting
if (process.env.NODE_ENV === 'production') {
	import('./reportWebVitals').then(({ default: reportWebVitals }) => {
		reportWebVitals(console.log);
	});
}
