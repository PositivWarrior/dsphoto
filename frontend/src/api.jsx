import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Choose the API base URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'https://api.fotods.no';
const FALLBACK_URL =
	process.env.REACT_APP_FALLBACK_API_URL || 'http://localhost:5500';

// Use a proxy for image optimization if available
// const IMAGE_PROXY_URL =
// 	process.env.REACT_APP_IMAGE_PROXY_URL ||
// 	'https://api.fotods.no/image-proxy';

// CloudFront distribution domain (when set up)
const CLOUDFRONT_DOMAIN =
	process.env.REACT_APP_CLOUDFRONT_DOMAIN ||
	'https://d10rd1fhji10gj.cloudfront.net';

// Direct S3 URL for fallback
const S3_DIRECT_URL =
	process.env.REACT_APP_S3_DIRECT_URL ||
	'https://ds-photo.s3.eu-north-1.amazonaws.com';

// Cache settings
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Connection state tracking
let isConnectionIssue = false;
let useFallbackURL = false; // Track if we're using the fallback URL
let isOfflineMode = false; // Track if we're in offline mode (all connections failed)
let useDirectS3 = false; // Track if CloudFront is failing and we're using direct S3

// Cache management functions
const saveToCache = (key, data) => {
	try {
		const cacheItem = {
			data,
			timestamp: Date.now(),
		};
		localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheItem));
		console.log(`Cached data for: ${key}`);
	} catch (error) {
		console.error('Error saving to cache:', error);
	}
};

const getFromCache = (key) => {
	try {
		const cacheItem = localStorage.getItem(`api_cache_${key}`);
		if (!cacheItem) return null;

		const { data, timestamp } = JSON.parse(cacheItem);
		const isExpired = Date.now() - timestamp > CACHE_DURATION;

		if (isExpired) {
			localStorage.removeItem(`api_cache_${key}`);
			return null;
		}

		return data;
	} catch (error) {
		console.error('Error retrieving from cache:', error);
		return null;
	}
};

export const API = axios.create({
	baseURL: API_URL,
	timeout: 20000,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

// Interval to check if main API is back (in milliseconds)
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// Setup API health check if we switch to fallback
const setupHealthCheck = () => {
	if (!useFallbackURL) return; // Only run health check when using fallback

	console.log('Setting up API health check');

	const healthCheckInterval = setInterval(async () => {
		try {
			console.log('Checking if primary API is available...');
			// Try to connect to the primary API with a shorter timeout
			const response = await axios.get(`${API_URL}`, {
				timeout: 5000,
				validateStatus: (status) => status === 200,
			});

			if (response.status === 200) {
				console.log('Primary API is back online, switching back');
				API.defaults.baseURL = API_URL;
				useFallbackURL = false;
				clearInterval(healthCheckInterval);
			}
		} catch (error) {
			console.log('Primary API still unavailable:', error.message);
			// Continue using fallback
		}
	}, HEALTH_CHECK_INTERVAL);

	// Clean up interval when component unmounts
	return () => clearInterval(healthCheckInterval);
};

// Update connection status tracking
const updateConnectionStatus = (hasIssue) => {
	if (isConnectionIssue !== hasIssue) {
		isConnectionIssue = hasIssue;
		console.warn(
			`API Connection Status: ${
				hasIssue ? 'Issues Detected' : 'Restored'
			}`,
		);

		// If issues persist and we haven't tried the fallback yet, switch to fallback URL
		if (hasIssue && !useFallbackURL) {
			console.warn(`Switching to fallback API URL: ${FALLBACK_URL}`);
			useFallbackURL = true;
			API.defaults.baseURL = FALLBACK_URL;
			setupHealthCheck(); // Start health check
		}
	}
};

// Publish connection status for other components to subscribe
export const getConnectionStatus = () => {
	return {
		isConnectionIssue,
		useFallbackURL,
		isOfflineMode,
	};
};

// Add retry logic with HTTPS fallback
API.interceptors.response.use(
	(response) => {
		updateConnectionStatus(false); // Connection successful
		isOfflineMode = false; // Reset offline mode if we got a successful response
		return response;
	},
	async (error) => {
		const { config, response } = error;

		// If it's a 401 Unauthorized error, handle logout/redirect
		if (response?.status === 401) {
			console.error(
				'Authentication Error (401): Token might be invalid or expired.',
			);
			localStorage.removeItem('token');
			localStorage.removeItem('userInfo');
			// Redirect to login page - check if window object is available
			if (typeof window !== 'undefined') {
				// Avoid redirecting if already on login page
				if (!window.location.pathname.includes('/login')) {
					window.location.href = '/login';
				}
			}
			// Reject the promise to prevent further processing or retries for this request
			return Promise.reject(error);
		}

		// Initialize retry count
		config.retryCount = config.retryCount || 0;

		// Specific error handling for network/server issues (excluding 401)
		const errorType =
			error.code || (response ? `HTTP ${response.status}` : 'Unknown');
		const isNetworkError =
			!response &&
			(error.code === 'ECONNABORTED' ||
				error.code === 'ECONNREFUSED' ||
				error.message.includes('Network Error'));
		const isServerError =
			response && [500, 502, 503, 504].includes(response.status); // Added 500

		// Update connection status only for network/server issues
		if (isNetworkError || isServerError) {
			updateConnectionStatus(true);
		}

		// Check if we should retry (only for network/server errors)
		const shouldRetry =
			config.retryCount < MAX_RETRIES &&
			(isNetworkError || isServerError);

		if (!shouldRetry) {
			// Fallback logic only for network/server errors
			if (
				(isNetworkError || isServerError) &&
				config.baseURL === API_URL &&
				!useFallbackURL
			) {
				console.warn(
					`API connection failed (${errorType}). Switching to fallback URL: ${FALLBACK_URL}`,
				);
				useFallbackURL = true;
				API.defaults.baseURL = FALLBACK_URL;
				config.retryCount = 0;
				return API(config);
			}

			// Set offline mode if we've tried everything and failed (only for network/server errors)
			if (
				(isNetworkError || isServerError) &&
				useFallbackURL &&
				config.retryCount >= MAX_RETRIES
			) {
				isOfflineMode = true;
				console.warn(
					'All API connection attempts failed, entering offline mode',
				);
			}

			// Log detailed error information
			console.error('API Request Failed (Final):', {
				url: config.url,
				method: config.method,
				errorType,
				message: error.message,
				retryCount: config.retryCount,
				status: response?.status,
				usedFallbackURL: useFallbackURL,
				isOfflineMode,
			});

			return Promise.reject(error);
		}

		// --- Retry logic continues for network/server errors below ---
		config.retryCount += 1;

		// Log the retry attempt with more details
		console.warn(`Retry Attempt ${config.retryCount}/${MAX_RETRIES}:`, {
			url: config.url,
			method: config.method,
			errorType,
			message: error.message,
			status: response?.status,
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
	if (!url) return url;

	// Check if it's an S3 URL
	if (url.includes('ds-photo.s3.eu-north-1.amazonaws.com')) {
		try {
			// If we've detected CloudFront issues, use direct S3 URLs
			if (useDirectS3) {
				console.log('Using direct S3 URL (CloudFront bypass):', url);
				return url;
			}

			// Extract the path part from the S3 URL
			const s3Path = url.split('ds-photo.s3.eu-north-1.amazonaws.com')[1];

			// If CloudFront domain is not set, use direct S3
			if (!CLOUDFRONT_DOMAIN) {
				return url;
			}

			// Make sure CloudFront domain doesn't already have https:// in it
			const cleanDomain = CLOUDFRONT_DOMAIN.replace(/^https?:\/\//, '');

			// Build properly formatted CloudFront URL
			const cloudFrontUrl = `https://${cleanDomain}${s3Path}`;

			console.log('Original URL:', url);
			console.log('CloudFront URL:', cloudFrontUrl);

			return cloudFrontUrl;
		} catch (error) {
			console.error('Error creating CloudFront URL:', error);
			// Use direct S3 URL if CloudFront transformation fails
			useDirectS3 = true;
			return url; // Return original URL if there's an error
		}
	}

	return url;
};

// Function to test CloudFront connectivity
export const testCloudFrontConnectivity = async () => {
	if (!CLOUDFRONT_DOMAIN) return false;

	try {
		// Test a simple HEAD request to CloudFront
		const testUrl = `${CLOUDFRONT_DOMAIN}/test-connectivity`;
		const response = await fetch(testUrl, {
			method: 'HEAD',
			mode: 'no-cors', // This allows us to at least attempt the connection
			cache: 'no-store',
		});

		// No-cors mode will always return status 0, but we can detect network errors
		console.log('CloudFront connectivity test result:', response);
		useDirectS3 = false; // Reset the flag if we can connect
		return true;
	} catch (error) {
		console.error('CloudFront connectivity test failed:', error);
		useDirectS3 = true; // Set flag to use direct S3 URLs
		return false;
	}
};

// Run the CloudFront test periodically
setInterval(testCloudFrontConnectivity, 60000); // Test every minute

/**
 * Optimize image URL for better performance
 * @param {string} url - Original image URL
 * @param {number} width - Desired width
 * @param {string} format - Image format (webp, jpeg, etc)
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (
	url,
	width = 800,
	format = 'webp',
	quality = 80,
) => {
	// Check browser support for WebP
	const supportsWebP = localStorage.getItem('supports_webp') === 'true';

	// If browser doesn't support WebP and the requested format is WebP, fallback to JPEG
	const finalFormat = !supportsWebP && format === 'webp' ? 'jpeg' : format;

	let resultUrl = url; // Start with original

	// Check if URL is from S3 or CloudFront
	if (url.includes('amazonaws.com')) {
		// Convert S3 URL to CloudFront
		const s3Path = url.split('amazonaws.com')[1];
		resultUrl = `${CLOUDFRONT_DOMAIN}${s3Path}?width=${width}&format=${finalFormat}&quality=${quality}`;
	} else if (url.includes('cloudfront.net')) {
		// Already using CloudFront, just add params
		const separator = url.includes('?') ? '&' : '?';
		resultUrl = `${url}${separator}width=${width}&format=${finalFormat}&quality=${quality}`;
	}

	// Log the generated URL
	console.log(
		`[getOptimizedImageUrl] Input: ${url}, Width: ${width}, Format: ${finalFormat}, Quality: ${quality} => Output: ${resultUrl}`,
	);

	// If not an S3 or CloudFront URL, return the original (already handled by initializing resultUrl)
	return resultUrl;
};

// Check WebP support on mount
export const checkWebPSupport = () => {
	if (
		typeof localStorage !== 'undefined' &&
		localStorage.getItem('supports_webp') === null
	) {
		const webp = new Image();
		webp.onload = function () {
			const result = webp.width > 0 && webp.height > 0;
			localStorage.setItem('supports_webp', result.toString());
		};
		webp.onerror = function () {
			localStorage.setItem('supports_webp', 'false');
		};
		webp.src =
			'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
	}
};

// Cached image fetch for galleries
export async function fetchImagesWithCache() {
	try {
		// Check cache first
		const cachedData = getFromCache('all_images');
		if (cachedData) {
			console.log('Using cached image data');
			return cachedData;
		}

		// If not in cache, fetch from API
		const response = await API.get('/images');
		const data = response.data;

		// Save to cache for future use
		saveToCache('all_images', data);
		return data;
	} catch (error) {
		console.error('Error fetching images:', error);

		// If offline, try to return cached data even if expired
		try {
			const cacheKey = 'api_cache_all_images';
			const cacheItem = localStorage.getItem(cacheKey);
			if (cacheItem) {
				const { data } = JSON.parse(cacheItem);
				console.log('Using expired cache data during offline mode');
				return data;
			}
		} catch (e) {
			console.error('Failed to retrieve expired cache:', e);
		}

		throw error;
	}
}

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

// Add cache-enabled request method
export const fetchWithCache = async (endpoint) => {
	const cacheKey = endpoint.replace(/\//g, '_');

	try {
		// Try to get from API
		const response = await API.get(endpoint);

		// Save successful response to cache
		if (response.data) {
			saveToCache(cacheKey, response.data);
		}

		return response.data;
	} catch (error) {
		console.warn(`API request failed for ${endpoint}, trying cache`, error);

		// If request failed, try to get from cache
		const cachedData = getFromCache(cacheKey);
		if (cachedData) {
			console.log(`Using cached data for ${endpoint}`);
			return cachedData;
		}

		// If no cached data, rethrow the error
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

// AWS Services Diagnostic Tool
export const diagnoseBrokenConnections = async () => {
	const results = {
		api: { status: 'unknown', error: null },
		s3Direct: { status: 'unknown', error: null },
		cloudFront: { status: 'unknown', error: null },
		fallbackApi: { status: 'unknown', error: null },
	};

	// Helper function to test a URL
	const testUrl = async (url, label) => {
		try {
			console.log(`Testing ${label} at ${url}...`);
			const startTime = Date.now();
			await fetch(url, {
				method: 'HEAD',
				mode: 'no-cors', // This allows us to at least attempt the connection
				cache: 'no-store',
			});
			const elapsed = Date.now() - startTime;

			// No-cors mode will always return status 0, but we can detect network errors
			results[label] = {
				status: 'reachable',
				latency: elapsed,
				error: null,
			};
			console.log(`${label} test succeeded in ${elapsed}ms`);
		} catch (error) {
			results[label] = {
				status: 'unreachable',
				error: error.message,
			};
			console.error(`${label} test failed:`, error);
		}
	};

	// Run tests in parallel
	await Promise.all([
		testUrl(API_URL, 'api'),
		testUrl(S3_DIRECT_URL, 's3Direct'),
		testUrl(CLOUDFRONT_DOMAIN, 'cloudFront'),
		testUrl(FALLBACK_URL, 'fallbackApi'),
	]);

	// Provide recommendations based on test results
	let recommendations = [];

	if (
		results.api.status === 'unreachable' &&
		results.fallbackApi.status === 'unreachable'
	) {
		recommendations.push(
			'Both primary and fallback API endpoints are unreachable. Check EC2 instance status and network connectivity.',
		);
	} else if (results.api.status === 'unreachable') {
		recommendations.push(
			'Primary API is unreachable but fallback works. DNS or SSL issues may be affecting api.fotods.no.',
		);
	}

	if (
		results.cloudFront.status === 'unreachable' &&
		results.s3Direct.status === 'reachable'
	) {
		recommendations.push(
			'CloudFront is unreachable but S3 is accessible. Your CloudFront distribution may be misconfigured or disabled.',
		);
		useDirectS3 = true;
	} else if (results.s3Direct.status === 'unreachable') {
		recommendations.push(
			'S3 bucket is unreachable. Check AWS S3 permissions and bucket policies.',
		);
	}

	// Log comprehensive results
	console.log('AWS Services Diagnostic Results:', results);
	console.log('Recommendations:', recommendations);

	return {
		results,
		recommendations,
		timestamp: new Date().toISOString(),
	};
};

// Add a method to run diagnostics and adjust strategy on error
export const runDiagnosticsOnError = async (error) => {
	// Only run diagnostics if we have actual API/connection failures
	if (!error || !error.message) return;

	// Check for specific error patterns
	const isNetworkError =
		error.message.includes('Network Error') ||
		error.message.includes('Failed to fetch') ||
		error.code === 'ECONNREFUSED';

	const isS3Error =
		error.message.includes('s3.amazonaws.com') ||
		error.message.includes('Access Denied') ||
		error.config?.url?.includes('amazonaws.com');

	const isCloudFrontError =
		error.message.includes('cloudfront.net') ||
		error.config?.url?.includes('cloudfront.net');

	// Run diagnostics for network or AWS-related errors
	if (isNetworkError || isS3Error || isCloudFrontError) {
		console.warn(
			'Detected possible AWS connectivity issue, running diagnostics...',
		);
		const diagnostics = await diagnoseBrokenConnections();

		// Apply fixes based on diagnostics
		if (
			isCloudFrontError ||
			(diagnostics.results.cloudFront.status === 'unreachable' &&
				diagnostics.results.s3Direct.status === 'reachable')
		) {
			console.warn('Setting useDirectS3=true to bypass CloudFront');
			useDirectS3 = true;
		}

		if (
			diagnostics.results.api.status === 'unreachable' &&
			diagnostics.results.fallbackApi.status === 'reachable' &&
			!useFallbackURL
		) {
			console.warn('Switching to fallback API URL');
			useFallbackURL = true;
			API.defaults.baseURL = FALLBACK_URL;
		}

		return diagnostics;
	}

	return null;
};

// Add to error interceptor
API.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Run diagnostics on significant errors
		await runDiagnosticsOnError(error);

		// Continue with existing error handling
		return Promise.reject(error);
	},
);

export default API;
