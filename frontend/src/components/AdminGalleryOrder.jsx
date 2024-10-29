import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

			const filteredImages = data
				.filter((image) => image.category === category)
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

			setImages(filteredImages);
			setSelectedCategory(category);
		} catch (error) {
			console.error('Error fetching images:', error);
			setImages([]);
		}
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;
		if (!over) return;

		if (active.id !== over.id) {
			const oldIndex = images.findIndex(
				(image) => image._id === active.id,
			);
			const newIndex = images.findIndex((image) => image._id === over.id);
			const reorderedImages = arrayMove(images, oldIndex, newIndex);
			setImages(reorderedImages);

			try {
				const token = localStorage.getItem('token');
				await fetch('http://localhost:8000/api/images/reorder', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						category: selectedCategory,
						images: reorderedImages.map((image) => image._id),
					}),
				});
			} catch (error) {
				console.error('Error updating image order:', error);
			}
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
				<DndContext
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={images.map(
							(image) => image._id || `fallback-${image.url}`,
						)}
						strategy={verticalListSortingStrategy}
					>
						<ul className="bg-white rounded-lg shadow-lg p-4 space-y-4">
							{images.map((image, index) => (
								<SortableItem
									key={image._id || `fallback-${index}`}
									id={image._id || `fallback-${index}`}
									image={image}
								/>
							))}
						</ul>
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
};

// Sortable item component
const SortableItem = ({ id, image }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
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
