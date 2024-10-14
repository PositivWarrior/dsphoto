import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const { data } = await loginUser({ email, password });
			localStorage.setItem('token', data.token);
			navigate('/admin');
		} catch (err) {
			setError('Invalid email or password');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center">
					Admin Login
				</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full p-4 border border-gray-300 rounded-lg"
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full p-4 border border-gray-300 rounded-lg"
					/>
					<button
						type="submit"
						className="w-full p-4 bg-lollipop text-white rounded-lg hover:bg-earthyBrown transition"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
