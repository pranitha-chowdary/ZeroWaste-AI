# Quick Start Guide - ZeroWaste AI

## 🚀 Getting Started in 5 Minutes

### Step 1: Clone and Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies (already done if you followed setup)
npm install

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

✅ Backend should now be running on `http://localhost:5001`

### Step 2: Setup Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend should now be running on `http://localhost:5173`

### Step 3: Test the Application

1. **Open browser**: Navigate to `http://localhost:5173`

2. **Explore Landing Page**: Click around to see the platform features

3. **Login as Different Users**:

#### As Admin:
- Go to login
- Email: `admin@zerowaste.com`
- Password: `admin123`
- Access: Admin panel with platform analytics

#### As Restaurant:
- Email: `restaurant@zerowaste.com`
- Password: `restaurant123`
- Access: Restaurant dashboard with menu, orders, inventory, predictions

#### As NGO:
- Email: `hope@zerowaste.com`
- Password: `ngo123`
- Access: NGO dashboard with available donations

#### As Customer:
- Email: `rahul@example.com`
- Password: `customer123`
- Access: Customer view to browse menu and place orders

---

## 📝 What's Already Set Up

After running `npm run seed`, your database includes:

### Users
- ✅ 1 Admin (admin@zerowaste.com)
- ✅ 3 Active Restaurants
- ✅ 1 Pending Restaurant (for testing approval)
- ✅ 3 Active NGOs
- ✅ 1 Pending NGO (for testing approval)
- ✅ 2 Sample Customers

### Data
- ✅ 6 Menu items for the main restaurant
- ✅ 6 Inventory items with different expiry statuses
- ✅ 2 Sample pre-orders
- ✅ 2 Available donations
- ✅ 1 Completed donation (in history)
- ✅ 7 Days of AI predictions

---

## 🎯 Testing Key Features

### 1. Test Restaurant Dashboard
**Login as**: restaurant@zerowaste.com

**Try these:**
- ✅ View pre-orders
- ✅ Check AI predictions
- ✅ Monitor inventory (notice items near expiry)
- ✅ Create a surplus donation
- ✅ View impact analytics

### 2. Test Customer Pre-Order
**Login as**: rahul@example.com (or create new customer)

**Try these:**
- ✅ Browse menu items
- ✅ Add items to cart
- ✅ Select pickup time
- ✅ Confirm order
- ✅ View order history

### 3. Test NGO Dashboard
**Login as**: hope@zerowaste.com

**Try these:**
- ✅ View available donations
- ✅ Accept a donation
- ✅ View donation history

### 4. Test Admin Panel
**Login as**: admin@zerowaste.com

**Try these:**
- ✅ View platform statistics
- ✅ See pending approvals
- ✅ Approve/reject restaurants and NGOs
- ✅ Monitor waste reduction metrics

---

## 🔧 API Testing with cURL

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Login and Get Token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zerowaste.com","password":"admin123"}'
```

### Get Menu Items
```bash
curl http://localhost:5001/api/menu
```

### Get Platform Stats (Admin only)
```bash
# First, login to get token
TOKEN="<your_token_here>"

curl http://localhost:5001/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check if port 5001 is available
- ✅ Verify MongoDB connection in `.env`
- ✅ Run `npm install` again

### Frontend won't start
- ✅ Check if port 5173 is available
- ✅ Run `npm install` again
- ✅ Clear node_modules and reinstall

### Database connection error
- ✅ Check internet connection
- ✅ Verify MongoDB URI in `.env`
- ✅ Ensure MongoDB Atlas cluster is running

### Can't login
- ✅ Make sure you ran `npm run seed`
- ✅ Check email/password combination
- ✅ Verify backend is running

---

## 📊 Understanding the Data Flow

1. **Customer Journey**:
   - Customer browses menu
   - Places pre-order with time slot
   - Restaurant receives order
   - Stock automatically decrements

2. **Restaurant Journey**:
   - Monitors inventory expiry
   - Checks AI predictions for demand
   - Optimizes production
   - Creates donation for surplus
   - NGO accepts donation

3. **Admin Journey**:
   - Reviews new restaurant/NGO applications
   - Approves or rejects
   - Monitors platform-wide metrics
   - Tracks environmental impact

---

## 🎨 UI Routes

- `/` - Landing page
- `/customer` - Customer menu and ordering
- `/restaurant` - Restaurant dashboard
- `/ngo` - NGO dashboard
- `/admin` - Admin panel

---

## 📱 Next Steps

1. **Explore all dashboards** with different user roles
2. **Create test orders** as a customer
3. **Manage inventory** as a restaurant
4. **Accept donations** as an NGO
5. **Review analytics** as an admin

---

## 💡 Tips

- The frontend currently uses mock data in some places
- To connect frontend to backend, you'll need to update API calls in frontend components
- JWT tokens expire in 30 days
- All passwords are hashed in the database
- Admin approval is required for new restaurants and NGOs

---

## 🔗 Useful Links

- Backend API: `http://localhost:5001/api`
- Frontend UI: `http://localhost:5173`
- API Documentation: See `backend/API_DOCUMENTATION.md`
- Backend README: See `backend/README.md`

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Backend shows "MongoDB Connected" and "Server running on port 5001"
- ✅ Frontend loads without errors
- ✅ You can login with provided credentials
- ✅ Dashboard shows data (menu items, orders, etc.)
- ✅ API calls return proper responses

---

**Happy Testing! 🎉**
