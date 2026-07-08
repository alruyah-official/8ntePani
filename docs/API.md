# 8ntePani API Documentation

## Base URL
**Production:** `https://8ntepani-backend.onrender.com`  
**Local:** `http://localhost:5000`

## Authentication
This API uses JSON Web Tokens (JWT). For protected routes, you must include the token in the `Authorization` header of your HTTP requests using the `Bearer` scheme.

**Example:**
```http
Authorization: Bearer <your_jwt_token_here>
```

## Standard Response Format
All successful responses share this standardized envelope:
```json
{
  "success": true,
  "message": "Human readable success message",
  "data": { 
    // payload here 
  }
}
```

## Standard Error Format
All failed requests share this standardized envelope:
```json
{
  "success": false,
  "message": "Human readable error description",
  "error": "Detailed error string or code"
}
```

## Validation Rules
The API strictly enforces the following rules (violating them returns a `400 Bad Request`):
- **User Registration**: Names must be 2-50 chars. Passwords must be at least 6 characters. Role must be `CLIENT` or `FREELANCER`.
- **Freelancer Profiles**: Bio cannot exceed 500 chars. At least 1 skill is required.
- **Services (Gigs)**: Title must be 5-100 chars. Description must be at least 20 chars. Price must be positive (> 0). Delivery Days must be an integer between 1 and 30.
- **Reviews**: Rating must be a whole number between 1 and 5. Comments cannot exceed 1000 chars. Client cannot review the same service twice.
- **Messaging**: Message content must be 1-2000 chars. Clients cannot message themselves.
- **Image Uploads**: Files must be exactly `.jpg`, `.png`, or `.webp`. Max size is 5MB per file. Maximum 5 files per multiple upload.

---

## 1. Health Check

### Get Server Health
- **Method:** `GET`
- **URL:** `/health`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Server is running",
    "environment": "production",
    "timestamp": "2026-07-08T12:00:00.000Z"
  }
  ```
- **Error Responses:** None (500 if server is down)

---

## 2. Authentication

### Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "CLIENT"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "cuid...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "CLIENT",
        "createdAt": "..."
      },
      "token": "eyJhbG..."
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Validation failed)
  - `409 Conflict` (Email already exists)

### Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "cuid...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "CLIENT",
        "avatar": null
      },
      "token": "eyJhbG..."
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Validation failed)
  - `401 Unauthorized` (Invalid credentials)

---

## 3. Freelancer Profile

### Create Profile
- **Method:** `POST`
- **URL:** `/api/profile`
- **Auth Required:** Yes
- **Role Required:** `FREELANCER`
- **Request Body:**
  ```json
  {
    "bio": "Expert React Developer",
    "skills": ["React", "Node.js", "TypeScript"],
    "location": "New York, USA",
    "languages": ["English", "Spanish"]
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Freelancer profile created successfully",
    "data": {
      "profile": {
        "id": "cuid...",
        "userId": "cuid...",
        "bio": "Expert React Developer",
        "skills": ["React", "Node.js", "TypeScript"],
        "location": "New York, USA",
        "languages": ["English", "Spanish"]
      }
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Validation failed)
  - `403 Forbidden` (Not a freelancer)
  - `409 Conflict` (Profile already exists for this user)

### Update Profile
- **Method:** `PUT`
- **URL:** `/api/profile`
- **Auth Required:** Yes
- **Role Required:** `FREELANCER`
- **Request Body:** *(All fields optional)*
  ```json
  {
    "location": "Remote"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "profile": { ...updatedProfileData }
    }
  }
  ```
- **Error Responses:** 
  - `404 Not Found` (Profile does not exist yet)

### Get Own Profile
- **Method:** `GET`
- **URL:** `/api/profile/me`
- **Auth Required:** Yes
- **Role Required:** Any
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile fetched successfully",
    "data": {
      "profile": { ...profileData, "user": { "name": "Jane", "avatar": null } }
    }
  }
  ```
- **Error Responses:** 
  - `404 Not Found` (Profile not found)

### Get Profile by User ID
- **Method:** `GET`
- **URL:** `/api/profile/:userId`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile fetched successfully",
    "data": {
      "profile": { ...profileData, "services": [...] }
    }
  }
  ```
- **Error Responses:** 
  - `404 Not Found` (Profile not found)

### Upload Avatar
- **Method:** `POST`
- **URL:** `/api/profile/avatar`
- **Auth Required:** Yes
- **Role Required:** Any
- **Request Body:** `multipart/form-data` with field `image`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Avatar updated successfully",
    "data": {
      "user": {
        "id": "...",
        "name": "John Doe",
        "avatar": "https://res.cloudinary.com/..."
      }
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Missing file, wrong type, or too large)

---

## 4. Categories

### Get All Categories
- **Method:** `GET`
- **URL:** `/api/categories`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Categories fetched successfully",
    "data": {
      "categories": [
        { "id": "1", "name": "Web Development", "slug": "web-development" }
      ]
    }
  }
  ```
- **Error Responses:** None

### Create Category
- **Method:** `POST`
- **URL:** `/api/categories`
- **Auth Required:** Yes
- **Role Required:** Any *(Can be restricted to Admin later)*
- **Request Body:**
  ```json
  {
    "name": "Graphic Design",
    "slug": "graphic-design"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "category": { "id": "2", "name": "Graphic Design", "slug": "graphic-design" }
    }
  }
  ```
- **Error Responses:** 
  - `409 Conflict` (Category slug already exists)

---

## 5. Services

### Create Service
- **Method:** `POST`
- **URL:** `/api/services`
- **Auth Required:** Yes
- **Role Required:** `FREELANCER`
- **Request Body:**
  ```json
  {
    "categoryId": "cuid...",
    "title": "I will build a React website",
    "description": "Full stack development with Next.js and Prisma...",
    "price": 500,
    "deliveryDays": 7,
    "images": ["url1", "url2"]
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Service created successfully",
    "data": {
      "service": { ...serviceData }
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Validation failed)
  - `404 Not Found` (Category does not exist)

### Update Service
- **Method:** `PUT`
- **URL:** `/api/services/:serviceId`
- **Auth Required:** Yes
- **Role Required:** `FREELANCER`
- **Request Body:** *(All fields optional)*
  ```json
  {
    "price": 600
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Service updated successfully",
    "data": {
      "service": { ...updatedServiceData }
    }
  }
  ```
- **Error Responses:** 
  - `403 Forbidden` (Not the owner of the service)
  - `404 Not Found` (Service not found)

### Delete Service
- **Method:** `DELETE`
- **URL:** `/api/services/:serviceId`
- **Auth Required:** Yes
- **Role Required:** `FREELANCER`
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Service deleted successfully",
    "data": null
  }
  ```
- **Error Responses:** 
  - `403 Forbidden` (Not the owner of the service)
  - `404 Not Found` (Service not found)

### Get All Services
- **Method:** `GET`
- **URL:** `/api/services`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
  *(Optional Query Params: `categoryId`, `minPrice`, `maxPrice`, `search`)*
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Services fetched successfully",
    "data": {
      "services": [ { ...serviceData, "freelancer": {...} } ]
    }
  }
  ```
- **Error Responses:** None

### Get Service by ID
- **Method:** `GET`
- **URL:** `/api/services/:serviceId`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Service fetched successfully",
    "data": {
      "service": { ...serviceData, "category": {...}, "freelancer": {...} }
    }
  }
  ```
- **Error Responses:** 
  - `404 Not Found` (Service not found)

### Get Services by Freelancer
- **Method:** `GET`
- **URL:** `/api/services/freelancer/:userId`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Services fetched successfully",
    "data": {
      "services": [ ... ]
    }
  }
  ```
- **Error Responses:** None

---

## 6. Reviews

### Create Review
- **Method:** `POST`
- **URL:** `/api/reviews`
- **Auth Required:** Yes
- **Role Required:** `CLIENT`
- **Request Body:**
  ```json
  {
    "serviceId": "cuid...",
    "rating": 5,
    "comment": "Outstanding work!"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Review submitted successfully",
    "data": {
      "review": { ...reviewData, "client": { "name": "John" } }
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Invalid rating)
  - `404 Not Found` (Service does not exist)
  - `409 Conflict` (You have already reviewed this service)

### Get Reviews by Service
- **Method:** `GET`
- **URL:** `/api/reviews/service/:serviceId`
- **Auth Required:** No
- **Role Required:** None
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Reviews fetched successfully",
    "data": {
      "totalReviews": 1,
      "averageRating": 5.0,
      "reviews": [ ... ]
    }
  }
  ```
- **Error Responses:** 
  - `404 Not Found` (Service not found)

### Delete Review
- **Method:** `DELETE`
- **URL:** `/api/reviews/:reviewId`
- **Auth Required:** Yes
- **Role Required:** `CLIENT`
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Review deleted successfully",
    "data": null
  }
  ```
- **Error Responses:** 
  - `403 Forbidden` (Not the owner of the review)
  - `404 Not Found` (Review not found)

---

## 7. Conversations & Messaging

### Start Conversation
- **Method:** `POST`
- **URL:** `/api/conversations`
- **Auth Required:** Yes
- **Role Required:** `CLIENT`
- **Request Body:**
  ```json
  {
    "freelancerId": "cuid..."
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Conversation started successfully",
    "data": {
      "isNew": true,
      "conversation": { ... }
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Cannot message yourself / Target is not a freelancer)

### Get My Conversations (Inbox)
- **Method:** `GET`
- **URL:** `/api/conversations`
- **Auth Required:** Yes
- **Role Required:** Any
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Conversations fetched successfully",
    "data": {
      "count": 1,
      "conversations": [
        { ...conversationData, "messages": [ /* latest message preview */ ] }
      ]
    }
  }
  ```
- **Error Responses:** None

### Get Conversation by ID
- **Method:** `GET`
- **URL:** `/api/conversations/:conversationId`
- **Auth Required:** Yes
- **Role Required:** Any (Must be a participant)
- **Request Body:** None
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Conversation fetched successfully",
    "data": {
      "conversation": { ...conversationData, "messages": [ /* full thread */ ] }
    }
  }
  ```
- **Error Responses:** 
  - `403 Forbidden` (Not a participant)
  - `404 Not Found` (Conversation not found)

### Send Message
- **Method:** `POST`
- **URL:** `/api/conversations/:conversationId/messages`
- **Auth Required:** Yes
- **Role Required:** Any (Must be a participant)
- **Request Body:**
  ```json
  {
    "content": "Hello! I am interested in your gig."
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Message sent successfully",
    "data": {
      "message": { "id": "...", "content": "Hello!", "sender": {...} }
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (Empty content)
  - `403 Forbidden` (Not a participant)
  - `404 Not Found` (Conversation not found)

---

## 8. Image Upload

### Upload Single Image
- **Method:** `POST`
- **URL:** `/api/upload/single`
- **Auth Required:** Yes
- **Role Required:** Any
- **Request Body:** `multipart/form-data` with field `image`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
      "secure_url": "https://res.cloudinary.com/...",
      "public_id": "8ntepani/general/..."
    }
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (No file, wrong type, or >5MB)

### Upload Multiple Images
- **Method:** `POST`
- **URL:** `/api/upload/multiple`
- **Auth Required:** Yes
- **Role Required:** Any
- **Request Body:** `multipart/form-data` with field `images` *(up to 5 files)*
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Images uploaded successfully",
    "data": [
      {
        "secure_url": "https://res.cloudinary.com/...",
        "public_id": "8ntepani/general/..."
      }
    ]
  }
  ```
- **Error Responses:** 
  - `400 Bad Request` (No files, wrong type, >5MB, or >5 files)

---

## Frontend Integration Guide

This section is designed to help frontend developers easily integrate with the 8ntePani API.

### 1. Storing the JWT Token
Upon a successful `/api/auth/login` or `/register`, the server will return a `token`. Store this token securely. For most SPAs (React, Vue), `localStorage` is standard:
```javascript
const response = await api.post('/auth/login', credentials);
if (response.data.success) {
  localStorage.setItem('token', response.data.data.token);
}
```

### 2. Sending the Token
For any endpoint marked **Auth Required: Yes**, you must include the token in the headers of your `fetch` or `axios` call.

**Axios Interceptor Example:**
```javascript
import axios from 'axios';

const api = axios.create({ baseURL: 'https://8ntepani-backend.onrender.com' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Handling 401 Unauthorized
If you receive a `401` status code, it means the user's token is missing, expired, or invalid. You should immediately clear the stored token and redirect the user to the Login page.
```javascript
if (error.response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 4. Handling 403 Forbidden
If you receive a `403` status code, the user is logged in, but their role does not permit them to perform the action (e.g., a `CLIENT` trying to create a gig). You should show a UI toast or redirect them to a generic "Not Authorized" page.

### 5. Uploading Images (FormData)
Because image uploads require `multipart/form-data`, you cannot send a standard JSON body. You must use the browser's built-in `FormData` API.

**Example: Uploading an Avatar**
```javascript
const handleAvatarUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file); // The field name must match the API doc exactly ('image')

  const response = await fetch('https://8ntepani-backend.onrender.com/api/profile/avatar', {
    method: 'POST',
    headers: {
      // Do NOT set Content-Type here; the browser sets it automatically with boundaries
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  const result = await response.json();
  console.log(result.data.user.avatar); // The new image URL
};
```
