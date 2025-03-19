import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
	console.log('Layout rendering with children:', children);
	return (
		<div className="layout-container">
			<Navbar />
			<main className="main-content">{children}</main>
			<Footer />
		</div>
	);
};

export default Layout;
