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

## 8. Admin donation routes

### `GET /api/donations`

- Purpose: fetch donation records for admin review.
- Requires auth middleware `adminAuth`.
- By default, this returns all donations.
- Use query parameters to filter results.

#### Query parameters
- `status` (string, optional)
  - Example: `Pending`, `Verified`, `Rejected`
- `campaign` (string, optional)
  - Campaign `_id` to return donations for a specific campaign.
- `donorName` (string, optional)
  - Partial, case-insensitive search on donor name.
- `donorEmail` (string, optional)
  - Partial, case-insensitive search on donor email.
- `transactionId` (string, optional)
  - Partial search on transaction ID.
- `paymentMode` (string, optional)
  - Example: `UPI`, `Bank Transfer`, `Cash`, `Cheque`
- `verified` (boolean, optional)
  - Use `true` to return verified donations, `false` for unverified.
- `minAmount` (number, optional)
  - Minimum donation amount.
- `maxAmount` (number, optional)
  - Maximum donation amount.
- `paymentDateFrom` (date string, optional)
  - Return donations on or after this date.
- `paymentDateTo` (date string, optional)
  - Return donations on or before this date.

#### Example requests
- All donations:
  - `GET /api/donations`
- Pending donations only:
  - `GET /api/donations?status=Pending`
- Donations for a specific campaign:
  - `GET /api/donations?campaign=<CAMPAIGN_ID>`
- Verified donations only:
  - `GET /api/donations?verified=true`
- Donations between amounts:
  - `GET /api/donations?minAmount=50&maxAmount=200`
- Donations in a date range:
  - `GET /api/donations?paymentDateFrom=2026-07-01&paymentDateTo=2026-07-31`

#### Response
- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "donations": [
        {
          "_id": "...",
          "donorName": "...",
          "donorEmail": "...",
          "amount": 100,
          "status": "Pending",
          "campaign": { /* populated campaign object */ },
          "verified": false,
          "verifiedBy": { "_id": "...", "fullName": "Admin Name", "email": "..." }
        }
      ]
    },
    "message": "Donations fetched successfully"
  }
  ```

---

### `PATCH /api/donations/:id/verify`

- Purpose: verify a pending donation.
- Requires auth middleware `adminAuth`.
- Request type: `application/json`.

#### Request body

```json
{
  "verificationRemarks": "Optional remarks about verification"
}
```

#### Response
- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "donation": {
        "_id": "...",
        "status": "Verified",
        "verified": true,
        "verifiedAt": "...",
        "verifiedBy": "...",
        "verificationRemarks": "..."
      }
    },
    "message": "Donation verified successfully"
  }
  ```

---

#### Notes for frontend use
- Always send cookies from admin login when calling these routes.
- If cookies are not sent, the request will fail with authorization error.
- Use `GET /api/admin/admin-me` to confirm the admin session is still valid.

### Response

- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "donation": {
        "_id": "...",
        "status": "Verified",
        "verified": true,
        "verifiedAt": "...",
        "verifiedBy": "...",
        "verificationRemarks": "..."
      }
    },
    "message": "Donation verified successfully"
  }
  ```

---

## 9. Public campaign routes

### `GET /api/campaigns`

- Purpose: list all active campaigns for public users.
- Request type: `application/json`.
- No authentication required.

#### Response
- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "campaigns": [
        {
          "_id": "...",
          "campaignName": "...",
          "campaignDescription": "...",
          "campaignGoalAmount": 10000,
          "startDate": "...",
          "endDate": "...",
          "bannerImage": "...",
          "createdAt": "..."
        }
      ]
    },
    "message": "Campaigns fetched successfully"
  }
  ```

### `GET /api/campaigns/:id`

- Purpose: get details for a single campaign, including its milestones.
- Request type: `application/json`.
- No authentication required.

#### Path parameter
- `id` (string, required): campaign `_id`

#### Response
- Status: `200`
- JSON:
  ```json
  {
    "status": 200,
    "data": {
      "campaign": {
        "_id": "...",
        "campaignName": "...",
        "campaignDescription": "...",
        "campaignGoalAmount": 10000,
        "startDate": "...",
        "endDate": "...",
        "bannerImage": "...",
        "createdAt": "..."
      },
      "milestones": [
        {
          "_id": "...",
          "campaign": "...",
          "milestoneTitle": "...",
          "description": "...",
          "displayOrder": 1,
          "createdAt": "..."
        }
      ]
    },
    "message": "Campaign details fetched successfully"
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

- The backend accepts only requests from `http://localhost:5173` by default. If your frontend runs on a different origin, update the CORS origin list in `server.js`.
