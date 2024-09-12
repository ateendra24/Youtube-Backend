# Youtube Backend

A backend for a YouTube-like website. This project is built using Node.js, Express, MongoDB, and Mongoose, featuring user authentication, video uploads, playlist management, and more.

## Features

- User authentication (sign up, login, token-based authentication)
- Video upload and storage (using Cloudinary)
- Playlist management
- Commenting system
- Secure password handling (using bcrypt)
- Token-based authentication (JWT)
- Cross-origin resource sharing (CORS)
- Environment variable configuration (dotenv)

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB & Mongoose**: NoSQL database and ODM for database modeling
- **JWT**: Secure user authentication
- **Cloudinary**: Cloud storage for video uploads
- **Multer**: Middleware for handling file uploads
- **bcrypt**: Password hashing
- **dotenv**: Environment variable management

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/ateendra24/Youtube-Backend/.git
    ```

2. Navigate to the project directory:

    ```bash
    cd Youtube-Backend
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up your environment variables. Create a `.env` file in the root directory and add the following:

    ```bash
    PORT=8000
    MONGODB_URL=
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=
    REFRESH_TOKEN_EXPIRY=10d

    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

## API Endpoints

Here are some of the key endpoints provided by this backend:

- **User Authentication**
  - POST `/users/register` – User registration
  - POST `/users/login` – User login

- **Videos**
  - POST `/videos/` – Upload a video
  - GET `/videos/:id` – Get video details
  - DELETE `/videos/:id` – Delete a video

- **Playlists**
  - POST `/playlist/` – Create a new playlist
  - GET `/playlists/:id` – Get playlist details

- **Comments**
  - POST `/comments/:videoId/` – Add a comment to a video
  - GET `/comments/:videoId/` – Get comments for a video

## License

This project is licensed under the ISC License.

## Author

Created by Ateendra Pratap Solanki
