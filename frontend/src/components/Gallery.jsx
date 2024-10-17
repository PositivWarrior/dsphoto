import React from 'react';

const GalleryPage = () => {
	const galleryData = [
		{
			id: 'weddings',
			title: 'Weddings',
			images: [
				'https://images.unsplash.com/photo-1522337660859-02fbefca4702',
				'https://images.unsplash.com/photo-1517841905240-472988babdf9',
				'https://images.unsplash.com/photo-1521790797524-b2497295b8c7',
				'https://images.unsplash.com/photo-1534126511673-b6899657816a',
				'https://images.unsplash.com/photo-1547076840-3e0c3e46cc67',
				'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5',
				'https://images.unsplash.com/photo-1561948959-4f2b36259a78',
				'https://images.unsplash.com/photo-1545156521-e5e9d9d3a62e',
				'https://images.unsplash.com/photo-1509627662292-74f479f6e5ab',
				'https://images.unsplash.com/photo-1517841905240-472988babdf9',
			],
		},
		{
			id: 'portraits',
			title: 'Portraits',
			images: [
				'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
				'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
				'https://images.unsplash.com/photo-1502767089025-6572583495b4',
				'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
				'https://images.unsplash.com/photo-1502720705749-3cfa7c7e70d4',
				'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
				'https://images.unsplash.com/photo-1502767089025-6572583495b4',
				'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
				'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
				'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
			],
		},
		{
			id: 'animals',
			title: 'Animals',
			images: [
				'https://images.unsplash.com/photo-1517841905240-472988babdf9',
				'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
				'https://images.unsplash.com/photo-1556228453-2c5d4a5a5b99',
				'https://images.unsplash.com/photo-1516222338253-81ddbd932d9a',
				'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
				'https://images.unsplash.com/photo-1501706362039-c6e13f1a24fb',
				'https://images.unsplash.com/photo-1556228453-2c5d4a5a5b99',
				'https://images.unsplash.com/photo-1516222338253-81ddbd932d9a',
				'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
				'https://images.unsplash.com/photo-1501706362039-c6e13f1a24fb',
			],
		},
		{
			id: 'art',
			title: 'Fine Art',
			images: [
				'https://images.unsplash.com/photo-1495078065017-5647232df94e',
				'https://images.unsplash.com/photo-1473643068424-cd2485ceae46',
				'https://images.unsplash.com/photo-1504567961542-e24d9439a724',
				'https://images.unsplash.com/photo-1488722796624-0aa6f1bb6399',
				'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99',
				'https://images.unsplash.com/photo-1553952695-c43c0a6d8682',
				'https://images.unsplash.com/photo-1473643068424-cd2485ceae46',
				'https://images.unsplash.com/photo-1504567961542-e24d9439a724',
				'https://images.unsplash.com/photo-1553952695-c43c0a6d8682',
				'https://images.unsplash.com/photo-1488722796624-0aa6f1bb6399',
			],
		},
		{
			id: 'pregnant',
			title: 'Pregnant',
			images: [
				'https://images.unsplash.com/photo-1522510185682-1c874c7e66f3',
				'https://images.unsplash.com/photo-1519999482648-25049ddd37b1',
				'https://images.unsplash.com/photo-1525186402429-6b07257f4e94',
				'https://images.unsplash.com/photo-1525186402429-6b07257f4e94',
				'https://images.unsplash.com/photo-1525186402429-6b07257f4e94',
				'https://images.unsplash.com/photo-1519999482648-25049ddd37b1',
				'https://images.unsplash.com/photo-1525186402429-6b07257f4e94',
				'https://images.unsplash.com/photo-1522510185682-1c874c7e66f3',
				'https://images.unsplash.com/photo-1519999482648-25049ddd37b1',
				'https://images.unsplash.com/photo-1525186402429-6b07257f4e94',
			],
		},
		{
			id: 'newborn',
			title: 'Newborn',
			images: [
				'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
				'https://images.unsplash.com/photo-1516821758489-21f366ec9b59',
				'https://images.unsplash.com/photo-1556228453-2c5d4a5a5b99',
				'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
				'https://images.unsplash.com/photo-1516222338253-81ddbd932d9a',
				'https://images.unsplash.com/photo-1556228453-2c5d4a5a5b99',
				'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
				'https://images.unsplash.com/photo-1501706362039-c6e13f1a24fb',
				'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
				'https://images.unsplash.com/photo-1516222338253-81ddbd932d9a',
			],
		},
		{
			id: 'housing',
			title: 'Housing',
			images: [
				'https://images.unsplash.com/photo-1560185008-5b70c1f0653b',
				'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
				'https://images.unsplash.com/photo-1560185008-5b70c1f0653b',
				'https://images.unsplash.com/photo-1560185008-5b70c1f0653b',
				'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
				'https://images.unsplash.com/photo-1560185008-5b70c1f0653b',
				'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
				'https://images.unsplash.com/photo-1560185008-5b70c1f0653b',
				'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
				'https://images.unsplash.com/photo-1560185008-5b70c1f0653b',
			],
		},
		{
			id: 'nature',
			title: 'Nature',
			images: [
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
			],
		},
		{
			id: 'landscape',
			title: 'Landscape',
			images: [
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1513628253939-010e64ac66cd',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1513628253939-010e64ac66cd',
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
				'https://images.unsplash.com/photo-1513628253939-010e64ac66cd',
				'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
				'https://images.unsplash.com/photo-1513628253939-010e64ac66cd',
				'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
			],
		},
	];

	return (
		<div id="gallery" className="py-12 bg-gray-100 mt-10">
			<div className="max-w-7xl mx-auto px-4">
				<h1 className="text-4xl font-bold text-center mb-12">
					Explore my latest works
				</h1>

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

export default GalleryPage;
