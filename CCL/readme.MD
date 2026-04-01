# Project Setup

## 1. Clone the Repository
```bash
git clone https://github.com/Kuruin/college-stuff
cd college-stuff
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Run the Project
```bash
npm run dev
```

## Access the app
```
http://localhost:3000
```

---

# 📁 API Routes Documentation

## 🧭 Frontend Routes (React)

Defined in: `client/src/App.tsx`

| Route         | Description |
|--------------|------------|
| `/auth`      | Authentication page (Login/Register, redirects if already logged in) |
| `/`          | Events list page (Public, layout handles authentication state) |
| `/events/:id`| Event details page |
| `/admin`     | Admin dashboard (Secured area) |
| `*`          | 404 Not Found page |

---

## 🔌 Backend API Routes (Express)

Defined in:
- `shared/routes.ts`
- Managed in `server/routes.ts`

---

### 🔐 Authentication (`/api`)

| Method | Endpoint        | Description |
|--------|----------------|------------|
| POST   | `/api/register`| Register a new user |
| POST   | `/api/login`   | Authenticate and log in a user |
| POST   | `/api/logout`  | Log out the current user |
| GET    | `/api/user`    | Get the currently authenticated user's profile |

---

### 🛠 Admin Operations (`/api/admin`)

| Method | Endpoint                         | Description |
|--------|---------------------------------|------------|
| GET    | `/api/admin/users`              | List all users (Requires Admin) |
| PATCH  | `/api/admin/users/:id/approve`  | Approve a pending user account (Requires Admin) |
| PATCH  | `/api/admin/users/:id/role`     | Update a user's role (Requires Super Admin) |
| DELETE | `/api/admin/users/:id`          | Delete a user (Requires Admin) |

---

### 📅 Events (`/api/events`)

| Method | Endpoint              | Description |
|--------|----------------------|------------|
| GET    | `/api/events`        | List all events (Requires Auth) |
| POST   | `/api/events`        | Create a new event (Requires Admin) |
| GET    | `/api/events/:id`    | Get event details (Requires Auth) |
| PATCH  | `/api/events/:id`    | Update an event (Requires Admin) |
| DELETE | `/api/events/:id`    | Delete an event (Requires Admin) |

---

### 🖼 Media Content (`/api`)

| Method | Endpoint                          | Description |
|--------|----------------------------------|------------|
| POST   | `/api/events/:eventId/media`     | Upload media for an event (Requires Auth) |
| DELETE | `/api/media/:id`                | Delete media (Requires Admin) |
| POST   | `/api/media/:id/react`          | Toggle reaction (like, etc.) on media (Requires Auth) |