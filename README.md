# Vapi Assistant Manager

A full-stack web application that allows users to manage their Vapi.ai voice assistants. Users can create, view, and customize their voice assistants with features like availability scheduling, voice settings, and more.

## Features

- User Authentication (Sign up / Log in / Log out)
- Assistant Dashboard
  - View all assistants
  - Create new assistants
  - Edit existing assistants
- Assistant Configuration
  - Set availability schedule
  - Configure voice settings
  - Set introduction message
  - Configure webhook URL
  - Toggle recording/transcription settings

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MySQL with Prisma ORM
- JWT Authentication

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Router

## Prerequisites

- Node.js (v18 or higher)
- MySQL
- Vapi.ai API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd vapi-assistant-manager
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Create a `.env` file in the backend directory:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/vapi_assistant_manager"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
VAPI_API_KEY="your-vapi-api-key"
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
```

## Running the Application

To run both frontend and backend with a single command:
```bash
npm run dev
```

This will start:
- Backend server at `http://localhost:3000`
- Frontend development server at `http://localhost:5173`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Assistants
- GET `/api/assistants` - Get all assistants for the authenticated user
- POST `/api/assistants` - Create a new assistant
- GET `/api/assistants/:id` - Get a specific assistant
- PATCH `/api/assistants/:id` - Update an assistant

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
