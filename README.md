# TaskMaster - Task Management Dashboard

A full-stack task management application with a dark mode cyberpunk-minimalism UI, built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: JWT-based login/registration with role-based access (user/admin)
- **Task Management**: Full CRUD operations for tasks (create, read, update, delete)
- **Categories**: Organize tasks by categories (admin can create/edit/delete, users can view)
- **Dark Mode UI**: Cyberpunk-minimalism design with crimson red accents
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Render (backend + static frontend)

## Project Structure

```
nodejs_web2/
├── controllers/
│   ├── authController.js     # Login/Register logic
│   ├── taskController.js     # Task CRUD operations
│   └── categoryController.js # Category CRUD operations
├── middleware/
│   └── authMiddleware.js     # JWT verification & RBAC
├── models/
│   ├── user.js               # User schema (email, password, role)
│   ├── task.js               # Task schema (title, desc, priority, category, userId)
│   └── category.js           # Category schema (name, color)
├── routes/
│   ├── authRoutes.js         # POST /register, /login
│   ├── taskRoutes.js         # GET/POST/PUT/DELETE /api/tasks
│   └── categoryRoutes.js     # GET/POST/PUT/DELETE /api/categories
├── public/
│   ├── index.html            # Dashboard UI
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── style.css             # Cyberpunk dark theme
│   └── script.js             # Frontend logic + auth
├── server.js                 # Express server setup
├── .env                      # Environment variables
└── package.json
```

## API Documentation

### Authentication

| Method | Endpoint           | Description      | Auth Required |
|--------|--------------------|------------------|---------------|
| POST   | `/api/auth/register` | Register user   | No            |
| POST   | `/api/auth/login`    | Login user      | No            |

**Register** - `POST /api/auth/register`
```json
{ "email": "user@example.com", "password": "password123" }
```

**Login** - `POST /api/auth/login`
```json
{ "email": "user@example.com", "password": "password123" }
```
Returns: `{ "token": "jwt...", "role": "user" }`

### Tasks (Auth Required)

| Method | Endpoint         | Description        | Auth Required |
|--------|------------------|--------------------|---------------|
| GET    | `/api/tasks`     | Get user's tasks   | Yes (Bearer)  |
| POST   | `/api/tasks`     | Create a task      | Yes (Bearer)  |
| PUT    | `/api/tasks/:id` | Update a task      | Yes (Bearer)  |
| DELETE | `/api/tasks/:id` | Delete a task      | Yes (Bearer)  |

**Create Task** - `POST /api/tasks`
```json
{
  "title": "My Task",
  "description": "Details here",
  "priority": "High",
  "category": "categoryObjectId"
}
```

### Categories

| Method | Endpoint              | Description        | Auth Required    |
|--------|-----------------------|--------------------|------------------|
| GET    | `/api/categories`     | Get all categories | No               |
| POST   | `/api/categories`     | Create category    | Yes (Admin only) |
| PUT    | `/api/categories/:id` | Update category    | Yes (Admin only) |
| DELETE | `/api/categories/:id` | Delete category    | Yes (Admin only) |

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/bananapie228/nodejs_web2.git
cd nodejs_web2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file:
```
PORT=3000
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

4. **Start the server**
```bash
npm start
```

5. **Open in browser**
```
http://localhost:3000
```

## Deployment

The application is deployed on Render as a single service (backend serves static frontend files).



## Environment Variables

| Variable      | Description                    | Required |
|---------------|--------------------------------|----------|
| `PORT`        | Server port (default: 3000)    | No       |
| `JWT_SECRET`  | Secret key for JWT signing     | Yes      |
| `MONGODB_URI` | MongoDB connection string      | Yes      |


## Deploy Link

```
https://todobest.onrender.com
```
