# ZeroWaste AI Platform

An AI-powered zero food waste platform that helps restaurants optimize inventory, reduce waste, and donate surplus food to NGOs.

## Project Structure

```
ZeroWaste-AI/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── mockData/
│   └── package.json
├── backend/           # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Features

### For Restaurants
- 📊 Dashboard with real-time analytics
- 🤖 AI-powered demand predictions
- 📋 Pre-order management system
- 📦 Inventory tracking with expiry alerts
- ❤️ Surplus food donation to NGOs
- 📈 Waste reduction tracking

### For Customers
- 🍽️ Browse restaurant menus
- ⏰ Pre-order meals with time slots
- 🌱 Support sustainable practices

### For NGOs
- 🎁 Access available food donations
- 📍 Location-based matching
- 📊 Track donation history
- 👥 Manage beneficiaries

### For Admins
- 🏢 Platform-wide analytics
- ✅ Approve/reject restaurant and NGO registrations
- 📊 Monitor impact metrics
- 🗺️ Platform coverage insights

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Recharts for data visualization
- Lucide React for icons
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- CORS enabled
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
   - MongoDB connection string included
   - JWT secret configured
   - Port set to 5001

4. Seed the database with initial data:
```bash
npm run seed
```

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

## Default Login Credentials

After seeding the database, you can use these credentials:

**Admin:**
- Email: `admin@zerowaste.com`
- Password: `admin123`

**Restaurant:**
- Email: `restaurant@zerowaste.com`
- Password: `restaurant123`

**NGO:**
- Email: `hope@zerowaste.com`
- Password: `ngo123`

**Customer:**
- Email: `rahul@example.com`
- Password: `customer123`

## API Documentation

Full API documentation is available in [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

Base URL: `http://localhost:5001/api`

### Main Endpoints
- `/api/auth` - Authentication
- `/api/menu` - Menu management
- `/api/orders` - Order management
- `/api/inventory` - Inventory tracking
- `/api/donations` - Donation management
- `/api/predictions` - AI predictions
- `/api/admin` - Admin panel
- `/api/ngos` - NGO listings

## Database Schema

### Collections
- **users** - All users (admin, restaurant, ngo, customer)
- **menuitems** - Restaurant menu items
- **preorders** - Customer pre-orders
- **inventory** - Restaurant inventory
- **donations** - Food donations
- **predictions** - AI demand predictions

## User Roles & Permissions

### Admin
- Single admin account (already created)
- Approve/reject restaurant and NGO registrations
- View platform-wide analytics
- Manage all users

### Restaurant
- Requires admin approval
- Manage menu items
- Track inventory
- View pre-orders
- Create donations
- Access AI predictions

### NGO
- Requires admin approval
- View available donations
- Accept donations
- Track donation history

### Customer
- Auto-approved on registration
- Browse menus
- Place pre-orders
- View order history

## Key Features Implementation

### AI Predictions
- Historical demand tracking
- Day-wise prediction models
- Dish-level production recommendations
- Actual vs. predicted comparison

### Waste Reduction
- Expiry tracking in inventory
- Smart production recommendations
- Surplus food donation system
- Impact metrics (CO2 saved, meals donated)

### Pre-Order System
- Reduces food waste by planning ahead
- Time-slot based ordering
- Stock management
- Real-time order status updates

## Development

### Backend Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with initial data
```

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Production Deployment

### Backend Deployment
1. Set environment variables on hosting platform
2. Run `npm install --production`
3. Run `npm start`

### Frontend Deployment
1. Update API base URL in frontend code
2. Run `npm run build`
3. Deploy `dist` folder to hosting platform

## Environment Variables

### Backend (.env)
```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Protected API routes
- Input validation
- CORS configuration

## Contributing
This is a student project for ZeroWaste AI platform demonstration.

## License
ISC

## Support
For issues or questions, please contact the development team.

---

**Note**: The MongoDB credentials are included in the repository for demonstration purposes. In production, use environment variables and never commit sensitive credentials.