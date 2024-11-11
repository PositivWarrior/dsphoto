-   DS Photo Portfolio

    DS Photo Portfolio is a fully-featured photography portfolio and management application, built with React, Node.js, Express, and MongoDB.
    The application allows the photographer to showcase their work across categorized galleries, handle client bookings, and manage image uploads and orders from an intuitive admin panel.

-   Table of Contents

    # Project Overview

    # Features

    # Technologies

    # Installation and Setup

    # Environment Variables

    # API Endpoints

    # Component Breakdown

-   Features

    # User

          Browse categorized galleries with visually appealing layouts.
          View individual categories with carousel and grid formats.
          Submit booking requests with contact information.
          Responsive and mobile-friendly UI.

    # Admin

          Log in to access the protected admin panel.
          Upload, reorder, and delete images for each gallery category.
          Accept or decline bookings.
          Manage gallery categories and update images in real-time.

-   Technologies
    Frontend: React, TailwindCSS, React Router, React DnD, Font Awesome
    Backend: Node.js, Express, MongoDB, AWS S3 for image storage, multer
    Authentication: JSON Web Tokens (JWT)

-   Installation and Setup

    # Prerequisites

          Ensure the following software is installed:

              Node.js (v14+)
              MongoDB (local or cloud-based)
              AWS S3 account with bucket details for media storage

    # Clone the repository

          git clone https://github.com/your-username/dsphoto-portfolio.git
          cd dsphoto-portfolio

    # Install dependencies

          # Navigate to both the frontend and backend folders to install dependencies:

          # For frontend
              cd frontend
              npm install

          # For backend
              cd backend
              npm install

-   Environment Variables
    Create a .env file in the root of the backend folder and add the following:

    # MongoDB Connection URI

          MONGO_URI=mongodb+srv://kacpermargol:GOhK1uGCnCuD46bH@dsphoto.frnfj.mongodb.net/?retryWrites=true&w=majority&appName=dsphoto
          MONGO_USSER=kacpermargol
          MONGO_PASS=

    # JWT Secret Key

          JWT_SECRET=

    # AWS S3 Configuration

          AWS_ACCESS_KEY_ID=AKIAZ7SAKWFJ7KXEQIO3
          AWS_SECRET_ACCESS_KEY=
          AWS_BUCKET_NAME=ds-photo
          AWS_REGION=eu-north-1

-   API Endpoints

    # Auth

          POST /api/auth/login: Logs in the user and returns a JWT.

    # Images

          GET /api/images: Retrieves images, optionally filtered by category.
          POST /api/images: Admin-only route for uploading an image.
          DELETE /api/images/:id: Admin-only route for deleting an image.
          POST /api/images/reorder: Admin-only route to reorder images.

    # Bookings

          POST /api/bookings: Submit a new booking request.
          PATCH /api/bookings/:id: Update the status of a booking.
          DELETE /api/bookings/:id: Delete a booking request.

-   Component Breakdown

    # Frontend Components

          Navbar: Displays links for navigation across the site.
          GallerySections: Displays available gallery categories with thumbnails.
          GalleryCategory: Shows images in a specific category with a carousel view.
          Admin: Protected admin page with views to manage bookings, uploads, and galleries.

    # Backend Controllers

          Image Controller: Manages image uploading, retrieval, deletion, and reordering.
          Booking Controller: Handles booking submissions, status updates, and deletion.
