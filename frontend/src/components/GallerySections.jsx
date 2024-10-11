import React from 'react';

const galleryData = [
	{
		id: 'weddings',
		title: 'Weddings',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000094-934bc934bd/450/IMG_3144.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000632-b0738b0739/450/_Z1A8994_%2C.webp?ph=0d7a648345',
		],
	},
	{
		id: 'portraits',
		title: 'Portraits',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000664-e8e62e8e64/450/_Z1A3321..webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000689-a8e05a8e06/450/_Z1A6445.webp?ph=0d7a648345',
		],
	},
	{
		id: 'animals',
		title: 'Animals',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000459-86e5186e52/450/_Z1A3884.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000606-a959ba959e/450/_Z1A0310FB-5.webp?ph=0d7a648345',
		],
	},
	{
		id: 'art',
		title: 'Fine Art',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000589-d74cbd74cc/450/_Z1A0352%40FB.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000600-a524ea5250/450/_Z1A0230FB.webp?ph=0d7a648345',
		],
	},
	{
		id: 'pregnant',
		title: 'Pregnant',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000308-125cb125cd/450/_Z1A1772-9.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000292-c6bb9c6bba/450/_Z1A2194-0.webp?ph=0d7a648345',
		],
	},
	{
		id: 'newborn',
		title: 'Newborn',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000106-539a3539a4/450/_Z1A9410-3.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000206-cac3ecac3f/450/_Z1A9797.webp?ph=0d7a648345',
		],
	},
	{
		id: 'housing',
		title: 'Housing',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000704-5af995af9a/450/4T5A1683-HDR..webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000712-5f2315f233/450/4T5A6126-HDR.webp?ph=0d7a648345',
		],
	},
	{
		id: 'nature',
		title: 'Nature',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000397-ef986ef988/450/IMG_2070.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000429-8e7008e701/450/_Z1A7966.webp?ph=0d7a648345',
		],
	},
	{
		id: 'landskape',
		title: 'Landskape',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000533-d5e6ad5e6c/450/HZ1A8787.webp?ph=0d7a648345',
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000537-471c3471c5/450/IMG_6465.webp?ph=0d7a648345',
		],
	},
];

const GallerySections = () => {
	return (
		<div id="gallery" className="py-12 bg-gray-100">
			{galleryData.map((section) => (
				<div key={section.id} className="mb-12">
					<h2 className="text-3xl font-bold text-center mb-6">
						{section.title}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto px-4">
						{section.images.map((imageUrl, index) => (
							<img
								key={index}
								src={imageUrl}
								alt={section.title}
								className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default GallerySections;
