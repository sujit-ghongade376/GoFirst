# GoFirst - Jira-like Ticket Board App

GoFirst is a full-stack Jira-like ticket board application built with a modern React frontend and a Go backend. It supports ticket CRUD, drag-and-drop, responsive design, dark/light mode, search, advanced board features, and more.

## Features

- Ticket CRUD (Create, Read, Update, Delete)
- Drag-and-drop ticket board
- Responsive design (mobile & desktop)
- Dark/light mode with user preference persistence
- Search and filter tickets (by priority, status, assignee)
- Create/edit ticket modal
- Comments, user assignment, due dates, priorities
- Activity log and attachments
- Modern UI with MUI, styled-components
- Backend: Go (Gin, GORM, SQLite)
- Frontend: React (Vite, MUI, Redux Toolkit Query, React Hook Form, Zod)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Go (v1.20+ recommended)

### Frontend Setup

```sh
cd frontend
npm install
npm run dev
```

### Backend Setup

```sh
cd backend
go run ./cmd/main.go
```

### GitHub Pages Deployment

- The frontend is configured for GitHub Pages deployment.
- To deploy:
  1. Push your code to GitHub.
  2. In `frontend`, run:
     ```sh
     npm install --save-dev gh-pages
     npm run deploy
     ```
  3. Your app will be available at `https://<your-username>.github.io/GoFirst/`

## Project Structure

```
GoFirst/
  frontend/   # React app (Vite, MUI, etc.)
  backend/    # Go API (Gin, GORM, SQLite)
```

## Customization

- Update the Vite `base` config in `vite.config.ts` if you change your repo name.
- Backend and frontend are decoupled; you can deploy them separately.

## License

MIT

---

Built by the GoFirst Team.
