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

### `POST /api/public/donation/scan-payment-screenshot`

- Purpose: scan a selected UPI payment screenshot before donation submission, so the form can auto-fill payment information.
- No authentication required.
- Request type: `multipart/form-data`.

#### Request fields

- `paymentMode` (string, required): must be `UPI`.
- `paymentscreenshot` (file, required): JPEG, PNG, or WebP image; maximum 5 MB.

#### Response

- Status: `200`.
- If `data.fields` is present, copy its `transactionId`, `amount`, `paymentDate`, and optional `senderName` into the donation form.
- If `data.requiresManualEntry` is `true`, ask the donor to enter the transaction ID and amount manually before submission.

#### Example response

```json
{
  "status": 200,
  "data": {
    "fields": {
      "transactionId": "ABC123456789",
      "amount": 500,
      "paymentDate": "2026-08-04T00:00:00.000Z",
      "senderName": "John Doe"
    },
    "ocr": {
      "attempted": true,
      "confidence": 88,
      "canAutoVerify": false,
      "senderName": "John Doe",
      "isOutgoingTransfer": true,
      "reason": "Auto verification using OCR disabled."
    },
    "requiresManualEntry": false
  },
  "message": "Payment details were read from the screenshot. Please confirm and submit the donation."
}
```

---

### `POST /api/public/donation/new-donation`

- Purpose: submit a donation for verification.
- No authentication required.
- Request type: `multipart/form-data`.

#### Request fields

- `paymentscreenshot` (file, required for UPI donations)
- `donorName` (string, required)
- `donorEmail` (string, required)
- `amount` (number, required)
- `donorPhone` (string, optional)
- `address` (string, optional)
- `donorMessage` (string, optional)
- `transactionId` (string, optional; if supplied, it must be 6–50 characters)
- `paymentMode` (string, optional; `UPI`, `Bank Transfer`, `Cash`, or `Cheque`)
- `campaign` (string, required; campaign `_id`)

For UPI donations, `paymentscreenshot` is required. The backend scans the screenshot again during final submission. If the OCR finds a strong outgoing-payment match for the submitted transaction ID, amount, and sender details, the donation can be auto-verified; otherwise it stays in the existing pending/manual or bank-statement verification flow.

#### OCR metadata stored with the donation

When OCR runs for a UPI screenshot, the backend stores the extracted values in the donation record under:

- `ocr.attempted`
- `ocr.confidence`
- `ocr.extractedTransactionId`
- `ocr.extractedAmount`
- `ocr.extractedPaymentDate`
- `ocr.extractedSenderName`
- `ocr.isOutgoingTransfer`
- `ocr.reason`

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

#### Response fields (each donation)

`donorName`, `amount`, `status`, `campaign`, `transactionId`, `paymentDate`, `verificationRemarks`, `screenshot.url`, `certificateGenerated`, `certificateUrl`, `donorPAN` — the last three added for the 80G certificate flow below (`certificateGenerated`/`certificateUrl` are set automatically at verification time; `donorPAN` is empty until the donor requests a certificate).

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

### `POST /api/public/donation/:donationId/generate-80g-certificate`

- Purpose: donor-requested 80G certificate for a Verified donation, from the Track Donations page. Records the donor's PAN against the donation and returns the certificate URL. A certificate is already generated automatically the moment an admin verifies a donation (see section 6, "verify a pending donation"); this endpoint reuses that same `certificateService.generateAndUploadCertificate` call and only generates a certificate itself if verification-time generation never completed for this donation — it never creates a second certificate for a donation that already has one.
- No authentication required.
- Request type: `application/json`.

#### Path parameter

- `donationId` (string, required): must belong to a donation with `status: "Verified"`.

#### Request body

```json
{
  "donorPAN": "ABCDE1234F"
}
```

- `donorPAN` (string, required): standard 10-character PAN format (`^[A-Z]{5}[0-9]{4}[A-Z]$`).

#### Response

```json
{
  "status": 200,
  "data": {
    "donationId": "...",
    "certificateUrl": "https://..."
  },
  "message": "80G certificate is ready."
}
```

- `400`/`404` (via `ApiError`) if the PAN is missing/invalid, or no Verified donation exists with that ID.

---

### `GET /api/public/donation/fetch-donationwall`

- Purpose: list verified donations for the public donation wall.
- No authentication required.

#### Query parameters

- `page` (number, optional; default `1`)
- `limit` (number, optional; default `12`)
- `lastDays` (number, optional; only include donations verified in the last number of days)

---

## 13. Public subscriber route

### `POST /api/public/subscribers/subscribe`

- Purpose: subscribe a public user to future campaign updates.
- No authentication required.
- Request type: `application/json`.

#### Request body

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com"
}
```

- `name` (string, required): `donorName` is also accepted.
- `email` (string, required): `donorEmail` is also accepted.

#### Behavior

- Creates a subscriber with `subscribed: true` when the email is new.
- An existing subscriber is reactivated rather than duplicated.
- Public subscriptions have no campaign-specific milestone subscriptions.

---

## 14. Public campaign routes

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

## 15. Certificate routes

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

## 16. Super Admin bank-statement routes

All bank-statement routes require the `accessToken` authentication cookie and the `SUPER_ADMIN` role.

### `POST /api/super-admin/bank-statement`

- Purpose: upload and import a bank statement, then automatically reconcile eligible bank transactions with pending donations.
- Request type: `multipart/form-data`.

#### Request fields

- `statement` (file, required): an Excel `.xlsx` bank statement, maximum size 10 MB.

#### Response

- Status: `201`
- The response data includes:
  - `importedCount`: new bank transactions stored.
  - `duplicateCount`: already-imported transaction IDs.
  - `failedCount`: invalid or failed imports.
  - `invalidRowCount` and `importFailures`: validation/import details.
  - `reconciliationSummary`: matched, unmatched, and failed verification counts; includes retry-email results.

---

### `GET /api/super-admin/bank-statement/history`

- Purpose: list uploaded bank-statement batches and their reconciliation status.
- Request: no body required.

#### Response

- Status: `200`
- Each item in `data.uploads` includes:
  - `uploadBatchId`
  - `fileName`
  - `uploadedByName`
  - `uploadedAt`
  - `totalTransactions`
  - `matchedTransactions`
  - `unmatchedTransactions`
  - `failedTransactions`

---

### `POST /api/super-admin/bank-statement/reconcile`

- Purpose: retry reconciliation for all eligible unmatched or previously failed bank transactions. It also retries recorded failed verification emails.
- Request: no body required.

#### Response

- Status: `200`
- `data.reconciliationSummary` contains the number of transactions matched, unmatched, failed, and email retry results.

---

## 17. Super Admin subscriber routes

All routes in this section require the `accessToken` authentication cookie and the `SUPER_ADMIN` role.

### `GET /api/super-admin/subscribers/search-subscribers`

- Purpose: search and paginate subscribers.

#### Query parameters

- `page` (number, optional; default `1`)
- `limit` (number, optional; default `10`)
- `search` (string, optional): searches donor name and email.

---

### `POST /api/super-admin/subscribers/import/preview`

- Purpose: validate an Excel subscriber import and return a preview without saving subscribers.
- Request type: `multipart/form-data`.

#### Request fields

- `file` (file, required): `.xlsx` workbook, maximum 5 MB.

#### Workbook format

Every non-empty worksheet must include the following first-row headers:

- `donorName` (required; aliases: `name`, `fullName`)
- `donorEmail` (required; aliases: `email`, `emailAddress`)
- `lastDonation` (optional; aliases: `lastDonationAt`, `donationDate`, `lastDonationDate`)
- `subscribedCampaigns` (optional; aliases: `subscribedCampaign`, `campaign`, `campaigns`)

The importer reads every worksheet. Campaigns can be supplied as campaign names or IDs; multiple campaigns in one cell are separated by commas, semicolons, or `|`.

#### Response

- Status: `200`.
- `data.rows` contains the combined rows with `sheetName`, `rowNumber`, parsed donation/campaign values, `status`, and `reason`.
- A row may be `READY`, `INVALID`, `DUPLICATE_IN_FILE`, or `ALREADY_SUBSCRIBED`.

---

### `POST /api/super-admin/subscribers/import/commit`

- Purpose: save the valid subscriber rows selected from the import preview.
- Request type: `application/json`.

#### Request body

```json
{
  "subscribers": [
    {
      "sheetName": "Donors",
      "rowNumber": 2,
      "donorName": "Priya Sharma",
      "donorEmail": "priya@example.com",
      "lastDonationAt": "2026-08-10T00:00:00.000Z",
      "subscribedCampaigns": ["campaign-id-or-name"]
    }
  ]
}
```

- Submit only `READY` rows remaining in the frontend preview table.
- The backend validates all records and campaigns again before saving.
- Existing emails are skipped; no duplicate subscriber is created.
- The response has `importedCount`, `duplicateCount`, `invalidCount`, `failedCount`, and `importFailures`.

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
