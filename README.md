# DS Photo Portfolio

![DS Photo Portfolio](backend/assets/Dawid_hero.jpg)

A professional photography portfolio and management application showcasing the work of DS Photography. This full-stack application features a stunning gallery system, booking management, and an intuitive admin panel.

## 🌟 Live Demo

-   Frontend: [https://fotods.no](https://fotods.no)
-   Backend API: [https://api.fotods.no](https://api.fotods.no)

## ✨ Features

### Client Features

-   📸 Browse categorized photo galleries with modern layouts
-   🎯 View individual categories in carousel and grid formats
-   📅 Submit and manage booking requests
-   📱 Fully responsive design for all devices
-   ✨ Beautiful animations and transitions

### Admin Features

-   🔐 Secure admin panel access
-   📤 Drag-and-drop image upload and management
-   🗂️ Real-time gallery category management
-   📊 Booking request management system
-   🔄 Dynamic image reordering within galleries

## 🛠️ Tech Stack

### Frontend

-   **Framework:** React 18
-   **Styling:** Tailwind CSS
-   **State Management:** React Context
-   **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
-   **Routing:** React Router v6
-   **HTTP Client:** Axios
-   **Icons:** Font Awesome
-   **Email Service:** EmailJS

### Backend

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** MongoDB with Mongoose
-   **File Storage:** AWS S3
-   **Authentication:** JWT (JSON Web Tokens)
-   **File Upload:** Multer, Multer-S3
-   **Security:** bcryptjs, CORS

### DevOps & Hosting

-   **Frontend Hosting:** Vercel
-   **Backend Hosting:** Render
-   **Domain & DNS:** Hostinger
-   **SSL/TLS:** Let's Encrypt
-   **Version Control:** Git

## 🚀 Installation

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB Atlas account
-   AWS S3 bucket
-   npm or yarn

### Setup Steps

1. **Clone the repository**

    ```bash
    git clone <https://github.com/PositivWarrior/dsphoto>
    cd dsphoto
    ```

2. **Frontend Setup**

    ```bash
    cd frontend
    npm install
    cp .env.example .env
    # Configure your environment variables
    npm start
    ```

3. **Backend Setup**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Configure your environment variables
    npm start
    ```

## 🔧 Environment Variables

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000
```

### Backend (.env)

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=your_aws_region

# Admin Configuration
ADMIN_SECURITY_CODE=your_admin_code
```

## 📚 API Documentation

### Authentication

-   `POST /api/auth/login` - Admin authentication

### Images

-   `GET /api/images` - Get all images or filter by category
-   `POST /api/images` - Upload new image (Admin only)
-   `DELETE /api/images/:id` - Delete image (Admin only)
-   `POST /api/images/reorder` - Reorder images (Admin only)

### Bookings

-   `POST /api/bookings` - Create booking request
-   `PATCH /api/bookings/:id` - Update booking status (Admin only)
-   `DELETE /api/bookings/:id` - Delete booking (Admin only)

## 🎨 Key Components

### Frontend

-   `Navbar` - Main navigation component
-   `GallerySections` - Gallery category display
-   `GalleryCategory` - Individual category view with carousel
-   `AdminPanel` - Protected admin interface
-   `BookingForm` - Client booking interface

### Backend

-   `ImageController` - Handles image operations
-   `BookingController` - Manages booking operations
-   `AuthMiddleware` - Handles authentication
-   `S3Service` - Manages AWS S3 operations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

-   Frontend Developer: [Kacper Margol]
-   Backend Developer: [Kacper Margol]
-   UI/UX Design: [Kacper Margol]

## 📞 Support

For support, email [kacppermargol@gmail.com] or create an issue in the repository.
