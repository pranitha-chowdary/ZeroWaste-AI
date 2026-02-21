# API Documentation - ZeroWaste AI Backend

Base URL: `http://localhost:5001/api`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer", // "customer", "restaurant", "ngo"
  "phone": "+91 1234567890",
  "location": "Mumbai, Maharashtra",
  // For restaurant role:
  "restaurantName": "My Restaurant",
  // For NGO role:
  "ngoName": "My NGO",
  "capacity": 50,
  "distance": "5 km"
}
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "status": "active",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "status": "active",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile
**GET** `/auth/profile` 🔒

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "status": "active",
  "createdAt": "2024-02-21T10:30:00.000Z"
}
```

---

## Menu Endpoints

### Get All Menu Items
**GET** `/menu`

**Response:**
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Veg Thali",
    "description": "Traditional Indian platter...",
    "price": 180,
    "image": "https://...",
    "stock": 12,
    "category": "Main Course",
    "restaurant": {
      "_id": "...",
      "restaurantName": "Spice Garden",
      "location": "Mumbai"
    },
    "isAvailable": true
  }
]
```

### Get Menu by Restaurant
**GET** `/menu/restaurant/:id`

### Create Menu Item
**POST** `/menu` 🔒 (Restaurant only)

**Body:**
```json
{
  "name": "Paneer Butter Masala",
  "description": "Rich and creamy cottage cheese curry",
  "price": 240,
  "image": "https://...",
  "stock": 15,
  "category": "Main Course"
}
```

### Update Menu Item
**PUT** `/menu/:id` 🔒 (Restaurant only)

### Delete Menu Item
**DELETE** `/menu/:id` 🔒 (Restaurant only)

---

## Order Endpoints

### Create Pre-Order
**POST** `/orders` 🔒

**Body:**
```json
{
  "restaurantId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "items": [
    {
      "menuItemId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quantity": 2
    }
  ],
  "pickupTime": "12:30 PM"
}
```

**Response:**
```json
{
  "_id": "...",
  "customer": {...},
  "customerName": "John Doe",
  "restaurant": {...},
  "items": [
    {
      "menuItem": {...},
      "dish": "Veg Thali",
      "quantity": 2,
      "price": 180
    }
  ],
  "totalAmount": 360,
  "pickupTime": "12:30 PM",
  "status": "Confirmed",
  "orderDate": "2024-02-21T10:30:00.000Z"
}
```

### Get Restaurant Orders
**GET** `/orders/restaurant` 🔒 (Restaurant only)

### Get Customer Orders
**GET** `/orders/customer` 🔒

### Get Order by ID
**GET** `/orders/:id` 🔒

### Update Order Status
**PUT** `/orders/:id/status` 🔒 (Restaurant only)

**Body:**
```json
{
  "status": "Preparing" // "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"
}
```

---

## Inventory Endpoints

### Get Inventory
**GET** `/inventory` 🔒 (Restaurant only)

**Response:**
```json
[
  {
    "_id": "...",
    "restaurant": "...",
    "ingredient": "Tomatoes",
    "quantity": "15 kg",
    "expiry": "5 days",
    "expiryDate": "2024-02-26T00:00:00.000Z",
    "status": "Good"
  }
]
```

### Add Inventory Item
**POST** `/inventory` 🔒 (Restaurant only)

**Body:**
```json
{
  "ingredient": "Tomatoes",
  "quantity": "15 kg",
  "expiry": "5 days",
  "expiryDate": "2024-02-26"
}
```

### Update Inventory Item
**PUT** `/inventory/:id` 🔒 (Restaurant only)

### Delete Inventory Item
**DELETE** `/inventory/:id` 🔒 (Restaurant only)

---

## Donation Endpoints

### Get Available Donations
**GET** `/donations` 🔒 (NGO only)

**Response:**
```json
[
  {
    "_id": "...",
    "restaurant": {
      "_id": "...",
      "restaurantName": "Spice Garden",
      "location": "Mumbai",
      "phone": "+91 1234567890"
    },
    "restaurantName": "Spice Garden",
    "meals": 5,
    "type": "Veg Meals",
    "expiry": "3 hours",
    "expiryTime": "2024-02-21T15:00:00.000Z",
    "status": "Available"
  }
]
```

### Get Restaurant Donations
**GET** `/donations/restaurant` 🔒 (Restaurant only)

### Get NGO Donations
**GET** `/donations/ngo` 🔒 (NGO only)

### Get Donation History
**GET** `/donations/history` 🔒

### Create Donation
**POST** `/donations` 🔒 (Restaurant only)

**Body:**
```json
{
  "meals": 5,
  "type": "Veg Meals",
  "expiry": "3 hours",
  "expiryTime": "2024-02-21T15:00:00.000Z"
}
```

### Accept Donation
**PUT** `/donations/:id/accept` 🔒 (NGO only)

### Mark Donation as Delivered
**PUT** `/donations/:id/deliver` 🔒 (Restaurant only)

---

## Prediction Endpoints

### Get Demand Predictions
**GET** `/predictions/demand` 🔒 (Restaurant only)

**Response:**
```json
[
  {
    "date": "2024-02-21T00:00:00.000Z",
    "dayOfWeek": "Wed",
    "historical": 125,
    "predicted": 122
  }
]
```

### Get Production Recommendations
**GET** `/predictions/production` 🔒 (Restaurant only)

**Response:**
```json
[
  {
    "dish": "Veg Thali",
    "recommended": 45,
    "actual": 0
  }
]
```

### Create Prediction
**POST** `/predictions` 🔒 (Restaurant only)

**Body:**
```json
{
  "date": "2024-02-21",
  "dayOfWeek": "Wed",
  "historical": 125,
  "predicted": 122,
  "dishPredictions": [
    {
      "dish": "Veg Thali",
      "recommended": 45,
      "actual": 50
    }
  ]
}
```

### Update Actual Production
**PUT** `/predictions/:id/actual` 🔒 (Restaurant only)

**Body:**
```json
{
  "actual": 120,
  "dishPredictions": [
    {
      "dish": "Veg Thali",
      "recommended": 45,
      "actual": 50
    }
  ]
}
```

---

## Admin Endpoints

### Get All Restaurants
**GET** `/admin/restaurants` 🔒 (Admin only)

### Get All NGOs
**GET** `/admin/ngos` 🔒 (Admin only)

### Get Pending Approvals
**GET** `/admin/approvals` 🔒 (Admin only)

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Fresh Bites Owner",
    "email": "freshbites@zerowaste.com",
    "role": "restaurant",
    "restaurantName": "Fresh Bites",
    "location": "Hyderabad, Telangana",
    "status": "pending",
    "createdAt": "2024-02-18T10:00:00.000Z"
  }
]
```

### Approve/Reject User
**PUT** `/admin/approvals/:id` 🔒 (Admin only)

**Body:**
```json
{
  "status": "active" // or "rejected"
}
```

### Get Platform Statistics
**GET** `/admin/stats` 🔒 (Admin only)

**Response:**
```json
{
  "totalRestaurants": 24,
  "totalNGOs": 12,
  "totalMealsDonated": 3420,
  "avgWasteReduction": 18,
  "totalOrders": 856,
  "co2Saved": "2.4T",
  "wasteReductionByRestaurant": [
    {
      "name": "Spice Garden",
      "reduction": 24
    }
  ]
}
```

### Get All Users
**GET** `/admin/users` 🔒 (Admin only)

---

## NGO Endpoints

### Get All Active NGOs
**GET** `/ngos`

**Response:**
```json
[
  {
    "_id": "...",
    "ngoName": "Hope Shelter",
    "location": "Mumbai, Maharashtra",
    "phone": "+91 98765 43210",
    "capacity": 50,
    "distance": "3 km"
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized as admin"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with cURL

### Login as Admin
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zerowaste.com","password":"admin123"}'
```

### Get Menu Items
```bash
curl http://localhost:5001/api/menu
```

### Create Pre-Order (with token)
```bash
curl -X POST http://localhost:5001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "restaurantId": "RESTAURANT_ID",
    "items": [{"menuItemId": "MENU_ITEM_ID", "quantity": 2}],
    "pickupTime": "12:30 PM"
  }'
```
