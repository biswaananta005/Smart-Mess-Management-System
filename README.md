# Smart Mess Management System (MERN Stack)

A complete full-stack **Smart Mess Management System** built using Node.js, Express.js, MongoDB (Mongoose), React.js (Vite), React Router v6, Axios, and Vanilla CSS. Designed with role-based access control (RBAC) for **Students**, **Mess Admins**, and **College Authorities**.

---

## 🌟 Key Features

### 🎓 Student Role
- **2-Way Authentication**: Log in seamlessly using either your **Email Address** (`student@mess.com`) or your **Student Roll Number ID** (`STU1001`).
- **Daily Mess Menu**: View daily breakfast, lunch, and dinner menus with timings.
- **Cumulative Preference Submission**: Select meal choices and submit to Mess Authority in a single action.
- **Submission Locking & 12 AM Midnight Reset**: Once submitted, choices are locked for kitchen preparation. Automatically unlocks after meals are served or resets at **12:00 AM midnight** for the new day.
- **Digital Mess Pass & QR Code**: Instant QR code generation for mess counter check-ins.
- **Meal Feedback**: Submit 1–5 star ratings and comments for served meals.
- **Personal Billing**: Real-time bill calculation based solely on consumed meals.

### 👨‍🍳 Mess Admin Role
- **Live Headcount Dashboard**: Real-time aggregate count of served vs opted-in meals to prevent food wastage.
- **Meal Counter Check-In**: Scan QR passes or enter student Roll Numbers (`STU1001`) to mark meals as served and prevent double-dipping.
- **Live Activity Feed**: Monitor recent check-ins in real time.
- **Weekly Menu Editor**: Form interface to update weekly menu schedules.

### 🏛️ College Authority Role (Supervisory)
- **Automated Monthly Billing Summary**: Read-only oversight table calculating student bills based solely on consumed meals (e.g. 50 meals × ₹50/meal = ₹2,500).
- **Food Wastage & Efficiency Analytics**: Monitor overall efficiency rates (%), unconsumed opted meals, and estimated cost savings.
- **Aggregated Ratings**: View meal feedback scores and student reviews.

---

## 💻 Tech Stack

- **Backend**: Node.js, Express.js, JWT Authentication, Mongoose ODM
- **Database**: MongoDB (with MongoMemoryServer fallback for instant testing)
- **Frontend**: React 18 (Vite), React Router v6, Axios, Lucide Icons, QRCode.react
- **Styling**: Vanilla CSS with custom properties (Design System) & 1:1 per-component `.css` stylesheets

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/smart-mess-management-system.git
cd "smart-mess-management-system"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_mess_db
JWT_SECRET=smart_mess_jwt_secret_key_2026_biswa_ananta
JWT_EXPIRE=30d
```

### 3. Run Development Servers

```bash
# Start Backend Server (Runs on port 5000)
cd backend
node server.js

# Start Frontend Dev Server (Runs on port 5173 / 5174)
cd ../frontend
npm run dev
```

---

## 🔑 Demo Account Credentials

| Role | Login Identifier (Email or Student ID) | Password |
| :--- | :--- | :--- |
| **Student** | `STU1001` or `student@mess.com` | `Password123` |
| **Mess Admin** | `admin@mess.com` | `Password123` |
| **College Authority** | `authority@mess.com` | `Password123` |

---

## 👨‍💻 Developer Credit

**Developed by Biswa Ananta**
