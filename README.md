# Tutalim

Tutalim is a simple MERN stack project that demonstrates a small property portal. Users can sign up as **owners** or **realtors** and access different dashboards after logging in. The back end is built with Express and MongoDB, while the front end uses React with Vite.

## Setup

### Server

1. Install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Start the API server:

   ```bash
   npm start
   ```

   The server runs on `http://localhost:5000`.

### Client

1. Install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Start the React development server:

   ```bash
   npm run dev
   ```

   The client runs on `http://localhost:5173`.

## Environment variables

The API currently defines the MongoDB connection URI and JWT secret directly in the code. You can change them by editing `server/config.js` and `server/index.js` or by introducing environment variables:

| Variable      | Purpose                            | Default value                       |
| ------------- | ---------------------------------- | ----------------------------------- |
| `MONGODB_URI` | MongoDB connection string          | `mongodb://localhost:27017/tutalim` |
| `JWT_SECRET`  | Secret used for signing JWT tokens | `tutalim-secret`                    |

## Property API

The server exposes simple endpoints for managing properties:

| Method & Path                                   | Description                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `POST /api/properties`                          | Create a property. Requires `address`, `rentPrice` and `realtorId`. Optionally include `ownerId`. |
| `GET /api/properties?ownerId=...&realtorId=...` | Fetch properties filtered by owner or realtor.                                                    |
| `PUT /api/properties/:id/assign`                | Attach an existing property to an owner by providing `ownerId` in the body.                       |

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
