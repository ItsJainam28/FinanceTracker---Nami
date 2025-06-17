
# Finance Tracker

A modern, full-stack personal finance web application built with the **MERN stack** (MongoDB, Express, React + Vite, Node.js) to help users manage their finances effectively. Create monthly budgets, track one-off and recurring expenses, visualize spending trends, and receive actionable analytics to stay on top of your financial goals.

Styled with **Tailwind CSS** and **shadcn/ui** components, the app offers a responsive, intuitive interface with powerful features for budgeting and expense tracking.

---

# Live App now Available to use!

https://finance-tracker-frontend-topaz.vercel.app/login

## ✨ Features

| **Area**               | **Capabilities**                                                                 |
|------------------------|----------------------------------------------------------------------------------|
| **Authentication**     | Secure JWT-based signup/login, protected API endpoints                           |
| **Budgets**            | Create single- or multi-category monthly budgets, track % used, auto-rollover    |
| **Expenses**           | CRUD operations, categorize expenses, auto-match to budgets                     |
| **Scheduled Expenses** | Automate recurring expenses with cron-based generation                           |
| **AI Assistant (Nami)** | 	Ask natural language questions to get spending breakdowns, summaries, and tips|
| **Analytics Dashboard**| Visualize spending with daily spend lines, category pies, budget vs. spent bars, and upcoming bills |
| **Responsive UI**      | Modern design with cards, tabs, dialogs, and charts (Chart.js + Recharts)        |
| **API-First Design**   | Clean REST endpoints, modular controllers, middleware, and input validation      |

---

## 🗂️ Repository Structure

```
finance-tracker/
├── backend/                  # Express API
│   ├── ai-agent/          # Ai Agent
│   ├── api/          # Cron Jobs
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Authentication & validation
│   ├── utils/                # Helper functions
│   ├── config/               # Database & environment config
│   └── index.js             # Entry point
├── frontend/                 # Vite + React + TypeScript
│   ├── src/
│   │   ├── api/axiosInstance.ts  # Axios setup
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   └── main.tsx          # App entry point
│   └── index.html            # HTML template
├── .env.example              # Environment variable template
└── README.md                 # Project documentation
```

---

## ⚙️ Tech Stack

- **Backend**: Node.js 18+, Express 5, Mongoose 7, JSON Web Tokens, node-cron, Langchain 
- **Frontend**: Vite, React 18 (TypeScript), Tailwind CSS, shadcn/ui, Radix UI, Chart.js, Recharts, Axios
- **Database**: MongoDB 6 (Atlas or local)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/<your-user>/finance-tracker.git
cd finance-tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:
```
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=development
```
The frontend infers the API base URL from `vite.config.ts`, so no `.env` is required.

### 3. Run the Application
| **Location** | **Script**         | **Purpose**                       |
|--------------|--------------------|-----------------------------------|
| `backend`    | `npm run dev`      | Start server with live reload     |
| `backend`    | `npm start`        | Start server (production)         |
| `frontend`   | `npm run dev`      | Start Vite dev server             |
| `frontend`   | `npm run build`    | Build static assets               |
| `frontend`   | `npm run preview`  | Preview built site                |

Run both `backend` and `frontend` dev scripts in separate terminals to launch the app.

---

## 📡 API Overview

| **Method** | **Endpoint**                          | **Description**                          |
|------------|---------------------------------------|------------------------------------------|
| **Auth**   |                                       |                                          |
| `POST`     | `/api/auth/signup`                    | Create user & issue JWT                  |
| `POST`     | `/api/auth/login`                     | Login & issue JWT                        |
| **Budgets**|                                       |                                          |
| `GET`      | `/api/budgets`                        | List budgets (current year)              |
| `POST`     | `/api/budgets`                        | Create a budget                          |
| `PATCH`    | `/api/budgets/:id`                    | Update a budget                          |
| `GET`      | `/api/budgets/:id/month-summary`      | Monthly budget analytics                 |
| **Expenses**|                                      |                                          |
| `GET`      | `/api/expenses`                       | List expenses                            |
| `POST`     | `/api/expenses`                       | Add an expense                           |
| `PATCH`    | `/api/expenses/:id`                   | Edit an expense                          |
| `DELETE`   | `/api/expenses/:id`                   | Delete an expense                        |
| **Scheduled Expenses** |                           |                                          |
| `POST`     | `/api/recurring-expenses`             | Create a scheduled expense               |
| `GET`      | `/api/recurring-expenses`             | List scheduled expenses                  |
| **Analytics** |                                    |                                          |
| `GET`      | `/api/analytics/summary`              | Aggregate data for dashboard             |

---

## 🛠️ Development Notes
- **Backend**: Uses Express with Mongoose for MongoDB interactions. Middleware handles authentication and input validation. `node-cron` automates recurring expense generation.
- **Frontend**: Built with Vite for fast development and React with TypeScript for type safety. Tailwind CSS and shadcn/ui ensure a polished, responsive UI.
- **Charts**: Leverages Chart.js and Recharts for interactive visualizations.
- **API Client**: Axios is configured in `axiosInstance.ts` for consistent API calls.


---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for bug fixes, features, or improvements.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## 📬 Contact
For questions or feedback, open an issue or reach out to the project maintainer at `jainampatel68@gmail.con`.

