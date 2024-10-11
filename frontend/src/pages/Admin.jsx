import React from 'react';
import UploadForm from '../components/UploadForm';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	return (
		<div>
			<h1>Admin Panel</h1>
			<button onClick={handleLogout}>Logout</button>
			<h2>Upload Images</h2>
			<UploadForm />
		</div>
	);
};

export default Admin;
