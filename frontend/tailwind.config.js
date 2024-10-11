/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx}', // This is where Tailwind will look for classes to generate the styles
		'./public/index.html', // Include your public folder's HTML if needed
	],
	theme: {
		extend: {
			fontFamily: {
				heading: ['Recoleta', 'serif'],
				body: ['Sofia Pro', 'sans-serif'],
			},
			colors: {
				lollipop: '#F54B64',
				lightAccent: '#FFD3B6',
				earthyBrown: '#4B3B38',
				neutralGray: '#F3F3F3',
			},
		},
	},
	plugins: [],
};
