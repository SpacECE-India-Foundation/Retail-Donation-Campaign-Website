# API Routes Documentation

This document describes all backend endpoints available in the Donation Drive backend.

## Base URL

- Local development base URL: `http://localhost:<PORT>`
- The port is read from `process.env.PORT` in `server.js`.

## General notes

- The backend uses HTTP-only cookies for authentication tokens:
  - `accessToken`
  - `refreshToken`
- For frontend requests, include credentials and allow cookies.
  - Example: `fetch(url, { method, headers, credentials: 'include', body })`
- CORS currently allows `http://localhost:5173`.

---

## 1. Health check

### `GET /`

- Purpose: verify the server is running.
- Request: no body required.
- Response:
  - Status: `200`
  - Body: plain text message `Retail Donation Drive Server!!`

---

## 2. Admin registration

### `POST /api/admin/auth/register-admin`

- Purpose: create a new admin account and receive auth cookies.
- Request type: `multipart/form-data` or JSON with optional image URL.

### Request fields

- `fullName` (string, required)
- `email` (string, required)
- `password` (string, required, min length 8)
- `phone` (string, optional)
- `profileImage` (file, optional) if uploading an image
- `profileImage` (string, optional) if sending an image URL instead of a file

### Notes

- If uploading a file, use the form field name `profileImage`.
- If sending a URL, use `profileImage` in the body.

### Response

- Status: `201`
- JSON:
  ```json
  {
    "status": 201,
    "data": null,
    "message": "Admin registered successfully"
  }
  ```
- Sets `accessToken` and `refreshToken` cookies.

---

## 3. Admin login

### `POST /api/admin/auth/login-admin`

- Purpose: authenticate admin and receive auth cookies.
- Request type: `application/json`

### Request body

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Response

- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "adminId": "...",
      "email": "admin@example.com",
      "name": "Admin Name"
    },
    "message": "Login Succesfull!!"
  }
  ```
- Sets `accessToken` and `refreshToken` cookies.

---

## 4. Forgot password

### `POST /api/admin/auth/forgot-password`

- Purpose: begin password reset by sending an OTP to the admin email.
- Request type: `application/json`

### Request body

```json
{
  "email": "admin@example.com"
}
```

### Response

- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": null,
    "message": "OTP sent Successfully!!"
  }
  ```

---

## 5. Verify OTP

### `POST /api/admin/auth/verify-otp`

- Purpose: verify the OTP sent for password reset.
- Request type: `application/json`

### Request body

```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

### Response

- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": null,
    "message": "OTP verified successfully Successfully!!"
  }
  ```

---

## 6. Reset password

### `POST /api/admin/auth/reset-password`

- Purpose: complete password reset after OTP verification.
- Request type: `application/json`

### Request body

```json
{
  "email": "admin@example.com",
  "newPassword": "newPassword123"
}
```

### Response

- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": null,
    "message": "Password Changed Successfully! Now Login"
  }
  ```
- Clears `accessToken` and `refreshToken` cookies on success.

---

## 7. Get current admin

### `GET /api/admin/admin-me`

- Purpose: fetch details for the currently authenticated admin.
- Requires auth middleware `adminAuth`.
- Request type: no body.
- Must include cookies: `accessToken` and/or `refreshToken`.

### Response

- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "admin": {
        "_id": "...",
        "fullName": "Admin Name",
        "email": "admin@example.com",
        "phone": "...",
        "profileImage": "...",
        // other admin fields, excluding password
      }
    },
    "message": "Admin Fetched!!"
  }
  ```

---

## Frontend authentication hints

- Send cookies with requests:
  - `fetch(url, { credentials: 'include' })`
  - axios: `axios.defaults.withCredentials = true`
- Because cookies are HTTP-only, the frontend cannot read tokens directly.
- Use `GET /api/admin/admin-me` to verify that the admin session is valid.

---

## Notes for the frontend team

- Current backend only exposes admin authentication and current admin profile routes.
- If you need additional admin actions or campaign management endpoints, those are not implemented in this backend yet.
- The backend accepts only requests from `http://localhost:5173` by default. If your frontend runs on a different origin, update the CORS origin list in `server.js`.
