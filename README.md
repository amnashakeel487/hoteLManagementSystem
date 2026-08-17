# Stayfolio — Hotel Management & Onboarding Platform

<div align="center">

![Stayfolio Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80)

**A full-stack hotel management platform with owner onboarding, admin approval workflows, guest booking, and live analytics.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://hotel-management-system.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Railway-blueviolet?style=for-the-badge&logo=railway)](https://hotelmanagementsystem-production-4857.up.railway.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Developer](#developer)

---

## 🏨 Overview

**Stayfolio** is a production-ready hotel management and onboarding platform that bridges hotel owners, platform administrators, and guests in a single cohesive system.

Hotel owners register their properties through a multi-step onboarding form. Submissions enter a structured approval pipeline where admins review, approve, or reject registrations. Once approved, the owner's full dashboard unlocks — enabling room management, booking approvals, guest reviews, revenue analytics, and cleaning service requests.

Guests can explore live hotels, book rooms, and track their reservations through a dedicated guest portal.

---

## ✨ Features

### 🧑‍💼 Owner Portal
- **Multi-step Hotel Registration** — 4-step form (Business → Location → Property → Documents)
- **Status-aware Dashboard** — Dashboard only unlocks after admin approval; pending/rejected/suspended owners see a clear status page
- **Room & Pricing Management** — Add, edit, and delete room categories with amenities, photos, and pricing
- **Bookings & Calendar** — Review, approve, or reject guest booking requests with a live availability calendar
- **Reviews Management** — Read and reply to guest reviews
- **Revenue & Analytics** — Revenue charts, occupancy rates, and booking breakdowns
- **Cleaning Service** — Request complimentary professional cleaning for eligible hotels (10+ bookings/month)
- **Hotel Profile** — Update hotel details, gallery, logo, cover image, and location

### 🛡️ Admin Console
- **Hotel Approval Pipeline** — Review pending registrations with full detail including uploaded documents
- **Document Preview** — In-dashboard lightbox for business licenses, CNIC/ID documents, logos, and cover images
- **Status Management** — Approve, reject (with reason), suspend, or reactivate any hotel
- **All Hotels View** — Full registry of hotels with filtering by status
- **Cleaning Team Management** — Assign cleaning teams to hotel service requests
- **Platform Analytics** — System-wide booking counts, revenue, and hotel statistics
- **Notification System** — Platform-wide notification management
- **Admin Settings** — System configuration and platform preferences

### 🌐 Guest Portal
- **Hotel Exploration** — Browse all approved hotels with photos, ratings, and pricing
- **Room Booking** — Book rooms directly with date selection and guest details
- **Booking Confirmation** — Email-style booking confirmation page
- **My Bookings** — Look up all personal bookings by email address

### 🔒 Security & Access Control
- **JWT Authentication** — Stateless, token-based auth with role-based access control
- **Separated Login Portals** — Distinct login pages for hotel owners (`/login`) and admins (`/admin-login`)
- **ProtectedRoute Guards** — All owner and admin routes are gated by role and hotel status
- **Status Gate** — Pending/rejected/suspended owners cannot access the dashboard; fresh API verification on every load

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **React Router v7** | Client-side routing |
| **Vite 8** | Build tool & dev server |
| **Vanilla CSS** | Custom design system (no Tailwind, no Bootstrap) |
| **JWT (localStorage)** | Auth token storage |
| **Cloudinary** | Persistent cloud file storage for uploaded documents & images |

### Backend
| Technology | Purpose |
|---|---|
| **Python / Flask** | REST API server |
| **Flask-SQLAlchemy** | ORM for database models |
| **Flask-Migrate** | Database schema migrations |
| **Flask-JWT-Extended** | JWT authentication & authorization |
| **Flask-CORS** | Cross-origin resource sharing |
| **Flask-Mail** | Transactional email |
| **Flask-Limiter** | API rate limiting |
| **Gunicorn** | Production WSGI server |
| **Cloudinary SDK** | File upload to cloud storage |

### Databases
| Environment | Database |
|---|---|
| **Production (Railway)** | PostgreSQL (via Railway add-on) |
| **Development** | SQLite (auto-fallback) |

### Deployment
| Service | Role |
|---|---|
| **Vercel** | Frontend (React SPA) |
| **Railway** | Backend API + PostgreSQL database |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel (CDN)                        │
│           React SPA — hotel-management.vercel.app       │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS REST API Calls
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Railway — Backend                       │
│         Flask API  +  Gunicorn WSGI Server              │
│                                                         │
│   /api/auth        /api/hotels        /api/admin        │
│   /api/bookings    /api/reviews       /api/analytics    │
└──────────────┬──────────────────┬────────────────────────┘
               │                  │
               ▼                  ▼
  ┌────────────────────┐   ┌─────────────────────┐
  │  Railway PostgreSQL │   │  Cloudinary CDN      │
  │  (Persistent DB)   │   │  (Files & Images)    │
  └────────────────────┘   └─────────────────────┘
```

---

## 👤 User Roles

| Role | Access | Login Route |
|---|---|---|
| **Guest** | Public hotel browsing and booking (no login required) | N/A |
| **Hotel Owner** | Owner dashboard after hotel approval | `/login` |
| **Admin** | Full platform administration console | `/admin-login` |

### Hotel Status Lifecycle

```
Draft → Pending Approval → Approved → Active
                       ↘ Rejected (owner can re-register)
             Active → Suspended (admin can reactivate)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and npm
- **Python** 3.10+
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/amnashakeel487/hoteLManagementSystem.git
cd hoteLManagementSystem
```

### 2. Setup the Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```env
FLASK_CONFIG=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DATABASE_URL=                      # leave empty for SQLite in development
```

Initialize the database and run:

```bash
flask db upgrade
python wsgi.py
```

The backend will start at `http://localhost:5000`.

### 3. Setup the Frontend

```bash
# From the project root
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`.

### 4. Access the App

| Portal | URL |
|---|---|
| Landing Page | `http://localhost:5173/` |
| Guest Explore | `http://localhost:5173/explore` |
| Hotel Registration | `http://localhost:5173/register` |
| Owner Login | `http://localhost:5173/login` |
| Admin Login | `http://localhost:5173/admin-login` |

**Default Admin Credentials (seeded on first run):**
```
Email:    admin@stayfolio.com
Password: admin123
```

---

## 🔐 Environment Variables

### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.railway.app` |

### Backend (`.env`)

| Variable | Description | Required |
|---|---|---|
| `FLASK_CONFIG` | Config mode (`development` / `production`) | ✅ |
| `SECRET_KEY` | Flask session secret key | ✅ |
| `JWT_SECRET_KEY` | JWT signing key | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | Production only |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Production only |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Production only |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Production only |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Production only |

> ⚠️ **Note:** Without `CLOUDINARY_*` variables, uploaded files fall back to local filesystem storage (development only). On Railway (production), Cloudinary is required for files to persist across deployments.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login (owner or admin) |
| `POST` | `/api/auth/register` | Register a new user account |

### Hotels
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hotels/register` | Submit hotel registration (multipart form) |
| `GET` | `/api/hotels/owner/my-hotel` | Get the authenticated owner's hotel |
| `GET` | `/api/hotels/public` | List all active hotels (guest facing) |
| `GET` | `/api/hotels/:id` | Get hotel detail by ID |
| `PATCH` | `/api/hotels/:id` | Update hotel profile |

### Rooms
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hotels/:id/rooms` | List rooms for a hotel |
| `POST` | `/api/hotels/:id/rooms` | Add a new room category |
| `PATCH` | `/api/hotels/:id/rooms/:room_id` | Update a room |
| `DELETE` | `/api/hotels/:id/rooms/:room_id` | Delete a room |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hotels/:id/bookings` | Create a booking (guest) |
| `GET` | `/api/hotels/:id/bookings` | List bookings for a hotel (owner) |
| `PATCH` | `/api/hotels/:id/bookings/:booking_id` | Approve or reject a booking |
| `GET` | `/api/hotels/public/guest-bookings` | Lookup bookings by guest email |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/hotels` | All hotels (admin only) |
| `PATCH` | `/api/admin/hotels/:id/status` | Approve / reject / suspend hotel |

### Analytics & Reviews
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hotels/:id/reviews` | Get reviews for a hotel |
| `POST` | `/api/hotels/:id/reviews` | Submit a guest review |
| `GET` | `/api/analytics/hotels/:id` | Get analytics for a hotel |

---

## 🗄️ Database Schema

```
User
 ├── id, email, password_hash, role (admin | hotel_owner)
 └── created_at

Hotel
 ├── id, owner_id (FK → User), name, business_name
 ├── email, phone, address, city, country, latitude, longitude
 ├── description, room_count, category
 ├── logo_path, cover_path, gallery_paths, license_path, id_doc_path
 ├── status (pending | approved | active | rejected | suspended)
 └── rejection_reason, created_at, updated_at

Room
 ├── id, hotel_id (FK → Hotel)
 ├── category, price, total_units
 ├── photos (JSON), amenities (JSON)
 └── availabilities → [Availability]

Booking
 ├── id, hotel_id, room_id, guest_name, guest_email, guest_phone
 ├── check_in, check_out, total_amount
 ├── status (pending | approved | rejected)
 └── created_at

Review
 ├── id, hotel_id, guest_name, guest_email
 ├── rating (1–5), comment, owner_reply
 └── created_at

Availability
 ├── id, room_id (FK → Room)
 ├── date, status (available | booked | hold)
 └── booking_id (FK → Booking)
```

---

## 🌍 Deployment

### Frontend — Vercel

1. Push code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Set build settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` → your Railway backend URL

### Backend — Railway

1. Create a new Railway project
2. Add a **Python** service from GitHub
3. Add a **PostgreSQL** database plugin
4. Set environment variables (see [Environment Variables](#environment-variables) above)
5. Add Cloudinary credentials for persistent file storage
6. Railway auto-deploys on every push to `main`

### File Storage — Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your **Cloud Name**, **API Key**, and **API Secret**
3. Add them as Railway environment variables

---

## 📁 Project Structure

```
hoteLManagementSystem/
├── backend/                    # Flask REST API
│   ├── app/
│   │   ├── __init__.py        # App factory, CORS, file serving
│   │   ├── config.py          # Dev / Prod / Test configs
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── utils.py           # Cloudinary upload, auth decorators
│   │   ├── auth/              # Login & JWT endpoints
│   │   ├── hotels/            # Hotel CRUD & registration
│   │   ├── admin/             # Admin approval endpoints
│   │   ├── bookings/          # Booking management
│   │   ├── reviews/           # Review endpoints
│   │   └── analytics/         # Revenue & booking analytics
│   ├── requirements.txt
│   └── wsgi.py
│
├── src/                        # React frontend
│   ├── components/
│   │   ├── Nav.jsx            # Landing page navigation
│   │   ├── Sidebar.jsx        # Owner/Admin sidebar
│   │   ├── ProtectedRoute.jsx # Role + status auth guard
│   │   ├── PublicNav.jsx      # Guest portal navigation
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.jsx    # JWT auth state + hotel cache
│   ├── pages/
│   │   ├── Landing.jsx        # Marketing landing page
│   │   ├── Register.jsx       # Hotel registration wizard
│   │   ├── Login.jsx          # Owner login portal
│   │   ├── AdminLogin.jsx     # Admin login portal
│   │   ├── Pending.jsx        # Post-registration status page
│   │   ├── OwnerDashboard.jsx # Main owner dashboard
│   │   ├── AdminDashboard.jsx # Main admin console
│   │   ├── owner/             # Owner sub-pages
│   │   │   ├── HotelProfile.jsx
│   │   │   ├── RoomsPricing.jsx
│   │   │   ├── BookingsCalendar.jsx
│   │   │   ├── Reviews.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── CleaningService.jsx
│   │   ├── admin/             # Admin sub-pages
│   │   │   ├── AllHotels.jsx
│   │   │   ├── CleaningTeams.jsx
│   │   │   ├── PlatformAnalytics.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Settings.jsx
│   │   └── public/            # Guest portal pages
│   │       ├── ExploreHotels.jsx
│   │       ├── HotelDetail.jsx
│   │       ├── BookingConfirmation.jsx
│   │       └── MyBookings.jsx
│   ├── config.js              # API base URL
│   └── index.css              # Full design system
│
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 👩‍💻 Developer

<img src="https://avatars.githubusercontent.com/amnashakeel487" width="100" style="border-radius: 50%;" alt="Amna Shakeel" />

### **Amna Shakeel**
*Software Engineer · AI Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-amnashakeel487-black?style=for-the-badge&logo=github)](https://github.com/amnashakeel487)

> *"Building intelligent systems that solve real-world problems — one commit at a time."*

---

*Built with ❤️ using React, Flask, PostgreSQL & Railway*

</div>