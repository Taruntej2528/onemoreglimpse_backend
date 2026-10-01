# Prazna Photography — Enterprise Node.js & MongoDB Backend

A production-grade, architectural Node.js & Express RESTful API backend for **Prazna Photography**, rebuilt with the requested modular structure:

* **Controller-Model Hierarchy**: Each model has its own dedicated folder containing `handler.js`, `route.js`, and `service.js`.
* **Dynamic Base CRUD**: All model services instantiate and call the dynamic generic `BaseCrud` repository (`src/utiles/crud/base.crud.js`).
* **Controller-Level Main Route**: `src/controllers/main.route.js` aggregates all module routes and is imported directly by the main server app.
* **Authentication & RBAC Access Management**: Full JWT authentication supporting Master **Admin** and **Sub-admins** with granular per-module permissions (`view`, `edit`, `delete`).
* **Request Logging**: Automatic logging of every incoming HTTP request to console and MongoDB `AuditLog` collection.
* **Multi-Cloud Bucket Storage**: Factory provider architecture supporting **AWS S3**, **Azure Blob Storage**, **Google Cloud Storage (GCS)**, **Firebase Storage**, **Cloudinary**, and **Local Disk Storage**.

---

## 📁 Architecture Overview

```
backend/
├── .env                              # Environment variables
├── package.json                      # Dependencies and scripts
├── uploads/                          # Local storage fallback directory
└── src/
    ├── app.js                        # Express application & global middleware pipeline
    ├── server.js                     # HTTP server startup & MongoDB bootstrap
    ├── config/                       # Configuration
    │   ├── env.js                    # Typed environment variables
    │   └── db.js                     # Mongoose connection handler
    ├── utiles/                       # Utilities, Models & Generic CRUD (also accessible via 'src/utils')
    │   ├── crud/
    │   │   └── base.crud.js          # Generic BaseCrud repository for any dynamic model
    │   ├── helpers/
    │   │   ├── response.helper.js    # Global standard response format
    │   │   ├── jwt.helper.js         # JWT signing & verification
    │   │   └── password.helper.js    # Bcrypt hashing & verification
    │   └── models/                   # Mongoose Data Models
    │       ├── User.js               # Admin & Sub-admins with module access permissions
    │       ├── Settings.js           # Branding, hero media, footer, storage buckets, email/sms
    │       ├── Category.js           # Portfolio photo & cinema categories
    │       ├── Media.js              # 4K videos & high-res images, heroActive flag
    │       ├── Event.js              # Signature packages & event types
    │       ├── ClientRequest.js      # Booking inquiries & quote builder submissions
    │       ├── Notification.js       # Admin notifications system
    │       ├── AuditLog.js           # Request & action logs
    │       └── index.js              # Exports all models
    ├── providers/                    # Multi-Cloud Storage Providers
    │   └── storage/
    │       ├── s3.provider.js        # AWS S3 (AWS SDK v3)
    │       ├── azure.provider.js     # Azure Blob Storage (@azure/storage-blob)
    │       ├── gcs.provider.js       # Google Cloud Storage (@google-cloud/storage)
    │       ├── firebase.provider.js  # Firebase Storage (firebase-admin)
    │       ├── cloudinary.provider.js# Cloudinary CDN (cloudinary v2)
    │       ├── local.provider.js     # Local disk storage
    │       └── index.js              # Dynamic provider factory
    ├── middlewares/                  # Express Middlewares
    │   ├── auth.middleware.js        # JWT Bearer token authentication
    │   ├── rbac.middleware.js        # Module-level access management (view/edit/delete)
    │   ├── requestLog.middleware.js  # Request logging to console & AuditLog collection
    │   ├── upload.middleware.js      # Multer file upload (up to 100MB)
    │   └── error.middleware.js       # Global error handler with standard response
    ├── controllers/                  # Dedicated Model Folders (handler, route, service)
    │   ├── main.route.js             # Controller-level root router (mounted at /api/v1)
    │   ├── auth/
    │   │   ├── handler.js            # Login, getMe, changePassword
    │   │   ├── route.js              # /api/v1/auth
    │   │   └── service.js
    │   ├── user/
    │   │   ├── handler.js            # User CRUD & module permission assignment
    │   │   ├── route.js              # /api/v1/users
    │   │   └── service.js            # Calls BaseCrud(User)
    │   ├── settings/
    │   │   ├── handler.js            # Site config, brand, hero, footer, bucket switcher
    │   │   ├── route.js              # /api/v1/settings
    │   │   └── service.js            # Calls BaseCrud(Settings)
    │   ├── category/
    │   │   ├── handler.js            # Category CRUD
    │   │   ├── route.js              # /api/v1/categories
    │   │   └── service.js            # Calls BaseCrud(Category)
    │   ├── media/
    │   │   ├── handler.js            # Upload, single-active hero toggle, list, delete
    │   │   ├── route.js              # /api/v1/media
    │   │   └── service.js            # Calls BaseCrud(Media) + storage providers
    │   ├── event/
    │   │   ├── handler.js            # Packages & event types CRUD
    │   │   ├── route.js              # /api/v1/events
    │   │   └── service.js            # Calls BaseCrud(Event)
    │   ├── request/
    │   │   ├── handler.js            # Booking inquiries & quotes
    │   │   ├── route.js              # /api/v1/requests
    │   │   └── service.js            # Calls BaseCrud(ClientRequest)
    │   ├── notification/
    │   │   ├── handler.js            # Notifications list, mark read, unread count
    │   │   ├── route.js              # /api/v1/notifications
    │   │   └── service.js            # Calls BaseCrud(Notification)
    │   └── log/
    │       ├── handler.js            # Request logs inspection & statistics
    │       ├── route.js              # /api/v1/logs
    │       └── service.js            # Calls BaseCrud(AuditLog)
    └── seed/
        └── seed.js                   # Database seeder (Admin, Sub-admin, Defaults)
```

---

## 🔑 Access Management & RBAC Permissions

System Modules:
* `dashboard`
* `events`
* `client_requests`
* `media`
* `categories`
* `settings`
* `notifications`
* `users`
* `logs`

Each sub-admin user can be granted granular permissions:
```json
{
  "module": "media",
  "permissions": {
    "view": true,
    "edit": true,
    "delete": false
  }
}
```

* **Master Admin (`ADMIN`)**: Has universal permission to view, edit, and delete across all modules.
* **Sub-Admin (`SUB_ADMIN`)**: Verified at runtime using `checkPermission(module, action)`. Unauthorized actions return `403 Forbidden`.

---

## 🌐 Global Response Format

All API responses follow the consistent contract:

### Success Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Media uploaded and stored successfully",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "totalCount": 42, "totalPages": 3 },
  "timestamp": "2026-09-30T11:45:00.000Z"
}
```

### Error Response:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. You do not have permission to delete the 'media' module.",
  "timestamp": "2026-09-30T11:45:00.000Z"
}
```

---

## 🚀 Default Credentials

Run `npm run seed` or start the server to auto-seed:

| Role | Email | Password | Access |
|---|---|---|---|
| **Master Admin** | `admin@praznaphotography.com` | `admin123` | Full access to all modules |
| **Sub-Admin** | `editor@praznaphotography.com` | `editor123` | Media, Events, Requests, Notifications |

---

## 📡 API Endpoints Summary

Base URL: `http://localhost:5000/api/v1`

### Authentication (`/auth`)
* `POST /auth/login`: User login returning JWT token
* `GET /auth/me`: Get current authenticated user profile and permissions
* `POST /auth/change-password`: Change password

### User Management (`/users`)
* `GET /users`: List users (Search & Pagination)
* `GET /users/:id`: Get user details
* `POST /users`: Create new sub-admin with module permissions
* `PUT /users/:id`: Update user details
* `PUT /users/:id/permissions`: Update sub-admin module permissions (`view`, `edit`, `delete`)
* `PATCH /users/:id/status`: Toggle user status (`ACTIVE` / `INACTIVE`)
* `DELETE /users/:id`: Delete user

### Media & Landing Hero (`/media`)
* `GET /media`: List media with filtering (images/videos, category, hero active)
* `POST /media/upload`: Upload file to active cloud bucket (S3, Azure, GCS, Firebase, Cloudinary, Local)
* `PATCH /media/:id/hero-active`: Enable any single video or single image for Landing Hero
* `DELETE /media/:id`: Delete from database and cloud storage bucket

### Website Settings (`/settings`)
* `GET /settings`: Retrieve public website configuration (brand, logo, hero, footer)
* `PUT /settings`: Update website configuration
* `PATCH /settings/storage/switch`: Switch active storage provider

### Portfolio Categories (`/categories`)
* `GET /categories`: List categories
* `GET /categories/active`: Active categories for portfolio filters
* `POST /categories`: Create category
* `PUT /categories/:id`: Update category
* `DELETE /categories/:id`: Delete category

### Packages & Events (`/events`)
* `GET /events`: List all events and packages
* `GET /events/packages/active`: Active signature packages for quote builder
* `POST /events`: Create package or event type
* `PUT /events/:id`: Update package
* `DELETE /events/:id`: Delete package

### Client Inquiries & Quotes (`/requests`)
* `POST /requests/submit`: Public submission of booking quotes
* `GET /requests`: List client inquiries with status filters
* `PATCH /requests/:id/status`: Update inquiry status (`NEW`, `CONTACTED`, `IN_PROGRESS`, `CONFIRMED`, `DECLINED`)
* `DELETE /requests/:id`: Delete request

### Notifications (`/notifications`)
* `GET /notifications`: List notifications
* `GET /notifications/unread-count`: Unread notifications count
* `PATCH /notifications/:id/read`: Mark single notification as read
* `PATCH /notifications/read-all`: Mark all notifications as read

### Request & Audit Logs (`/logs`)
* `GET /logs`: Query HTTP request logs (filter by module, status code, email)
* `GET /logs/stats`: Total requests, 24h error count, average response time
* `DELETE /logs/clear`: Clear old logs
