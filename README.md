# Deep Guard Backend

Deep Guard Backend is a robust RESTful API built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/), serving as the core logic layer for the Deep Guard system. It handles authentication, deepfake analysis workflows, and integration with **Supabase** and external ML services.

> **For a detailed technical overview, please refer to the [System Architecture](ARCHITECTURE.md).**

## 🚀 Tech Stack

-   **Runtime:** [Node.js](https://nodejs.org/)
-   **Framework:** [Express.js](https://expressjs.com/)
-   **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
-   **Storage:** Supabase Storage (`video_analyses`, `image_analyses`, `trial_analyses`)
-   **Authentication:** Custom JWT (Access + Refresh Tokens) with Cookie Rotation & Google OAuth
-   **ML Integration:** FastAPI (Python) for Deepfake Detection
-   **Utilities:**
    -   [Nodemailer](https://nodemailer.com/): Email services (OTP, Bug Reports)
    -   [Multer](https://github.com/expressjs/multer): File uploads (Memory Storage)
    -   [AdmZip](https://github.com/cthackers/adm-zip): ZIP handling for reports

## 🛠️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (Latest LTS)
-   [npm](https://www.npmjs.com/)
-   Supabase Project (URL & Keys)
-   Running ML Service (FastAPI)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Deep-Guard-Backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory:

    ```env
    PORT=5000
    NODE_ENV=development
    FRONTEND_URL=http://localhost:3000

    # Supabase
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

    # Authentication
    JWT_SECRET=your_jwt_secret
    JWT_REFRESH_SECRET=your_refresh_secret
    GOOGLE_CLIENT_ID=your_google_client_id

    # Email Service
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASSWORD=your_email_app_password

    # ML Service
    ML_API_URL=http://localhost:8000
    ML_IMAGE_URL=http://localhost:8000
    ```

### Running the Server

-   **Development:** `npm run dev` (uses `nodemon`)
-   **Production:** `npm start`

## 🔑 Key Features

### 1. Authentication System
-   **JWT-based Auth:** Uses `httpOnly` cookies for `accessToken` (15m) and `refreshToken` (30d).
-   **Session Management:** Sessions are tracked in Supabase (`sessions` table) with device fingerprinting. Includes token rotation and fraud detection (reuse detection).
-  

### 2. Deepfake Analysis
-   **Video Analysis:** Uploads video to Supabase -> Sends to ML Service -> Receives Confidence Report -> Stores Results.
-   **Image Analysis:** Supports batch upload (max 10 files).
-   **Report Generation:** Automatically handles ZIP generation containing annotated frames/images.

### 3. Trial System
-   **Stateless Trial:** Allows unauthenticated users to try the service.
-   **Limits:** Restricted to 3 uploads per day per device (fingerprinted by IP + User Agent).
-   **Storage:** Uses a dedicated `trial_analyses` bucket with auto-cleanup logic.

### 4. Integrations
-   **GitHub:** Fetches repository stats (contributors, pulls) for the "About" page.
## 📂 Project Structure

```
Deep-Guard-Backend/
├── .github/          # GitHub Actions (Keep-Alive Workflow)
├── config/           # Supabase client configuration
├── controllers/      # Business logic (Auth, Analysis, Trial, Github)
├── middleware/       # Auth checks, File upload limits, Error handling
├── routes/           # API Endpoints
│   ├── auth.js                 # Login, Signup, OTP, Refresh
│   ├── analysis.js             # Video analysis & CRUD
│   ├── analysis-image-upload.js # Image analysis upload
│   ├── ml-service.js           # Core ML integration (Video)
│   ├── ml-service-images.js    # Core ML integration (Image)
│   ├── trial.js                # Trial session management
│   └── ...
├── services/         # Helper services for storage/DB operations
├── supabase/         # Edge Functions & Setup
├── utils/            # Helpers (Logger, Encryption)
├── server.js         # Entry point
└── package.json
```

## 📡 API Endpoints

### Auth (`/auth`)
-   `POST /signup` - Register with OTP verification
-   `POST /login` - Sign in
-   `POST /google` - Google OAuth login
-   `POST /refresh` - Refresh access token
-   `POST /logout` - Sign out

### Analysis (`/api/analysis`)
-   `GET /` - List user analyses
-   `POST /upload` - Upload video for analysis
-   `GET /:id` - Get analysis result
-   `GET /:id/download` - Download report ZIP

### Image Analysis (`/api/analysis/image`)
-   `POST /upload` - Batch upload images

### Account (`/api/account`)
-   `PUT /update-profile` - Update name/avatar
-   `PUT /change-password` - Change password

## 🤝 Contributing

Contributions are welcome! Please follow the project's coding standards and submit a pull request.

## 📄 License

[ISC License](LICENSE)
