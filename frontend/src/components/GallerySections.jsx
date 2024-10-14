import React from 'react';

const galleryData = [
	{
		id: 'weddings',
		title: 'Weddings',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000094-934bc934bd/450/IMG_3144.webp?ph=0d7a648345',
		],
	},
	{
		id: 'portraits',
		title: 'Portraits',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000664-e8e62e8e64/450/_Z1A3321..webp?ph=0d7a648345',
		],
	},
	{
		id: 'animals',
		title: 'Animals',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000459-86e5186e52/450/_Z1A3884.webp?ph=0d7a648345',
		],
	},
	{
		id: 'art',
		title: 'Fine Art',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000589-d74cbd74cc/450/_Z1A0352%40FB.webp?ph=0d7a648345',
		],
	},
	{
		id: 'pregnant',
		title: 'Pregnant',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000308-125cb125cd/450/_Z1A1772-9.webp?ph=0d7a648345',
		],
	},
	{
		id: 'newborn',
		title: 'Newborn',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000106-539a3539a4/450/_Z1A9410-3.webp?ph=0d7a648345',
		],
	},
	{
		id: 'housing',
		title: 'Housing',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000704-5af995af9a/450/4T5A1683-HDR..webp?ph=0d7a648345',
		],
	},
	{
		id: 'nature',
		title: 'Nature',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000397-ef986ef988/450/IMG_2070.webp?ph=0d7a648345',
		],
	},
	{
		id: 'landscape',
		title: 'Landscape',
		images: [
			'https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000533-d5e6ad5e6c/450/HZ1A8787.webp?ph=0d7a648345',
		],
	},
];

const GallerySections = () => {
	return (
		<div id="gallery" className="py-12 bg-gray-100">
			<div className="max-w-7xl mx-auto px-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
					{galleryData.map((section) => (
						<a
							href={`/gallery/${section.id}`}
							key={section.id}
							className="relative block group"
						>
							<img
								src={section.images[0]}
								alt={section.title}
								className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform transform group-hover:scale-105"
							/>

							<div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
								<h3 className="text-2xl font-bold text-white">
									{section.title}
								</h3>
							</div>
						</a>
					))}
				</div>
			</div>
		</div>
	);
};

export default GallerySections;
