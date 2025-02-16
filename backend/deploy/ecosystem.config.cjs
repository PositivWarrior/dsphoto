module.exports = {
	apps: [
		{
			name: 'dsphoto-api',
			script: 'server.js',
			instances: 1,
			exec_mode: 'cluster',
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			exp_backoff_restart_delay: 100,
			max_restarts: 10,
			restart_delay: 1000,
			listen_timeout: 50000,
			kill_timeout: 5000,
			env: {
				NODE_ENV: 'production',
				PORT: 8000,
				MONGO_URI:
					'mongodb+srv://kacpermargol:GOhK1uGCnCuD46bH@dsphoto.frnfj.mongodb.net/dsphoto?retryWrites=true&w=majority',
				AWS_ACCESS_KEY_ID: 'AKIAZ7SAKWFJ7KXEQIO3',
				AWS_SECRET_ACCESS_KEY:
					'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',
				AWS_BUCKET_NAME: 'ds-photo',
				AWS_REGION: 'eu-north-1',
				JWT_SECRET: 'Niepokonani8',
			},
		},
	],
};
