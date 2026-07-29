<div align="center">
  <img src="frontend/assets/images/Task.ico" alt="ToDo Hub" width="64" height="64">
  <h1>ToDo Hub</h1>
  <p>A modern, full-stack task management application with GraphQL, PostgreSQL, and JWT authentication.</p>

  <p>
    <img src="https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white" alt="GraphQL">
    <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" alt="Express">
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma">
    <img src="https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white" alt="Bootstrap">
    <img src="https://img.shields.io/badge/Argon2-1C1C1C?logo=asciidoctor&logoColor=white" alt="Argon2">
  </p>
</div>

---

## 📋 Overview

**ToDo Hub** is a full-stack task management app that lets you organize your weekly tasks by day. It features a sleek dark-themed UI, secure JWT-based authentication with httpOnly cookies, and a GraphQL API for all CRUD operations.

---

## ✨ Features

- **🔐 Secure Authentication** — Register, login, and logout with JWT tokens stored in httpOnly cookies
- **📝 Task Management** — Create, read, edit, and delete tasks
- **📅 Day-based Organization** — Tasks grouped by day of the week (Sunday–Saturday), starting from today
- **✅ Task Completion** — Toggle tasks as completed with optimistic UI updates
- **⚡ Optimistic Updates** — UI updates instantly; server syncs in the background with automatic rollback on error
- **🎨 Dark Theme** — Modern glassmorphism UI with particle animations
- **📱 Responsive Design** — Works on desktop and mobile
- **🚦 Rate Limiting** — Protects the API from abuse

---

## 🛠️ Tech Stack

| Layer      | Technologies                                                                 |
|------------|------------------------------------------------------------------------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5.3                            |
| **Backend**  | Node.js, Express 5, GraphQL (graphql-http, Ruru IDE)                       |
| **Database** | PostgreSQL with Prisma ORM                                                  |
| **Auth**     | JWT (jsonwebtoken), Argon2 password hashing, httpOnly cookies               |
| **Security** | Rate limiting (express-rate-limit), Helmet (available)                      |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) database (local or cloud, e.g. [Neon](https://neon.tech/), [Supabase](https://supabase.com/))
- npm or yarn

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/todo-hub.git
cd todo-hub
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Set up environment variables**

Create a `.env` file in the `backend/` directory (use `.env.example` as a template):

```env
DATABASE_URL="postgresql://user:password@host:5432/todohub?schema=public"
JWT_SECRET="your-super-secret-key-change-this"
JWT_EXPIRES_IN="1d"
```

**4. Run database migrations**

```bash
npx prisma generate
npx prisma migrate dev
```

**5. Start the server**

```bash
npm start
```

The server will start at **http://localhost:4000**.

---

## 📖 Usage

| Page             | URL                              | Description                      |
|------------------|----------------------------------|----------------------------------|
| Landing Page     | `http://localhost:4000/`         | Hero section with app overview   |
| Register         | `http://localhost:4000/pages/register.html` | Create a new account    |
| Login            | `http://localhost:4000/pages/login.html`     | Log in to your account |
| Dashboard        | `http://localhost:4000/pages/dashboard.html` | Manage your tasks (requires auth) |
| GraphQL IDE      | `http://localhost:4000/graphql-ide`          | Explore the API with Ruru |

---

## 📡 GraphQL API

### Queries

```graphql
# Get the authenticated user
query {
  getUser {
    username
    email
  }
}

# Get all tasks for the authenticated user
query {
  getAllTasks {
    id
    name
    description
    day
    isCompleted
  }
}
```

### Mutations

```graphql
# Register a new user
mutation {
  register(name: "John", email: "john@gmail.com", password: "secret123") {
    user { username email }
  }
}

# Log in
mutation {
  login(email: "john@gmail.com", password: "secret123") {
    user { username email }
  }
}

# Log out
mutation { logout }

# Create a task
mutation {
  createTask(name: "Design homepage", description: "Create wireframes", day: Monday) {
    id name description day isCompleted
  }
}

# Toggle task completion
mutation {
  updateTaskChecked(id: 1, isCompleted: true) {
    id isCompleted
  }
}

# Edit a task
mutation {
  editTask(id: 1, name: "Updated name", description: "Updated desc", day: Friday) {
    id name description day
  }
}

# Delete a task
mutation {
  deleteTask(id: 1)
}
```

### Available Days (Enum)

```
Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
```

---

## 📁 Project Structure

```
todo-hub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Auto-generated migrations
│   ├── src/
│   │   ├── index.js               # Express server entry point
│   │   ├── graphql/
│   │   │   ├── schema.js          # GraphQL type definitions
│   │   │   └── resolvers/
│   │   │       ├── root.js        # Combines all resolvers
│   │   │       ├── authResolvers.js     # Login, register, logout
│   │   │       ├── taskResolvers.js     # CRUD for tasks
│   │   │       └── userResolvers.js     # Get user profile
│   │   ├── lib/
│   │   │   └── prisma.ts          # Prisma client setup
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js  # JWT verification middleware
│   │   └── utils/
│   │       └── generateToken.js   # JWT token generation
│   └── package.json
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── index.css          # Global styles, hero section
│   │   │   ├── auth.css           # Login & register styles
│   │   │   └── dashboard.css      # Dashboard styles
│   │   ├── js/
│   │   │   ├── index.js           # Hero particles & counters
│   │   │   ├── login.js           # Login form handler
│   │   │   ├── register.js        # Register form handler
│   │   │   └── dashboard.js       # Task board, modals, optimistic updates
│   │   └── images/
│   │       └── Task.ico           # Favicon
│   └── pages/
│       ├── index.html             # Landing page
│       ├── login.html             # Login page
│       ├── register.html          # Register page
│       └── dashboard.html         # Dashboard (protected)
├── .gitignore
└── README.md
```

---

## 🔐 Security

- **Passwords** are hashed with **Argon2** (the most secure hashing algorithm available)
- **JWT tokens** are stored in **httpOnly cookies** — inaccessible to JavaScript (prevents XSS attacks)
- **SameSite: Strict** — prevents CSRF attacks
- **Rate limiting** — 100 requests per 15 minutes per IP on the GraphQL endpoint
- **Generic error messages** — auth failures don't reveal whether the email or password was wrong

---

## 🚧 Future Improvements

- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] Task search and filtering
- [ ] Drag-and-drop task reordering
- [ ] Subtasks / checklist support
- [ ] Dark/Light theme toggle
- [ ] Unit and integration tests (Jest)
- [ ] Docker setup for easy deployment

---

## 📄 License

This project is for educational purposes.

---

<div align="center">
  <p>Built by <strong>Yamen Sabbah</strong></p>
  <p>
    <a href="https://www.linkedin.com/in/yamen-sabbah/">LinkedIn</a> •
    <a href="https://www.facebook.com/yamen.sabbah.39/">Facebook</a>
  </p>`
</div>
