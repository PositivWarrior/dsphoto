# DS Photo Portfolio

A professional photography portfolio website built with React and Node.js, featuring a modern UI, image gallery management, and booking system.

## Features

### Frontend

-   📸 Responsive image gallery with category filtering
-   🎨 Modern, minimalist design with Tailwind CSS
-   📱 Mobile-friendly interface
-   🔄 Drag-and-drop image reordering (admin)
-   📅 Booking system for photography sessions
-   🔐 Secure admin panel
-   🌐 SEO optimized with React Helmet
-   ⚡ Performance optimized with code splitting and compression

### Backend

-   🖼️ AWS S3 image storage integration
-   🔒 JWT authentication for admin access
-   📊 MongoDB database for data persistence
-   🔄 RESTful API endpoints
-   🚀 Nginx reverse proxy with SSL
-   📤 Image upload with size validation (up to 50MB)
-   📝 Booking management system

## Tech Stack

### Frontend

-   React 18
-   React Router 6
-   Axios for API calls
-   Tailwind CSS
-   DND Kit for drag-and-drop
-   EmailJS for contact forms

### Backend

-   Node.js with Express
-   MongoDB with Mongoose
-   AWS SDK for S3
-   Multer for file uploads
-   JWT for authentication
-   PM2 for process management

### Infrastructure

-   AWS EC2 for hosting
-   AWS S3 for image storage
-   Nginx as reverse proxy
-   Let's Encrypt SSL
-   MongoDB Atlas

## Getting Started

### Prerequisites

-   Node.js 18+
-   MongoDB
-   AWS Account with S3 bucket
-   PM2 (for production)

### Environment Variables

#### Backend (.env)

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
NODE_ENV=development
```

#### Frontend (.env)

```
REACT_APP_API_URL=https://api.fotods.no
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/PositivWarrior/dsphoto.git
cd dsphoto
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Start development servers:

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm start
```

### Production Deployment

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Deploy to AWS:

```bash
cd backend/scripts
./sync-to-aws.sh
```

3. Configure Nginx:

```bash
./update-nginx-config.sh
```

## API Endpoints

### Public

-   `GET /images` - Get all images or filter by category
-   `GET /images/categories` - Get available categories
-   `POST /bookings` - Create a booking request

### Protected (Admin)

-   `POST /images` - Upload new image
-   `DELETE /images/:id` - Delete image
-   `POST /images/reorder` - Reorder images
-   `GET /bookings` - Get all bookings
-   `PATCH /bookings/:id` - Update booking status
-   `DELETE /bookings/:id` - Delete booking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

Kacper Margol - [Portfolio](https://kacpermargol.eu)

Project Link: [https://github.com/PositivWarrior/dsphoto](https://github.com/PositivWarrior/dsphoto)
