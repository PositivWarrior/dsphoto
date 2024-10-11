import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import './index.css';
function App() {
	const [isShutterVisible, setIsShutterVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsShutterVisible(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="relative">
			{isShutterVisible && (
				<div className="shutter-wrapper fixed inset-0 z-50 flex items-center justify-center bg-black">
					<div className="shutter">
						<svg
							width="200"
							height="200"
							viewBox="0 0 200 200"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g className="shutter-blades">
								<path
									className="blade"
									d="M100,100 L100,0 A100,100 0 0,1 150,86Z"
								/>
								<path
									className="blade"
									d="M100,100 L150,86 A100,100 0 0,1 86,150Z"
								/>
								<path
									className="blade"
									d="M100,100 L86,150 A100,100 0 0,1 0,100Z"
								/>
								<path
									className="blade"
									d="M100,100 L0,100 A100,100 0 0,1 86,50Z"
								/>
								<path
									className="blade"
									d="M100,100 L86,50 A100,100 0 0,1 150,0Z"
								/>
								<path
									className="blade"
									d="M100,100 L150,0 A100,100 0 0,1 100,0Z"
								/>
							</g>
						</svg>
					</div>
				</div>
			)}

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
		</div>
	);
}

export default App;
