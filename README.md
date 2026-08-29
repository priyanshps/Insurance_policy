# Insurance Policy API

Backend API built with **Node.js, Express.js, MongoDB, and Mongoose** for importing, searching, and managing insurance policy data.

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* PM2
* Node Cron

---

## Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd insurance-policy-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

---

# Start Application

## Development

```bash
npm run dev
```

## Production with PM2

```bash
pm2 start ecosystem.config.js
```

Check application status:

```bash
pm2 status
```

---

# PM2 Commands

## View Logs

```bash
pm2 logs insurance-policy-api
```

View the last 100 lines:

```bash
pm2 logs insurance-policy-api --lines 100
```

## Stop Application

```bash
pm2 stop insurance-policy-api
```

## Restart Application

```bash
pm2 restart insurance-policy-api
```

## Delete Application from PM2

```bash
pm2 delete insurance-policy-api
```

---

# APIs

**Base URL:**

```text
http://localhost:5000
```

## 1. Upload CSV

Uploads and processes the insurance CSV file.

### Endpoint

```http
POST /api/upload
```

### cURL

```bash
curl --location 'http://localhost:5000/api/upload' \
--form 'file=@"/path/to/insurance.csv"'
```

The CSV data is used to create/update:

* Users
* Carriers
* LOBs
* Agents
* User Accounts
* Policies

Bulk operations using `bulkWrite()` are used for efficient data insertion and updating.

---

## 2. Search Policies by User Name

Searches policies using the user's name.

### Endpoint

```http
GET /api/policies/search?username=Lura%20Lucca
```

### cURL

```bash
curl --location 'http://localhost:5000/api/policies/search?username=Lura%20Lucca'
```

### Example

```text
GET /api/policies/search?username=Lura%20Lucca
```

Returns the user's policies along with related carrier and LOB information.

---

## 3. Get Policies by User

Returns policies aggregated/grouped by each user.

### Endpoint

```http
GET /api/policies/users
```

### cURL

```bash
curl --location 'http://localhost:5000/api/policies/users'
```

### Example Response

```json
{
    "success": true,
    "count": 1,
    "data": [
        {
            "user": {
                "_id": "64f123...",
                "firstName": "Lura Lucca",
                "email": "madler@yahoo.ca"
            },
            "policyCount": 2,
            "policies": [
                {
                    "policyNumber": "YEEX9MOIBU7X",
                    "policyStartDate": "2018-11-02T00:00:00.000Z",
                    "policyEndDate": "2019-11-02T00:00:00.000Z",
                    "policyCategory": {
                        "categoryName": "Commercial Auto"
                    },
                    "company": {
                        "companyName": "Integon Gen Ins Corp"
                    }
                }
            ]
        }
    ]
}
```

---

# Message Scheduler

Messages can be scheduled using the message API.

## Create Scheduled Message

### Endpoint

```http
POST /api/messages
```

### cURL

```bash
curl --location 'http://localhost:5000/api/messages' \
--header 'Content-Type: application/json' \
--data '{
    "message": "Hello World",
    "day": "2026-08-30",
    "time": "10:30"
}'
```

A background cron job checks pending messages and processes them when their scheduled time is reached.

The scheduler runs:

```js
cron.schedule("* * * * *", async () => {
    // Process pending messages
});
```

---

# CPU Monitoring

The Node.js server monitors CPU utilization.

When CPU usage reaches **70% or higher**, the application exits:

```js
if (cpu.currentLoad >= 70) {
    process.exit(1);
}
```

PM2 automatically restarts the application after the process exits.

---

# PM2 Ecosystem Configuration

`ecosystem.config.js`:

```js
module.exports = {
    apps: [
        {
            name: "insurance-policy-api",
            script: "./src/server.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M"
        }
    ]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
```

---

# Quick Start

```bash
npm install
pm2 start ecosystem.config.js
pm2 status
pm2 logs insurance-policy-api
```

## API

```text
http://localhost:5000
```

---

## Summary

| Feature           | Description                               |
| ----------------- | ----------------------------------------- |
| CSV Upload        | Bulk import insurance policy data         |
| User Search       | Search policies by username               |
| Policy Listing    | Get policies grouped by user              |
| Message Scheduler | Schedule and process messages             |
| CPU Monitoring    | Restart application when CPU reaches 70%+ |
| PM2               | Process management and automatic restart  |
| MongoDB           | Store insurance and user data             |
