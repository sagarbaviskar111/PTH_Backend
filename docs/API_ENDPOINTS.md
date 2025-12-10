# API Reference

Base URL: `http://<HOST>:<PORT>/api`

Mounts:
- Auth: `/api/auth`
- Jobs: `/api/jobs`
- Departments: `/api/departments`
- News: `/api/news`

---

## Global Notes
- Auth header: `Authorization: Bearer <JWT>` for protected endpoints.
- File uploads: temporary files written to `uploads/` then uploaded to Cloudinary.
- `applicationDeadline` should be ISO 8601 date string where applicable.
- `responsibilities` and `skills` accept CSV strings (e.g., `"React,Node"`) or arrays.
- Job documents include `imagePublicId` and `logoPublicId` (Cloudinary public IDs).

---

## Auth

### POST /api/auth/login
- Auth: none
- Headers: `Content-Type: application/json`
- Body (JSON):
  - `email` (string, required)
  - `password` (string, required)
- Success 200:
```json
{ "_id": "<userId>", "email": "user@example.com", "token": "<jwt>" }
```

---

## Jobs

### POST /api/jobs
- Auth: none (public). To protect, require `Authorization` header.
- Headers: `Content-Type: multipart/form-data`
- Required form fields (validateJobCreate):
  - `positionName` (string)
  - `company` (string)
  - `salary` (string)
  - `location` (string)
  - `qualification` (string)
  - `companyOverview` (string)
- Optional form fields:
  - `experience`, `type`, `applicationDeadline`, `responsibilities`, `skills`, `tags`, `applylink`, `department`, `email`, `driveLocation`, `driveDate`, `driveTime`, `driveContactPerson`, `driveContactNumber`
- File fields (required):
  - `image` (file, image/*, max 5 MB)
  - `logo` (file, image/*, max 5 MB)
- Behavior: uploads files to Cloudinary (`job_images`, `job_logos`) and saves `imageUrl`, `logo`, `imagePublicId`, `logoPublicId` in DB.
- Success 201:
```json
{ "message": "Job created successfully", "job": { /* job doc */ } }
```

### GET /api/jobs
- Auth: none
- Query params:
  - `id` (optional) — single job id
  - `departmentId` (optional)
  - `query` (optional) — text search
  - `page` (default 1)
  - `limit` (default 10)
- Success 200:
```json
{ "totalJobs": 0, "totalPages": 0, "currentPage": 1, "jobs": [] }
```

### GET /api/jobs/:id
- Auth: none
- Success 200: job document (department populated)

### PUT /api/jobs/:id
- Auth: REQUIRED — `Authorization: Bearer <token>`
- Headers: `multipart/form-data` (if files) or `application/json`
- Body: any subset of job fields. `responsibilities`/`skills` can be CSV or array. `applicationDeadline` parsed as Date.
- File fields (optional): `image`, `logo` (image/*, 5MB)
- Behavior: uploads new files to Cloudinary, destroys previous assets if `imagePublicId`/`logoPublicId` existed.
- Success 200:
```json
{ "message": "Job updated successfully", "job": { /* updated job */ } }
```

### DELETE /api/jobs/:id
- Auth: REQUIRED
- Behavior: destroys Cloudinary assets (if public IDs exist) then deletes document.
- Success 200:
```json
{ "message": "Job deleted successfully" }
```

---

## Departments

### POST /api/departments
- Auth: REQUIRED
- Headers: `Content-Type: application/json`
- Body:
  - `name` (string, required)
- Success 201:
```json
{ "message": "Department added successfully", "department": { "_id": "...", "name": "..." } }
```

### GET /api/departments
- Auth: none
- Success 200: `[{ _id, name }, ...]`

### DELETE /api/departments/:id
- Auth: REQUIRED
- Success 200: `{ "message": "Department deleted successfully" }`

---

## News

### GET /api/news
- Auth: none
- Success 200: `[ { newsDoc }, ... ]`

### POST /api/news
- Auth: none
- Headers: `multipart/form-data`
- Form fields (required): `title`, `content`, `author`
- Files (required): `image` (file)
- Note: route uses local multer storage (not the shared fileUpload middleware). Controller uploads to Cloudinary and deletes temp file, but `Article` model stores only `imageUrl` (no `public_id`).
- Success 201:
```json
{ "message": "News created successfully", "news": { /* news doc */ } }
```

### GET /api/news/:id
- Auth: none
- Success 200: news document

### PUT /api/news/:id
- Auth: none
- Headers: `multipart/form-data` (if uploading new image)
- Fields: `title`, `content`, `author` (optional)
- Optional file: `image` — uploaded to Cloudinary; old cloudinary asset is not automatically removed.
- Success 200:
```json
{ "message": "News article updated successfully", "news": { /* updated news */ } }
```

### DELETE /api/news/:id
- Auth: none
- Success 200: `{ "message": "News article deleted successfully" }`

---

## Example Requests

Login:
```bash
curl -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"secret"}'
```

Create Job (PowerShell example):
```powershell
curl.exe -X POST "http://localhost:5000/api/jobs" `
  -F "positionName=Frontend Developer" `
  -F "company=ACME Ltd" `
  -F "salary=5-8 LPA" `
  -F "location=Pune" `
  -F "qualification=Bachelor's" `
  -F "companyOverview=We build stuff" `
  -F "responsibilities=Build UI,Write tests" `
  -F "skills=React,Node" `
  -F "image=@C:\path\image.jpg" `
  -F "logo=@C:\path\logo.png"
```

Update Job (with file):
```powershell
curl.exe -X PUT "http://localhost:5000/api/jobs/<JOB_ID>" `
  -H "Authorization: Bearer <TOKEN>" `
  -F "company=New Co" `
  -F "logo=@C:\path\newlogo.png"
```

---

## Suggestions / Caveats
- Consider protecting `POST /api/jobs` with auth if only admins should create jobs.
- Make `news` use the shared `middleware/fileUpload.js` and store Cloudinary `public_id` to enable automatic deletion of old assets.
- Client should validate file type and size before upload — server enforces image/* and 5MB for job uploads.

---

_File generated by repo tooling._
