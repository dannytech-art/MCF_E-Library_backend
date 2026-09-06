# MCF E-Library API

Backend service for the **Methodist Campus Fellowship (MCF) E-Library** — a platform where students register under their faculty, verify their email with a one-time code, and browse the learning materials that belong to that faculty.

The materials themselves are **not stored in this API**. Each faculty record holds a Google Drive folder ID, and the API reads that folder through a Google service account and returns the file listing (name, type, view link, thumbnail, last modified). Uploading and organising materials happens in Google Drive; the API is the gatekeeper and index.

---

## How it works

```
Student signs up (name, email, password, faculty)
        │
        ├─► password hashed with bcrypt, user saved to MongoDB
        ├─► 4-digit OTP generated (valid 15 minutes)
        └─► OTP emailed via Brevo using an HTML template
                │
        Student submits the OTP  ──►  account marked isVerified
                │
        Student logs in  ──►  receives a JWT (expires in 1 day)
                │
        JWT in `Authorization: Bearer <token>`
                │
        GET /faculty/:id/materials
                │
                ├─► look up the faculty in MongoDB
                ├─► read its driveFolderId
                └─► list that Google Drive folder (read-only) and return the files
```

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Runtime / framework | Node.js, Express 5 |
| Database | MongoDB via Mongoose |
| Authentication | JWT (`jsonwebtoken`), passwords hashed with `bcrypt` |
| Email delivery | Brevo transactional email (`sib-api-v3-sdk`) |
| File storage | Google Drive, read-only, via a service account (`googleapis`) |
| API documentation | Swagger UI + OpenAPI 3.0.3 (`swagger-jsdoc`, `swagger-ui-express`) |
| Config | `dotenv` |

---

## Project structure

```
src/
├── server.js                     # App entry: middleware, Swagger mount, routers, 404 handler
├── config/
│   ├── db.js                     # Mongoose connection
│   ├── swagger.js                # OpenAPI definition, shared schemas, security scheme
│   └── google/
│       └── serviceAccount.json   # Google service account key (gitignored — never commit)
├── middleware/
│   ├── authMiddleware.js         # Verifies the JWT and attaches req.user
│   ├── brevoMiddleware.js        # sendMail() wrapper around Brevo
│   ├── otpMiddleware.js          # generateVerificationCode(): 4-digit OTP + 15-minute expiry
│   └── joiMiddleware.js          # Placeholder for request validation (currently empty)
├── modules/
│   ├── users/
│   │   ├── userModel.js          # Schema: fullName, email, password, faculty, otp, isVerified
│   │   ├── userController.js     # Signup, OTP verify/resend, login, profile, update, delete
│   │   └── userRouter.js         # Routes + Swagger annotations
│   └── faculty/
│       ├── facultyModel.js       # Schema: name (unique), driveFolderId
│       ├── facultyController.js  # CRUD + GetFacultyMaterials
│       └── facultyRouter.js      # Routes + Swagger annotations
├── services/
│   └── googledriveservics.js     # getMaterialsFromDrive(folderId) — lists a Drive folder
└── utils/
    └── emailTemplates.js         # Branded HTML email template for the OTP
```

Each feature lives in its own module folder with a **model → controller → router** split, so adding a new area (e.g. announcements, past questions) means adding one folder and mounting its router in `server.js`.

---

## API reference

Interactive docs are the source of truth: run the server and open **`/api-docs`**. Raw spec at **`/api-docs.json`**.

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | — | Welcome message with links to the docs |
| GET | `/health` | — | Status and process uptime |

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/signup` | — | Register; hashes password, emails a 4-digit OTP, returns a JWT |
| POST | `/verify-otp` | — | Verify email with the OTP; marks the account verified |
| POST | `/resend-otp` | — | Issue and email a fresh OTP |
| POST | `/login` | — | Email + password → JWT and sanitised user |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/profile` | Bearer | The authenticated user's own profile |
| GET | `/users` | Bearer | List all users (password and OTP fields stripped) |
| GET | `/user/:id` | Bearer | Fetch a single user |
| PUT | `/user/:id` | Bearer | Update **your own** `fullName` / `faculty` (403 otherwise) |
| PUT | `/change-password` | Bearer | Change your password (min 6 chars, current password required) |
| DELETE | `/user/:id` | Bearer | Delete **your own** account (403 otherwise) |

### Faculties

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/createfa` | Bearer | Create a faculty with its Drive folder ID |
| GET | `/getfas` | — | List all faculties |
| GET | `/getfaid/:id` | — | Fetch one faculty |
| PUT | `/faculty/:id` | Bearer | Update a faculty's name or Drive folder ID |
| DELETE | `/faculty/:id` | Bearer | Delete a faculty |
| GET | `/faculty/:id/materials` | Bearer | List the files in that faculty's Drive folder |

Passwords, OTPs, and OTP expiry are never returned in any response.

### Allowed faculty values

The `faculty` field on a user is an enum:

```
Faculty Of Art
Faculty Of Science
Faculty Of Engineering
Faculty Of Social Sciences
Faculty Of Education
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local or MongoDB Atlas)
- A [Brevo](https://www.brevo.com) account with an API key and a verified sender address
- A Google Cloud project with the Drive API enabled and a service account key

### 1. Install

```bash
git clone https://github.com/dannytech-art/MCF_E-Library.git
cd MCF_E-Library
npm install
```

### 2. Configure environment

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Port to listen on. Defaults to `4784` if unset. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify JWTs. Use a long random string. |
| `BREVO_API_KEY` | Brevo transactional email API key. |

> The sender name and address for OTP emails are set in `src/middleware/brevoMiddleware.js`. Change the defaults there to your own verified Brevo sender.

### 3. Add the Google service account key

1. In the Google Cloud console, enable the **Google Drive API**.
2. Create a **service account** and download its JSON key.
3. Save it as `src/config/google/serviceAccount.json` (this path is gitignored).
4. In Google Drive, **share each faculty's folder** with the service account's email address (`...@....iam.gserviceaccount.com`) with at least Viewer access — otherwise the folder will come back empty.
5. Copy the folder ID from the Drive URL — `https://drive.google.com/drive/folders/<THIS_PART>` — and use it as `driveFolderId` when creating the faculty.

The API requests the `drive.readonly` scope only, so it can list and link files but never modify or delete anything in your Drive.

### 4. Run

```bash
npm run dev
```

You should see:

```
Server is running on port 4784
Swagger docs available at http://localhost:4784/api-docs
Database connected successfully
```

---

## Quick walkthrough

```bash
# 1. Register
curl -X POST http://localhost:4784/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane Doe","email":"jane@school.edu","password":"secret123","faculty":"Faculty Of Science"}'

# 2. Verify with the code emailed to you
curl -X POST http://localhost:4784/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@school.edu","otp":"4821"}'

# 3. Log in and keep the token
curl -X POST http://localhost:4784/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@school.edu","password":"secret123"}'

# 4. Register a faculty and its Drive folder
curl -X POST http://localhost:4784/createfa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Faculty Of Science","driveFolderId":"1AbCDeFgHiJkLmNoPqRsTuVwXyZ"}'

# 5. Read that faculty's materials
curl http://localhost:4784/faculty/<FACULTY_ID>/materials \
  -H "Authorization: Bearer <TOKEN>"
```

In Swagger UI, click **Authorize**, paste the token, and every protected endpoint is callable straight from the browser.

---

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds) and are never stored or returned in plain text.
- JWTs expire after 1 day and are re-validated against the database on every protected request, so a deleted user's token stops working immediately.
- `PUT /user/:id` and `DELETE /user/:id` enforce ownership — you cannot modify another student's account.
- `.env`, the Google service account key, and any `*.pem` / `credentials.json` files are gitignored. Never commit them; if a key is ever exposed, rotate it.

---

## Known gaps / roadmap

Honest list of what is not done yet:

- **No admin role.** Any verified, authenticated user can create, update, or delete a faculty. Faculty management should be restricted to admins.
- **Login does not require a verified email.** `isVerified` is recorded but not enforced at login.
- **Request validation is not wired up.** `joi` is installed and `src/middleware/joiMiddleware.js` is reserved for it, but validation is currently done with manual `if` checks in the controllers.
- **Unused dependencies.** `cloudinary` and `multer` are in `package.json` but not used anywhere — they are left in for planned direct-upload support.
- **No tests.** `npm test` is still the default placeholder.
- **No rate limiting** on `/login`, `/signup`, or `/resend-otp`.
- The Swagger `servers` entry is hardcoded to `http://localhost:4784`; add your deployed URL there before shipping.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the server with nodemon (auto-restart on change) |

`nodemon` is expected as a dev tool — install it with `npm install --save-dev nodemon` if it is not already available.

---

## License

ISC
