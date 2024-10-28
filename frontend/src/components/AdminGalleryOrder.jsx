import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const AdminGalleryOrder = () => {
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [images, setImages] = useState([]);

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

			const filteredImages = data.filter(
				(image) => image.category === category,
			);

			const sortedImages = filteredImages.sort(
				(a, b) => (a.order ?? 0) - (b.order ?? 0),
			);

			setImages(sortedImages);
			setSelectedCategory(category);
		} catch (error) {
			console.error('Error fetching images:', error);
			setImages([]);
		}
	};

	const handleDragEnd = async (result) => {
		if (!result.destination) return;

		const reorderedImages = Array.from(images);
		const [movedImage] = reorderedImages.splice(result.source.index, 1);
		reorderedImages.splice(result.destination.index, 0, movedImage);
		setImages(reorderedImages);

		try {
			await fetch('http://localhost:8000/api/images/order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: selectedCategory,
					images: reorderedImages.map((image) => image._id),
				}),
			});
		} catch (error) {
			console.error('Error updating image order:', error);
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
				<DragDropContext onDragEnd={handleDragEnd}>
					{/* Using a unique droppableId for each selectedCategory */}
					<Droppable droppableId={`droppable-${selectedCategory}`}>
						{(provided) => (
							<ul
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="bg-white rounded-lg shadow-lg p-4 space-y-4"
							>
								{images && images.length > 0 ? (
									images.map((image, index) => (
										// Check for unique keys and draggableIds
										<Draggable
											key={image._id || `image-${index}`}
											draggableId={`draggable-${
												image._id || index
											}`}
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
									))
								) : (
									<p className="text-gray-500">
										No images available for this category.
									</p>
								)}
								{provided.placeholder}
							</ul>
						)}
					</Droppable>
				</DragDropContext>
			)}
		</div>
	);
};

export default AdminGalleryOrder;
