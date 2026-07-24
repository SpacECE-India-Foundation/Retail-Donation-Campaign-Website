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

## 8. Admin authentication management

### `POST /api/admin/auth/logout`

- Purpose: log out the authenticated admin and clear auth cookies.
- Requires auth middleware `adminAuth`.
- Request: no body required.

---

### `PATCH /api/admin/auth/update-profile`

- Purpose: update the authenticated admin's profile.
- Requires auth middleware `adminAuth`.
- Request type: `multipart/form-data`.

#### Request fields

- `fullName` (string, optional, minimum 3 characters)
- `phone` (string, optional, valid 10-digit Indian mobile number; send an empty string to clear it)
- `profileImage` (file, optional)

---

### `PATCH /api/admin/auth/change-password`

- Purpose: change the authenticated admin's password and log out active sessions.
- Requires auth middleware `adminAuth`.
- Request type: `application/json`.

#### Request body

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123"
}
```

---

## 9. Admin campaign routes

### `POST /api/admin/campaign/new-campaign`

- Purpose: create a campaign.
- Requires auth middleware `adminAuth`.
- Request type: `multipart/form-data`.

#### Request fields

- `campaignName` (string, required)
- `campaignDescription` (string, required)
- `campaignGoalAmount` (number, required)
- `startDate` (date string, required)
- `endDate` (date string, required)
- `campaignBanner` (file, required)

---

### `PATCH /api/admin/campaign/update-campaign/:campaignId`

- Purpose: update a campaign created by the authenticated admin.
- Requires auth middleware `adminAuth`.
- Request type: `application/json`.

#### Path parameter

- `campaignId` (string, required): campaign `_id`.

#### Request body

- Any of: `campaignName`, `campaignDescription`, `campaignGoalAmount`, `startDate`, `endDate`, `campaignStatus`.
- `campaignStatus` accepts `Active` or `inActive`.

---

### `PATCH /api/admin/campaign/update-image/:campaignId`

- Purpose: replace a campaign banner.
- Requires auth middleware `adminAuth`.
- Request type: `multipart/form-data`.

#### Request fields

- `campaignBanner` (file, required)

---

### `GET /api/admin/campaign/admin-campaigns`

- Purpose: list campaigns created by the authenticated admin.
- Requires auth middleware `adminAuth`.
- Request: no body required.

---

### `GET /api/admin/campaign/campaign-details/:campaignId`

- Purpose: get one campaign created by the authenticated admin.
- Requires auth middleware `adminAuth`.

#### Path parameter

- `campaignId` (string, required): campaign `_id`.

---

## 10. Admin milestone routes

### `POST /api/admin/milestone/:campaignId/milestone`

- Purpose: add a milestone to an admin-owned campaign.
- Requires auth middleware `adminAuth`.
- Request type: `multipart/form-data`.

#### Request fields

- `milestoneTitle` (string, required)
- `description` (string, required)
- `targetAmount` (number, required; absolute campaign total checkpoint)
- `displayOrder` (number, required; unique within the campaign)
- `mileStoneImage` (file, optional)

---

### `PATCH /api/admin/milestone/:campaignId/milestone/:milestoneId`

- Purpose: update a milestone.
- Requires auth middleware `adminAuth`.
- Request type: `application/json`.

#### Path parameters

- `campaignId` (string, required): campaign `_id`.
- `milestoneId` (string, required): milestone `_id`.

#### Request body

- Any of: `milestoneTitle`, `description`, `targetAmount`, `displayOrder`.

---

### `DELETE /api/admin/milestone/:campaignId/milestone/:milestoneId`

- Purpose: delete a milestone.
- Requires auth middleware `adminAuth`.

---

### `GET /api/admin/milestone/:campaignId/milestones`

- Purpose: list milestones for an admin-owned campaign.
- Requires auth middleware `adminAuth`.

---

## 11. Admin donation routes

### `GET /api/donations/fetch-donations`

- Purpose: fetch donation records belonging to campaigns created by the authenticated admin.
- Requires auth middleware `adminAuth`.

#### Query parameters

- `page` (number, optional; default `1`)
- `limit` (number, optional; default `10`)
- `search` (string, optional; searches donor name, donor email, or transaction ID)
- `campaign` (string, optional; campaign `_id`)
- `status` (string, optional; for example `Pending`, `Verified`, or `Rejected`)
- `paymentMode` (string, optional; `UPI` or `Bank Transfer`)
- `fromDate` (date string, optional; submission date lower bound)
- `toDate` (date string, optional; submission date upper bound)

#### Example request

- `GET /api/donations/fetch-donations?page=1&limit=10&status=Pending`

---

### `GET /api/donations/pending-donation`

- Purpose: fetch pending donations and rejected donations that have been resubmitted.
- Requires auth middleware `adminAuth`.
- Request: no body required.

---

### `POST /api/donations/verify-donation/:donationId`

- Purpose: verify a pending donation, or a rejected donation that has been resubmitted. A certificate is generated and attached to the verification email when generation succeeds.
- Requires auth middleware `adminAuth`.
- Request: no body required.

#### Path parameter

- `donationId` (string, required): donation `_id`.

---

### `POST /api/donations/reject-donation/:donationId`

- Purpose: reject a pending donation, or a rejected donation that has been resubmitted.
- Requires auth middleware `adminAuth`.
- Request type: `application/json`.

#### Path parameter

- `donationId` (string, required): donation `_id`.

#### Request body

```json
{
  "verificationRemarks": "Explain why the donation was rejected"
}
```

---

## 12. Public donation routes

### `POST /api/public/donation/new-donation`

- Purpose: submit a donation for verification.
- No authentication required.
- Request type: `multipart/form-data`.

#### Request fields

- `paymentscreenshot` (file, required)
- `donorName` (string, required)
- `donorEmail` (string, required)
- `amount` (number, required)
- `paymentMode` (string, required; `UPI` or `Bank Transfer`)
- `donorPhone` (string, optional)
- `address` (string, optional)
- `donorMessage` (string, optional)
- `transactionId` (string, optional; if supplied, it must be 6–50 characters)
- `campaign` (string, required; campaign `_id`)
---

### `POST /api/public/donation/donation-details`

- Purpose: retrieve a donor's donation records by email.
- No authentication required.
- Request type: `application/json`.

#### Request body

```json
{
  "donorEmail": "donor@example.com"
}
```

---

### `PATCH /api/public/donation/re-donation/:donationId`

- Purpose: resubmit a rejected donation with a new payment screenshot.
- No authentication required.
- Request type: `multipart/form-data`.

#### Path parameter

- `donationId` (string, required): rejected donation `_id`.

#### Request fields

- `paymentscreenshotEdited` (file, required)
- `amount` (number, optional)
- `transactionId` (string, optional)

---

### `GET /api/public/donation/fetch-donationwall`

- Purpose: list verified donations for the public donation wall.
- No authentication required.

#### Query parameters

- `page` (number, optional; default `1`)
- `limit` (number, optional; default `12`)
- `lastDays` (number, optional; only include donations verified in the last number of days)

---

## 13. Public campaign routes

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

---

## 14. Certificate routes

### `GET /api/public/certificate/verify/:certificateId`

- Purpose: verify a certificate and return its public details.
- No authentication required.

#### Path parameter

- `certificateId` (string, required): certificate UUID.

---

### `POST /api/public/certificate/verify-batch`

- Purpose: verify up to 50 certificates at once.
- No authentication required.
- Request type: `application/json`.

#### Request body

```json
{
  "certificateIds": ["certificate-uuid-1", "certificate-uuid-2"]
}
```

---

### `GET /api/public/certificate/analytics/:certificateId`

- Purpose: retrieve certificate view analytics.
- Requires auth middleware `adminAuth`.

#### Path parameter

- `certificateId` (string, required): certificate UUID.

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
