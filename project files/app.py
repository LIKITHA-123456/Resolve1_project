from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import sqlite3, os

app = Flask(__name__)
CORS(app)
DB = os.path.join(os.path.dirname(__file__), 'complaints.db')

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    conn.execute('''CREATE TABLE IF NOT EXISTS complaints(
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, category TEXT,
        subject TEXT, description TEXT, status TEXT DEFAULT 'Pending',
        created TEXT, updated TEXT)''')
    conn.commit()
    return conn

def row_to_dict(row):
    return dict(row) if row else None

@app.route('/api/stats')
def stats():
    c = get_db()
    total = c.execute('SELECT COUNT(*) FROM complaints').fetchone()[0]
    pending = c.execute("SELECT COUNT(*) FROM complaints WHERE status='Pending'").fetchone()[0]
    resolved = c.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved'").fetchone()[0]
    rejected = c.execute("SELECT COUNT(*) FROM complaints WHERE status='Rejected'").fetchone()[0]
    c.close()
    return jsonify(total=total, pending=pending, resolved=resolved, rejected=rejected)

@app.route('/api/complaints')
def get_complaints():
    c = get_db()
    rows = c.execute('SELECT * FROM complaints ORDER BY id DESC').fetchall()
    c.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/complaints/recent')
def recent_complaints():
    c = get_db()
    rows = c.execute('SELECT * FROM complaints ORDER BY id DESC LIMIT 5').fetchall()
    c.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    data = request.json
    now = datetime.now().isoformat()
    c = get_db()
    cur = c.execute(
        'INSERT INTO complaints(name,email,category,subject,description,created,updated) VALUES(?,?,?,?,?,?,?)',
        (data['name'], data['email'], data['category'], data['subject'], data['description'], now, now))
    c.commit()
    cid = cur.lastrowid
    c.close()
    return jsonify(id=cid, message=f'Complaint #{cid} submitted successfully!'), 201

@app.route('/api/complaints/search', methods=['POST'])
def search_complaints():
    data = request.json
    q = data.get('query', '').strip()
    c = get_db()
    if q.isdigit():
        rows = c.execute('SELECT * FROM complaints WHERE id=?', (int(q),)).fetchall()
    else:
        rows = c.execute('SELECT * FROM complaints WHERE email=? ORDER BY id DESC', (q,)).fetchall()
    c.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/complaints/<int:cid>/update', methods=['POST'])
def update_status(cid):
    data = request.json
    action = data.get('action')
    now = datetime.now().isoformat()
    c = get_db()
    c.execute('UPDATE complaints SET status=?, updated=? WHERE id=?', (action, now, cid))
    c.commit()
    c.close()
    return jsonify(message=f'Complaint #{cid} marked as {action}!')

if __name__ == '__main__':
    print("Backend API running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
