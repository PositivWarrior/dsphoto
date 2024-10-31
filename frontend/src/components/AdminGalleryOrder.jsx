import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'IMAGE';

const AdminGalleryOrder = () => {
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [images, setImages] = useState([]);
	const [reorderedImages, setReorderedImages] = useState([]);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch(
					'http://localhost:8000/api/images/categories',
				);
				const data = await response.json();
				setCategories(data.categories || []);
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		};
		fetchCategories();
	}, []);

	const fetchImages = async (category) => {
		try {
			const response = await fetch(
				`http://localhost:8000/api/images?category=${category}`,
			);
			const data = await response.json();

			// Log fetched data to confirm the format
			console.log('Fetched images for category:', category, data);

			const filteredImages = data
				.filter((image) => image.category === category)
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

			setImages(filteredImages);
			setReorderedImages(filteredImages); // Initialize reorderedImages with fetched data
			setSelectedCategory(category);
		} catch (error) {
			console.error('Error fetching images:', error);
			setImages([]);
		}
	};

	const handleReorder = (newOrder) => {
		setReorderedImages(newOrder);
	};

	const handleSaveOrder = async () => {
		try {
			const token = localStorage.getItem('token');
			console.log('Token retrieved:', token);

			const response = await fetch(
				'http://localhost:8000/api/images/reorder',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						category: selectedCategory,
						images: reorderedImages.map((image) => image.id), // Use `id` instead of `_id`
					}),
				},
			);

			console.log('Response received:', response);

			if (response.ok) {
				alert('Order updated successfully!');
				console.log('Order update successful');
			} else {
				const errorData = await response.json();
				console.error('Failed to update order', errorData);
				console.log('Error response data:', errorData);
			}
		} catch (error) {
			console.error('Error updating image order:', error);
			console.log('Caught error:', error);
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="text-2xl font-bold mb-4">Reorder Images</h3>
			<div className="space-x-2">
				{categories.map((category) => (
					<button
						key={category}
						onClick={() => fetchImages(category)}
						className={`px-4 py-2 rounded ${
							selectedCategory === category
								? 'bg-blue-600 text-white'
								: 'bg-gray-300'
						}`}
					>
						{category.charAt(0).toUpperCase() + category.slice(1)}
					</button>
				))}
			</div>

			{selectedCategory && (
				<DndProvider backend={HTML5Backend}>
					<ul className="bg-white rounded-lg shadow-lg p-4 space-y-4">
						{reorderedImages.map((image, index) => (
							<SortableItem
								key={image.id || `fallback-${index}`} // Use `id` here
								image={image}
								index={index}
								images={reorderedImages}
								onReorder={handleReorder}
							/>
						))}
					</ul>
					<button
						onClick={handleSaveOrder}
						className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
					>
						Save Changes
					</button>
				</DndProvider>
			)}
		</div>
	);
};

const SortableItem = ({ image, index, images, onReorder }) => {
	const [, ref] = useDrag({
		type: ItemType,
		item: { index },
	});

	const [, drop] = useDrop({
		accept: ItemType,
		hover: (draggedItem) => {
			if (draggedItem.index !== index) {
				const reorderedImages = [...images];
				const [movedImage] = reorderedImages.splice(
					draggedItem.index,
					1,
				);
				reorderedImages.splice(index, 0, movedImage);

				onReorder(reorderedImages);
				draggedItem.index = index;
			}
		},
	});

	return (
		<li
			ref={(node) => ref(drop(node))}
			className="p-2 border rounded-md flex items-center space-x-4"
		>
			<img
				src={image.url}
				alt={image.title}
				className="w-16 h-16 object-cover rounded-md"
			/>
			<span>{image.title}</span>
		</li>
	);
};

export default AdminGalleryOrder;
