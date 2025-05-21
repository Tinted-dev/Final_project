# Final_project
♻️ Garbage Collection Portal
📑 Table of Contents
📘 Project Overview

✨ Features

🛠️ Technologies Used

🚀 Getting Started

📋 Prerequisites

📂 Cloning the Repository

🔧 Backend Setup (Flask API)

🎨 Frontend Setup (React Application)

🧪 Usage

⚙️ Initial Setup for Testing

🌐 Accessing the Application

🧭 Key User Flows

🧬 Database Schema Overview

📡 API Endpoints Overview

🌍 Deployment

✅ Testing

🚧 Future Enhancements

📄 License

📬 Contact

1. 📘 Project Overview
The Garbage Collection Portal is a full-stack web application designed to streamline the process of finding, managing, and interacting with garbage collection services. It serves as a digital bridge between communities and waste service providers.

🎯 Key Objectives
Users: Easily discover and filter garbage collection companies by region and services.

Companies: Register and manage profiles to reach a broader customer base.

Admins: Manage company approvals, services, regions, and user accounts.

2. ✨ Features
🌍 Public & General Users (No Login)
🗃️ Browse all registered companies

📍 Filter companies by region

🔍 View detailed company profiles

🔐 User Authentication & Role-Based Access (RBAC)
🔑 JWT-based secure login/logout

🧑‍💼 Roles: admin, company_owner, collector (future), user (future)

🚫 Protected routes

👤 Manage personal profile

🏢 Company Registration & Approval Workflow
📝 Register companies via /register-company

⏳ Pending approval by admin

🧾 Company owners can update info post-approval

✅ Admin approves/denies companies

🛠️ Admin Dashboard
🧾 Company CRUD

♻️ Service CRUD

🗺️ Region CRUD

👥 User management (future)

📊 Company Owner Dashboard
🔍 View company profile

✏️ Edit company info (only if approved)

3. 🛠️ Technologies Used
🔙 Backend (Flask API)
Python 3.x

Flask, Flask-JWT-Extended, Flask-Migrate

SQLAlchemy, psycopg2-binary

Flask-CORS, python-dotenv

PostgreSQL

Gunicorn (for deployment)

🎨 Frontend (React)
React.js + React Router DOM

Axios

Tailwind CSS

Font Awesome

React useContext for state management

4. 🚀 Getting Started
4.1 📋 Prerequisites
Ensure you have the following installed:

Python 3.8+

Node.js (LTS)

npm or Yarn

Git

PostgreSQL

4.2 📂 Cloning the Repository
bash
Copy
Edit
git clone <repository-url>
cd garbage-collection-portal
4.3 🔧 Backend Setup (Flask API)
bash
Copy
Edit
cd backend
python -m venv venv
Activate virtual environment:

macOS/Linux:

bash
Copy
Edit
source venv/bin/activate
Windows (CMD):

cmd
Copy
Edit
venv\Scripts\activate.bat
Windows (PowerShell):

powershell
Copy
Edit
.\venv\Scripts\Activate.ps1
Install dependencies:

bash
Copy
Edit
pip install -r requirements.txt
Create .env file:

env
Copy
Edit
DATABASE_URL="postgresql://user:password@localhost:5000/db_name"
JWT_SECRET_KEY="your_jwt_secret"
FLASK_APP=app.py
FLASK_ENV=development
CORS_ORIGIN="http://localhost:5173"
Initialize database:

bash
Copy
Edit
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
(Optional) Seed initial data:

bash
Copy
Edit
python seed.py
Run Flask server:

bash
Copy
Edit
flask run
4.4 🎨 Frontend Setup (React Application)
bash
Copy
Edit
cd ../frontend
npm install     # or yarn install
npm start       # or yarn start
5. 🧪 Usage
5.1 ⚙️ Initial Setup for Testing
Seed data with python seed.py

Use default admin credentials:

Username: admin

Password: admin123

Register a company via /register-company

Approve it via /admin-dashboard

5.2 🌐 Accessing the Application
Open your browser at http://localhost:5173

5.3 🧭 Key User Flows
👤 Public User
Browse and filter companies

View detailed profiles

🏢 Company Owner
Register & log in

View/edit company profile (post-approval)

🛡️ Admin
Approve/Deny companies

Manage services and regions

Add companies manually

Edit own profile

6. 🧬 Database Schema Overview
📄 User
id, username, email, password_hash, role, company_id

🏢 Company
id, name, email, phone, description, status, region_id

Many-to-Many: Services

♻️ Service
id, name, description

Many-to-Many: Companies

🗺️ Region
id, name, description

📍 Location
id, name, address, region_id

7. 📡 API Endpoints Overview
All prefixed with /api, using Bearer <JWT> for auth.

🔐 Authentication
POST /api/auth/login

POST /api/auth/register-company

👤 Users
GET/PUT /api/users/me

GET/PUT/DELETE /api/users/<id> (Admin only)

🏢 Companies
GET /api/companies

POST/PUT/DELETE /api/companies/<id> (Admin only)

GET /api/companies/my-company (Company Owner)

PUT /api/companies/<id>/status (Admin only)

♻️ Services
GET /api/services

POST/PUT/DELETE /api/services/<id> (Admin only)

🗺️ Regions
GET /api/regions

POST/PUT/DELETE /api/regions/<id> (Admin only)

8. 🌍 Deployment
Deployed via Render:

🧩 Backend
Web Service

Uses gunicorn

Post-deploy: flask db upgrade

🌐 Frontend
Static Site

npm run build generates assets

Uses REACT_APP_API_BASE_URL

🛢️ Database
Managed PostgreSQL instance (e.g., Render DB)

9. ✅ Testing
A full test checklist is included in the project to verify:

Public routes

Authentication

Company registration/approval

Admin CRUD operations

Refer to Web Application Testing Checklist for details.

10. 🚧 Future Enhancements
🔎 Advanced search & filtering

📥 Service requests by users

⭐ Company ratings/reviews

🔔 Email/in-app notifications

🚛 Collector features

👤 Full user management for admins

11. 📄 License
Licensed under the MIT License.

12. 📬 Contact
Developer: TintedDev

Email: mumbidenis@gmail.com

GitHub: TintedDev

