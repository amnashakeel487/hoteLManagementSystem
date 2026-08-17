# Hotel Management System

A full-stack hotel owner registration and approval workflow platform built with React (Vite) frontend and Flask backend.

## 🏗️ Architecture

**Frontend (React + Vite)**
- Modern React with hooks and context
- React Router for navigation  
- JWT-based authentication
- Responsive design with custom CSS

**Backend (Flask)**
- Flask + Flask-RESTful API
- SQLAlchemy + PostgreSQL/SQLite
- JWT authentication with Flask-JWT-Extended
- File upload handling
- Email notifications
- Role-based access control

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Run the automated setup script**
   ```bash
   python setup.py
   ```
   
   This will:
   - Create virtual environment
   - Install dependencies
   - Setup .env file with random secrets
   - Initialize database
   - Seed with sample data

3. **Start the Flask server**
   ```bash
   # Activate virtual environment (if not already active)
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   
   # Start server
   python app.py
   ```

   API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root and install dependencies**
   ```bash
   npm install
   ```

2. **Start the Vite development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## 👥 Test Accounts

The setup script creates these test accounts:

- **Admin**: `admin@stayfolio.com` / `admin123`
- **Hotel Owner**: `owner@marlowhotel.com` / `owner123`  
- **Customer**: `customer@example.com` / `customer123`

## 📱 Features

### Hotel Owner Registration
- Multi-step registration form
- File uploads (business license, ID, logo, cover image)
- Location selection with coordinates
- Real-time form validation

### Admin Approval Workflow  
- Review pending applications
- Approve/reject with reasons
- Email notifications
- Hotel status management (approved/rejected/suspended)

### Hotel Owner Dashboard
- Hotel profile management
- Room category creation and pricing
- Booking request management
- Revenue analytics
- Gallery image uploads
- Cleaning service requests

### Admin Dashboard
- Hotel application review queues
- Platform-wide statistics
- User management
- Bulk operations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/refresh` - Refresh access token

### Hotel Management
- `POST /api/hotels/register` - Public hotel registration
- `GET /api/hotels/:id` - Get hotel details
- `PATCH /api/hotels/:id` - Update hotel
- `POST /api/hotels/:id/gallery` - Upload gallery images

### Admin Operations  
- `GET /api/admin/hotels?status=pending` - Get hotels by status
- `POST /api/admin/hotels/:id/approve` - Approve hotel
- `POST /api/admin/hotels/:id/reject` - Reject hotel
- `POST /api/admin/hotels/:id/suspend` - Suspend hotel

### Bookings & Reviews
- `GET /api/hotels/:id/bookings` - Get hotel bookings
- `PATCH /api/bookings/:id` - Update booking status
- `GET /api/hotels/:id/reviews` - Get hotel reviews
- `POST /api/reviews/:id/reply` - Reply to review

## 🗄️ Database Schema

### Core Models
- **User**: Authentication and role management
- **Hotel**: Hotel information and status
- **Room**: Room categories and pricing
- **Booking**: Reservation management
- **Review**: Guest reviews and ratings
- **CleaningRequest**: Cleaning service requests
- **Availability**: Room availability calendar

### Key Relationships
- User → Hotel (one-to-many, owner relationship)
- Hotel → Room (one-to-many)
- Room → Booking (one-to-many)
- Hotel → Review (one-to-many)

## 🔒 Security Features

- **Authentication**: JWT tokens with access/refresh pattern
- **Authorization**: Role-based access control (admin/hotel_owner/customer)
- **Data Protection**: Password hashing with Werkzeug
- **File Security**: File type validation and secure uploads
- **Rate Limiting**: Login and registration rate limiting
- **Input Validation**: Server-side validation for all endpoints

## 🎨 Frontend Structure

```
src/
├── components/
│   ├── Nav.jsx
│   ├── Footer.jsx
│   ├── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Register.jsx
│   ├── Login.jsx
│   ├── OwnerDashboard.jsx
│   └── AdminDashboard.jsx
└── App.jsx
```

## 🔧 Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   ├── utils.py
│   ├── auth/
│   ├── hotels/
│   ├── admin/
│   ├── bookings/
│   ├── reviews/
│   ├── analytics/
│   └── services/
├── app.py
├── requirements.txt
└── seed_data.py
```

## 🌍 Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Flask Configuration
FLASK_CONFIG=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Database  
DATABASE_URL=sqlite:///hotel_platform.db

# Email (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## 📧 Email Integration

The system sends automated emails for:
- Hotel approval notifications
- Rejection reasons
- Owner account creation
- Cleaning request confirmations

Configure email settings in `.env` to enable notifications.

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Railway/Heroku)
- Set environment variables
- Configure PostgreSQL database
- Deploy from Git repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

**Backend Issues:**
- Ensure Python 3.8+ is installed
- Check virtual environment activation
- Verify all dependencies are installed
- Check database connectivity

**Frontend Issues:**
- Ensure Node.js 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

**API Connection:**
- Verify backend is running on port 5000
- Check CORS configuration
- Verify JWT tokens are being sent correctly

For more help, check the GitHub issues or create a new issue.