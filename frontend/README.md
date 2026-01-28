# CTF Platform - Frontend

This is the React frontend for the CTF Platform. It communicates with the backend API to manage challenges and instances.

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.example .env
   ```
   **VITE_API_URL**: Default is `/api/v1`, which is proxied locally to `http://localhost:3000`.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Architecture

- **Framework**: React with Vite.
- **Styling**: Standard CSS / Bootstrap (as configured in `package.json`).
- **State Management**: React Hooks and Context.
- **Proxying**: Development proxy is configured in `vite.config.ts`.

## Build for Production

```bash
npm run build
```
Static assets will be generated in the `dist/` directory.
