import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Choose the API base URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'https://api.fotods.no';
const FALLBACK_URL = 'http://localhost:5500';

// Use a proxy for image optimization if available
const IMAGE_PROXY_URL =
	process.env.REACT_APP_IMAGE_PROXY_URL ||
	'https://api.fotods.no/image-proxy';

// CloudFront distribution domain (when set up)
const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN || '';

let isConnectionIssue = false;

export const API = axios.create({
	baseURL: API_URL,
	timeout: 20000,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

// Connection status tracking
const updateConnectionStatus = (hasIssue) => {
	if (isConnectionIssue !== hasIssue) {
		isConnectionIssue = hasIssue;
		console.warn(
			`API Connection Status: ${
				hasIssue ? 'Issues Detected' : 'Restored'
			}`,
		);
	}
};

// Add retry logic with HTTPS fallback
API.interceptors.response.use(
	(response) => {
		updateConnectionStatus(false); // Connection successful
		return response;
	},
	async (error) => {
		const { config } = error;

		// Initialize retry count
		config.retryCount = config.retryCount || 0;

		// Specific error handling
		const errorType =
			error.code ||
			(error.response ? `HTTP ${error.response.status}` : 'Unknown');
		const isNetworkError =
			!error.response &&
			(error.code === 'ECONNABORTED' ||
				error.code === 'ECONNREFUSED' ||
				error.message.includes('Network Error'));
		const isServerError =
			error.response && [502, 503, 504].includes(error.response.status);

		// Update connection status
		updateConnectionStatus(isNetworkError || isServerError);

		// Check if we should retry
		const shouldRetry =
			config.retryCount < MAX_RETRIES &&
			(isNetworkError || isServerError);

		if (!shouldRetry) {
			// If using HTTPS and we've exhausted retries, try HTTP as a last resort
			if (config.url.startsWith('https://') && !config.triedHTTP) {
				console.warn('SSL Connection failed, falling back to HTTP');
				config.url = config.url.replace('https://', 'http://');
				config.baseURL = config.baseURL.replace('https://', 'http://');
				config.triedHTTP = true;
				return API(config);
			}

			// Log detailed error information
			console.error('API Request Failed:', {
				url: config.url,
				method: config.method,
				errorType,
				message: error.message,
				retryCount: config.retryCount,
				usedHTTPFallback: config.triedHTTP || false,
			});

			return Promise.reject(error);
		}

		config.retryCount += 1;

		// Log the retry attempt with more details
		console.warn(`Retry Attempt ${config.retryCount}/${MAX_RETRIES}:`, {
			url: config.url,
			method: config.method,
			errorType,
			message: error.message,
		});

		// Wait before retrying with exponential backoff
		const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
		await new Promise((resolve) => setTimeout(resolve, delay));

		return API(config);
	},
);

// Request interceptor with enhanced error logging
API.interceptors.request.use(
	(req) => {
		const requestInfo = {
			method: req.method?.toUpperCase(),
			url: req.url,
			timestamp: new Date().toISOString(),
		};
		console.log('API Request:', requestInfo);

		if (localStorage.getItem('token')) {
			req.headers.Authorization = `Bearer ${localStorage.getItem(
				'token',
			)}`;
		}
		return req;
	},
	(error) => {
		console.error('Request Configuration Error:', {
			message: error.message,
			config: error.config,
		});
		return Promise.reject(error);
	},
);

/**
 * Convert S3 URLs to CloudFront URLs for HTTP/2 benefits
 * @param {string} url - Original S3 URL
 * @returns {string} - CloudFront URL or original URL if CloudFront not configured
 */
export const getCloudFrontUrl = (url) => {
	if (!CLOUDFRONT_DOMAIN || !url) return url;

	// Check if it's an S3 URL
	if (url.includes('ds-photo.s3.eu-north-1.amazonaws.com')) {
		try {
			// Extract the path part from the S3 URL
			const s3Path = url.split('ds-photo.s3.eu-north-1.amazonaws.com')[1];

			// Make sure CloudFront domain doesn't already have https:// in it
			const cleanDomain = CLOUDFRONT_DOMAIN.replace(/^https?:\/\//, '');

			// Build properly formatted CloudFront URL
			const cloudFrontUrl = `https://${cleanDomain}${s3Path}`;

			console.log('Original URL:', url);
			console.log('CloudFront URL:', cloudFrontUrl);

			return cloudFrontUrl;
		} catch (error) {
			console.error('Error creating CloudFront URL:', error);
			return url; // Return original URL if there's an error
		}
	}

	return url;
};

// Function to optimize images using a proxy service
export const getOptimizedImageUrl = (
	originalUrl,
	width = 800,
	format = 'webp',
	quality = 80,
) => {
	// First, convert to CloudFront if available
	const cloudFrontUrl = getCloudFrontUrl(originalUrl);

	// Log the CloudFront URL for debugging
	console.log('Final URL used:', cloudFrontUrl);

	// If we're in development or the image proxy isn't set up, return the CloudFront/original URL
	if (
		!IMAGE_PROXY_URL ||
		IMAGE_PROXY_URL === 'https://api.fotods.no/image-proxy'
	) {
		return cloudFrontUrl;
	}

	// Encode the URL to pass as a parameter
	const encodedUrl = encodeURIComponent(cloudFrontUrl);

	// Return the proxied URL with transformation parameters
	return `${IMAGE_PROXY_URL}?url=${encodedUrl}&width=${width}&format=${format}&quality=${quality}`;
};

// Add Authorization header for requests that need it
export const setAuthToken = (token) => {
	if (token) {
		API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	} else {
		delete API.defaults.headers.common['Authorization'];
	}
};

// Request Interceptor for handling auth
API.interceptors.request.use(
	(config) => {
		// Get token from localStorage
		const token = localStorage.getItem('authToken');

		// If token exists, add to headers
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response Interceptor for handling errors
API.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response) {
			// Unauthorized - handle logout
			if (error.response.status === 401) {
				// You might want to redirect or clear auth here
				localStorage.removeItem('authToken');
			}
		}
		return Promise.reject(error);
	},
);

// Export API methods with error boundaries
const withErrorBoundary =
	(apiCall) =>
	async (...args) => {
		try {
			return await apiCall(...args);
		} catch (error) {
			console.error('API Operation Failed:', {
				operation: apiCall.name,
				error: error.message,
				status: error.response?.status,
			});
			throw error;
		}
	};

// Export API methods
export const fetchImages = withErrorBoundary(() => API.get('/images'));
export const uploadImage = withErrorBoundary((formData) =>
	API.post('/images', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	}),
);
export const loginUser = withErrorBoundary((loginData) =>
	API.post('/users/login', loginData),
);
export const deleteImage = withErrorBoundary((imageId) =>
	API.delete(`/images/${imageId}`),
);

export default API;
