# Resolve Now

Your platform for online complaints.

## Project Structure

```
likitha_proj/
├── back-end/
│   ├── app.py            # Flask REST API
│   ├── requirements.txt  # Python dependencies
│   └── complaints.db     # SQLite database (auto-created)
├── front-end/
│   ├── index.html        # Main HTML page
│   ├── style.css         # Stylesheet
│   └── script.js         # JavaScript (API calls & page routing)
└── readme.md
```

## Features

- Submit complaints with name, email, category, subject, and description
- Track complaint status using complaint ID or email
- Admin panel to resolve or reject pending complaints
- Dashboard with real-time complaint statistics
- Color-coded status badges (Pending, Resolved, Rejected)

## Tech Stack

- **Backend:** Python, Flask, SQLite
- **Frontend:** HTML, CSS, JavaScript

## How to Run

### 1. Install dependencies

```
cd back-end
pip install -r requirements.txt
```

### 2. Start the backend server

```
python app.py
```

The API will run on `http://127.0.0.1:5000`

### 3. Open the frontend

Open `front-end/index.html` in a web browser.

## API Endpoints

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| GET    | /api/stats                       | Get complaint statistics |
| GET    | /api/complaints                  | Get all complaints       |
| GET    | /api/complaints/recent           | Get 5 recent complaints  |
| POST   | /api/complaints                  | Submit a new complaint   |
| POST   | /api/complaints/search           | Search by ID or email    |
| POST   | /api/complaints/{id}/update      | Resolve or reject        |
