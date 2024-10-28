// src/components/GalleryOrder.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const GalleryOrder = () => {
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [images, setImages] = useState([]);

	useEffect(() => {
		const fetchCategories = async () => {
			const response = await fetch(
				'http://localhost:8000/api/categories',
			); // API endpoint for categories
			const data = await response.json();
			setCategories(data.categories);
		};

		fetchCategories();
	}, []);

	const fetchImages = async (category) => {
		const response = await fetch(
			`http://localhost:8000/api/images?category=${category}`,
		);
		const data = await response.json();
		setImages(data.images);
		setSelectedCategory(category);
	};

	const handleDragEnd = async (result) => {
		if (!result.destination) return;

		const reorderedImages = Array.from(images);
		const [movedImage] = reorderedImages.splice(result.source.index, 1);
		reorderedImages.splice(result.destination.index, 0, movedImage);
		setImages(reorderedImages);

		// Save reordered images
		await fetch('http://localhost:8000/api/images/order', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				category: selectedCategory,
				images: reorderedImages.map((image) => image._id),
			}),
		});
	};

	return (
		<div className="space-y-4">
			<h3 className="text-2xl font-bold mb-4">Reorder Images</h3>
			{/* Category Selection */}
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

			{/* Image Drag-and-Drop List */}
			{selectedCategory && (
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="images">
						{(provided) => (
							<ul
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="bg-white rounded-lg shadow-lg p-4 space-y-4"
							>
								{images.map((image, index) => (
									<Draggable
										key={image._id}
										draggableId={image._id}
										index={index}
									>
										{(provided) => (
											<li
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												className="p-2 border rounded-md flex items-center space-x-4"
											>
												<img
													src={image.url}
													alt={image.title}
													className="w-16 h-16 object-cover rounded-md"
												/>
												<span>{image.title}</span>
											</li>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</ul>
						)}
					</Droppable>
				</DragDropContext>
			)}
		</div>
	);
};

export default GalleryOrder;
