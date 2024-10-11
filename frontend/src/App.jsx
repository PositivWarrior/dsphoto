import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />

				<Route path="/login" element={<Login />} />

				<Route
					path="/admin"
					element={
						<ProtectedRoute>
							<Admin />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
