# ZeroWaste AI - Backend

Backend API for the ZeroWaste AI Platform built with MERN stack.

## Features

- User authentication with JWT
- Role-based access control (Admin, Restaurant, NGO, Customer)
- Menu management
- Pre-order system
- Inventory tracking
- AI-powered predictions
- Donation management
- Admin panel

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Environment variables are already configured in `.env` file

3. Seed the database with initial data:
```bash
npm run seed
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (Protected)

### Menu
- GET `/api/menu` - Get all menu items
- GET `/api/menu/restaurant/:id` - Get menu by restaurant
- POST `/api/menu` - Create menu item (Restaurant)
- PUT `/api/menu/:id` - Update menu item (Restaurant)
- DELETE `/api/menu/:id` - Delete menu item (Restaurant)

### Orders
- POST `/api/orders` - Create pre-order (Customer)
- GET `/api/orders/restaurant` - Get restaurant orders (Restaurant)
- GET `/api/orders/customer` - Get customer orders (Customer)
- GET `/api/orders/:id` - Get order by ID
- PUT `/api/orders/:id/status` - Update order status (Restaurant)

### Inventory
- GET `/api/inventory` - Get inventory (Restaurant)
- POST `/api/inventory` - Add inventory item (Restaurant)
- PUT `/api/inventory/:id` - Update inventory item (Restaurant)
- DELETE `/api/inventory/:id` - Delete inventory item (Restaurant)

### Donations
- GET `/api/donations` - Get available donations (NGO)
- GET `/api/donations/restaurant` - Get restaurant donations (Restaurant)
- GET `/api/donations/ngo` - Get NGO donations (NGO)
- GET `/api/donations/history` - Get donation history
- POST `/api/donations` - Create donation (Restaurant)
- PUT `/api/donations/:id/accept` - Accept donation (NGO)
- PUT `/api/donations/:id/deliver` - Mark as delivered (Restaurant)

### Predictions
- GET `/api/predictions/demand` - Get demand predictions (Restaurant)
- GET `/api/predictions/production` - Get production recommendations (Restaurant)
- POST `/api/predictions` - Create prediction (Restaurant)
- PUT `/api/predictions/:id/actual` - Update actual production (Restaurant)

### Admin
- GET `/api/admin/restaurants` - Get all restaurants (Admin)
- GET `/api/admin/ngos` - Get all NGOs (Admin)
- GET `/api/admin/approvals` - Get pending approvals (Admin)
- PUT `/api/admin/approvals/:id` - Approve/reject user (Admin)
- GET `/api/admin/stats` - Get platform statistics (Admin)
- GET `/api/admin/users` - Get all users (Admin)

### NGOs
- GET `/api/ngos` - Get all active NGOs (Public)

## Default Login Credentials

After seeding, use these credentials:

**Admin:**
- Email: admin@zerowaste.com
- Password: admin123

**Restaurant:**
- Email: restaurant@zerowaste.com
- Password: restaurant123

**NGO:**
- Email: hope@zerowaste.com
- Password: ngo123

**Customer:**
- Email: rahul@example.com
- Password: customer123

## Database Schema

- **User** - Stores all users (Admin, Restaurant, NGO, Customer)
- **MenuItem** - Restaurant menu items
- **PreOrder** - Customer pre-orders
- **Inventory** - Restaurant inventory tracking
- **Donation** - Food donations from restaurants to NGOs
- **Prediction** - AI predictions for demand forecasting

## Notes

- Only one admin account exists in the system
- Restaurant and NGO accounts require admin approval before activation
- Customer accounts are automatically activated
- All protected routes require JWT token in Authorization header
