# NoteNest

NoteNest is a web application for managing personal notes. Users can register, log in, create, update, delete, and pin notes. The application ensures secure authentication and provides a user-friendly interface for managing notes.

---

## Features

- **User Authentication**: Register, log in, and log out securely.
- **Note Management**:
  - Create, update, delete, and pin notes.
  - Notes are sorted by pinned status and creation date.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Toast Notifications**: Provides feedback for user actions (e.g., success, error).

---

## Tech Stack

### Frontend
- **HTML5**, **CSS3**, **JavaScript**
- Toast notifications for user feedback

### Backend
- **Node.js** with **Express.js**
- **MongoDB** for database
- **Mongoose** for object modeling
- **JWT** for authentication

### Other Tools
- **dotenv** for environment variable management
- **bcrypt** for password hashing
- **cookie-parser** for handling cookies
- **CORS** for cross-origin requests

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Notenest-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     PORT=5000
     MONGODB_URI=<your-mongodb-uri>
     ACCESS_TOKEN_SECRET=<your-access-token-secret>
     ACCESS_TOKEN_EXPIRY=15m
     REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
     REFRESH_TOKEN_EXPIRY=10d
     ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open the application in your browser:
   ```
   http://localhost:5000
   ```

---

## API Endpoints

### User Routes
- **POST** `/api/v1/users/register`: Register a new user.
- **POST** `/api/v1/users/login`: Log in a user.
- **POST** `/api/v1/users/logout`: Log out the current user.
- **GET** `/api/v1/users/current-user`: Get the current user's profile.

### Note Routes
- **GET** `/api/v1/notes/`: Get all notes for the logged-in user.
- **POST** `/api/v1/notes/create`: Create a new note.
- **PUT** `/api/v1/notes/:id`: Update a note by ID.
- **DELETE** `/api/v1/notes/:id`: Delete a note by ID.
- **PUT** `/api/v1/notes/:id/pin`: Toggle the pinned status of a note.

---

## Folder Structure

```
Notenest-v2/
├── public/
│   ├── dashboard.html
│   ├── login_register.html
│   ├── script.js
│   ├── style.css
│   ├── style2.css
├── src/
│   ├── app.js
│   ├── index.js
│   ├── constants.js
│   ├── controlers/
│   │   ├── user.controller.js
│   │   ├── note.controller.js
│   ├── db/
│   │   ├── db_connection.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   ├── model/
│   │   ├── user.model.js
│   │   ├── note.model.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── note.routes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
├── .env
├── package.json
```

## Future Improvements

- Add support for sharing notes with other users.
- Implement search functionality for notes.
- Add categories or tags for better note organization.
- Improve UI/UX for a more seamless experience.

---

## License

This project is licensed under the MIT License.
