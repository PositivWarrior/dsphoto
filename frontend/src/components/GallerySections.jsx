import React from 'react';

const galleryData = [
	{
		id: 'weddings',
		title: 'Weddings',
		images: ['url-to-wedding-photo1', 'url-to-wedding-photo2'],
	},
	{
		id: 'portraits',
		title: 'Portraits',
		images: ['url-to-portrait-photo1', 'url-to-portrait-photo2'],
	},
	{
		id: 'animals',
		title: 'Animals',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
	},
	{
		id: 'Fine Art',
		title: 'Art',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
	},
	{
		id: 'Pregnant',
		title: 'pregnant',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
	},
	{
		id: 'New Born',
		title: 'newBorn',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
	},
	{
		id: 'Housing',
		title: 'housing',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
	},
	{
		id: 'Nature',
		title: 'nature',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
	},
	{
		id: 'Landskape',
		title: 'landskape',
		images: ['url-to-animal-photo1', 'url-to-animal-photo2'],
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
