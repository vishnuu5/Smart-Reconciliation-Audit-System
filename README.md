# Smart Reconciliation & Audit System

A full-stack MERN application that enables users to upload transaction data, reconcile it against system records, identify mismatches and duplicates, and maintain a complete audit trail of all actions.

## Urls links

**Git Link**
[View Git](https://github.com/vishnuu5/Smart-Reconciliation-Audit-System.git)

**Demo Link**
[Demo Project]()

## Tech Stack

**Frontend:**

- Vite
- React.js
- JavaScript
- TailwindCSS (Responsive design for all devices)

**Backend:**

- Node.js
- Express.js
- MongoDB

## Features

### Core Features

1. **Reconciliation Dashboard**
   - Summary cards: Total records, matched, unmatched, duplicates, accuracy percentage
   - Interactive charts (bar/donut)
   - Dynamic filters: Date range, status, uploaded by
   - Real-time data updates

2. **File Upload & Column Mapping**
   - CSV and Excel file support
   - Preview first 20 rows before submission
   - Flexible column mapping to system fields
   - Mandatory fields: Transaction ID, Amount, Reference Number, Date
   - Edit mapping without re-uploading

3. **Reconciliation View**
   - System record vs uploaded record comparison
   - Match statuses: Matched, Partially Matched, Not Matched, Duplicate
   - Highlight mismatched fields
   - Manual record correction

4. **Audit Timeline**
   - Visual timeline of all changes
   - Displays: Who changed, what changed, when
   - Immutable audit logs

### Reconciliation Logic

- **Exact Match:** Transaction ID + Amount match
- **Partial Match:** Reference Number matches with ±2% amount variance
- **Duplicate:** Same Transaction ID appears multiple times
- **Unmatched:** No match found
- Configurable matching rules

### Idempotency & Data Consistency

- Duplicate file uploads prevented
- Reprocessing reuses existing results if unchanged

### Authentication & Authorization

- **Admin:** Full access to all features and users
- **Analyst:** Upload and reconcile data
- **Viewer:** Read-only access

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd Backend
npm install
cp .env
npm start
```

**Environment Variables (.env):**

```
MONGO_URI=
JWT_SECRET=
NODE_ENV=development
PORT=5000
```

### Frontend Setup

```bash
cd Frontend
npm install
cp .env
npm run dev
```

**Environment Variables (.env):**

```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Upload

- `POST /api/upload` - Upload CSV/Excel file
- `GET /api/upload/:jobId` - Get upload job status
- `GET /api/upload` - List all uploads
- `POST /api/upload/:jobId/map-columns` - Map file columns

### Reconciliation

- `GET /api/reconciliation` - Get reconciliation results
- `GET /api/reconciliation/:recordId` - Get record details
- `PUT /api/reconciliation/:recordId` - Manual correction
- `GET /api/reconciliation/stats` - Reconciliation statistics

### Audit

- `GET /api/audit` - List audit logs
- `GET /api/audit/:recordId` - Get record audit trail
- `GET /api/audit/export` - Export audit logs

### Dashboard

- `GET /api/dashboard/summary` - Dashboard summary data
- `GET /api/dashboard/filters` - Available filter options

## Database Collections

### Users

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (Admin, Analyst, Viewer),
  createdAt: Date,
  updatedAt: Date
}
```

### UploadJobs

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  fileName: String,
  status: String (Processing, Completed, Failed),
  totalRecords: Number,
  recordsProcessed: Number,
  fileHash: String (for idempotency),
  columnMapping: Object,
  error: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Records

```javascript
{
  _id: ObjectId,
  uploadJobId: ObjectId (ref: UploadJob),
  transactionId: String (indexed),
  referenceNumber: String (indexed),
  amount: Number,
  date: Date,
  uploadedData: Object,
  systemData: Object,
  createdAt: Date
}
```

### ReconciliationResults

```javascript
{
  _id: ObjectId,
  recordId: ObjectId (ref: Record),
  uploadJobId: ObjectId (indexed),
  status: String (Matched, PartiallyMatched, NotMatched, Duplicate),
  matchedFields: [String],
  mismatchedFields: [Object],
  confidence: Number,
  systemRecord: Object,
  createdAt: Date
}
```

### AuditLogs

```javascript
{
  _id: ObjectId,
  recordId: ObjectId (ref: Record),
  userId: ObjectId (ref: User),
  action: String,
  oldValue: Object,
  newValue: Object,
  source: String (Manual, Auto, System),
  timestamp: Date,
  immutable: Boolean (true)
}
```

## Key Design Decisions

1. **Async Processing:** File processing uses job queue for non-blocking operation
2. **Idempotency:** File hash prevents duplicate processing
3. **Immutable Audit Logs:** Audit entries cannot be modified
4. **Configurable Rules:** Matching rules in separate config file
5. **Role-Based Access:** Enforced at both frontend and backend
6. **Responsive UI:** TailwindCSS ensures mobile, tablet, desktop compatibility

## Performance Optimizations

- Database indexing on Transaction ID, Reference Number, Upload Job ID
- Asynchronous file processing with job queue
- Pagination for large result sets
- Caching filter options
- Efficient record matching algorithms

## Error Handling

- Comprehensive validation at frontend and backend
- Meaningful error messages for users
- Partial failure isolation (one record failure doesn't break entire upload)
- Logging of all errors with context

## Running the Application

1. Start MongoDB
2. Start Backend: `cd Backend && npm start`
3. Start Frontend: `cd Frontend && npm run dev`
4. Access at `http://localhost:5173`

## Testing

Sample CSV files are provided in `Backend/sample-data/` for testing.

## Limitations & Trade-offs

- Large file uploads (>50K records) may take longer but remain responsive
- Real-time sync uses polling (can be upgraded to WebSocket)
- Matching rules require backend restart to change (can use database-driven config)

## Future Enhancements

- WebSocket for real-time updates
- Database-driven matching rules
- Advanced filtering with saved views
- API rate limiting
- Data encryption at rest
- Scheduled reconciliation jobs

## License

MIT
