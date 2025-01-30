import axios from 'axios';

export const API = axios.create({
	baseURL:
		process.env.REACT_APP_API_URL || 'https://dsphoto.onrender.com/api',
});

API.interceptors.request.use((req) => {
	if (localStorage.getItem('token')) {
		req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
	}
	return req;
});

export const fetchImages = () => API.get('/images');

export const uploadImage = (formData) => API.post('/images', formData);

export const loginUser = (loginData) => API.post('/users/login', loginData);

export const deleteImage = (imageId) => API.delete(`/images/${imageId}`);
