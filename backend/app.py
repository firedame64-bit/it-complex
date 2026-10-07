"""IT Complex Academy Bamenda - backend API.

Plain Flask + SQLite. Run with:  python backend/app.py
In production it also serves the built React site from ../dist.
"""

import os
import re
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR.parent / "dist"
DB_PATH = Path(os.environ.get("ITCAB_DB", BASE_DIR / "itcab.db"))
SECRET_KEY = os.environ.get("ITCAB_SECRET", "change-this-secret-in-production")
ADMIN_EMAIL = os.environ.get("ITCAB_ADMIN_EMAIL", "admin@itcab.cm")
ADMIN_PASSWORD = os.environ.get("ITCAB_ADMIN_PASSWORD", "admin12345")
TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
REGISTRATION_FEE = 25000
LECTURE_MINUTES = 90
ONLINE_WINDOW_MINUTES = 5

SCHOOLS = [
    "School of Engineering & Technology",
    "School of Business",
    "School of Education",
    "Professional Certification Track",
]
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = Flask(__name__, static_folder=None)
app.config["SECRET_KEY"] = SECRET_KEY
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="itcab-auth")


# ─── Database ──────────────────────────────────────────────────────────────────
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    school TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    year INTEGER NOT NULL DEFAULT 1,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TEXT NOT NULL,
    last_seen TEXT
);
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT NOT NULL,
    user_id INTEGER,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT NOT NULL,
    start_time TEXT NOT NULL,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    url TEXT
);
CREATE TABLE IF NOT EXISTS fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    paid_at TEXT
);
CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    program TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""

SEED_SESSIONS = {
    "School of Engineering & Technology": [
        ("09:00", "Advanced Software Engineering", "Dr. Nkemdirim A."),
        ("11:00", "Database Systems & Architecture", "Mr. Fomba G."),
        ("14:00", "Network Security Fundamentals", "Ms. Achu B."),
        ("16:00", "Data Structures & Algorithms", "Mr. Tanyi F."),
    ],
    "School of Business": [
        ("09:00", "Business Finance and Management", "Mrs. Ngwa L."),
        ("11:00", "Digital Marketing Strategy", "Mr. Che P."),
        ("14:00", "Computerized Accounting", "Ms. Bih E."),
    ],
    "School of Education": [
        ("09:00", "Didactics & Curriculum Development", "Dr. Fon M."),
        ("11:00", "Guidance and Counselling", "Mrs. Ambe R."),
        ("14:00", "Educational Administration", "Mr. Nji K."),
    ],
    "Professional Certification Track": [
        ("10:00", "Full Stack Web Development", "Mr. Tanyi F."),
        ("13:00", "Data Analysis with Excel & Python", "Ms. Achu B."),
        ("15:00", "Networking & Cybersecurity Lab", "Mr. Fomba G."),
    ],
}

# Only real files. Add more rows (school=None means every school) when handouts exist in public/assets.
SEED_RESOURCES = [
    (None, "Class Sample PDF", "Preview class format", "/assets/class-sample.pdf"),
]

SEED_ANNOUNCEMENTS = [
    ("Welcome to the Student Portal", "Check your class timetable and course materials here, and chat with your classmates."),
    ("Registration fee reminder", "The 25,000 FCFA registration fee is paid in person at either campus finance desk."),
]


def now_iso():
    return datetime.now().isoformat(timespec="seconds")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.executescript(SCHEMA)
    if db.execute("SELECT COUNT(*) FROM sessions").fetchone()[0] == 0:
        for school, rows in SEED_SESSIONS.items():
            db.executemany(
                "INSERT INTO sessions (school, start_time, title, instructor) VALUES (?, ?, ?, ?)",
                [(school, *row) for row in rows],
            )
    if db.execute("SELECT COUNT(*) FROM resources").fetchone()[0] == 0:
        db.executemany("INSERT INTO resources (school, title, subtitle, url) VALUES (?, ?, ?, ?)", SEED_RESOURCES)
    if db.execute("SELECT COUNT(*) FROM announcements").fetchone()[0] == 0:
        db.executemany(
            "INSERT INTO announcements (title, body, created_at) VALUES (?, ?, ?)",
            [(t, b, now_iso()) for t, b in SEED_ANNOUNCEMENTS],
        )
    if db.execute("SELECT COUNT(*) FROM messages").fetchone()[0] == 0:
        db.executemany(
            "INSERT INTO messages (school, user_id, sender, text, created_at) VALUES (?, NULL, 'Instructor', ?, ?)",
            [(school, "Welcome class! Please check Course Materials before each session.", now_iso()) for school in SCHOOLS],
        )
    if not db.execute("SELECT 1 FROM users WHERE email = ?", (ADMIN_EMAIL,)).fetchone():
        db.execute(
            "INSERT INTO users (name, email, password_hash, school, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)",
            ("ITCAB Admin", ADMIN_EMAIL, generate_password_hash(ADMIN_PASSWORD), SCHOOLS[0], now_iso()),
        )
    db.commit()
    db.close()


# ─── Helpers ───────────────────────────────────────────────────────────────────
def error(message, status=400):
    return jsonify({"error": message}), status


def body():
    return request.get_json(silent=True) or {}


def clean(value, limit=200):
    return str(value or "").strip()[:limit]


def user_json(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "school": row["school"],
        "phone": row["phone"],
        "year": row["year"],
        "role": row["role"],
        "createdAt": row["created_at"],
    }


def issue_token(user_id):
    return serializer.dumps({"uid": user_id})


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:] if header.startswith("Bearer ") else ""
        try:
            data = serializer.loads(token, max_age=TOKEN_MAX_AGE)
        except SignatureExpired:
            return error("Your session has expired. Please log in again.", 401)
        except BadSignature:
            return error("Please log in to continue.", 401)
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE id = ?", (data.get("uid"),)).fetchone()
        if not user:
            return error("Account not found.", 401)
        # Only write "last seen" about once a minute; chat polling would otherwise write on every request.
        stale = (datetime.now() - timedelta(seconds=60)).isoformat(timespec="seconds")
        if not user["last_seen"] or user["last_seen"] < stale:
            db.execute("UPDATE users SET last_seen = ? WHERE id = ?", (now_iso(), user["id"]))
            db.commit()
        g.user = user
        return view(*args, **kwargs)

    return wrapper


def admin_required(view):
    @wraps(view)
    @login_required
    def wrapper(*args, **kwargs):
        if g.user["role"] != "admin":
            return error("Admin access only.", 403)
        return view(*args, **kwargs)

    return wrapper


def session_status(start_time, now):
    hour, minute = map(int, start_time.split(":"))
    start = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if now < start:
        return "upcoming"
    if now < start + timedelta(minutes=LECTURE_MINUTES):
        return "live"
    return "done"


# ─── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/api/auth/signup")
def signup():
    data = body()
    name = clean(data.get("name"), 100)
    email = clean(data.get("email"), 150).lower()
    password = str(data.get("password") or "")
    school = clean(data.get("school"), 100)

    if len(name) < 2:
        return error("Please enter your full name.")
    if not EMAIL_RE.match(email):
        return error("Please enter a valid email address.")
    if len(password) < 6:
        return error("Password must be at least 6 characters.")
    if school not in SCHOOLS:
        return error("Please select your school or program.")

    db = get_db()
    if db.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
        return error("An account with this email already exists. Try logging in.", 409)

    cur = db.execute(
        "INSERT INTO users (name, email, password_hash, school, created_at, last_seen) VALUES (?, ?, ?, ?, ?, ?)",
        (name, email, generate_password_hash(password), school, now_iso(), now_iso()),
    )
    db.execute(
        "INSERT INTO fees (user_id, label, amount, created_at) VALUES (?, 'Registration Fee', ?, ?)",
        (cur.lastrowid, REGISTRATION_FEE, now_iso()),
    )
    db.commit()
    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify({"token": issue_token(user["id"]), "user": user_json(user)}), 201


@app.post("/api/auth/login")
def login():
    data = body()
    email = clean(data.get("email"), 150).lower()
    password = str(data.get("password") or "")
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return error("Incorrect email or password.", 401)
    db.execute("UPDATE users SET last_seen = ? WHERE id = ?", (now_iso(), user["id"]))
    db.commit()
    return jsonify({"token": issue_token(user["id"]), "user": user_json(user)})


@app.get("/api/auth/me")
@login_required
def me():
    return jsonify({"user": user_json(g.user)})


@app.patch("/api/profile")
@login_required
def update_profile():
    data = body()
    db = get_db()
    user = g.user
    name = clean(data.get("name", user["name"]), 100)
    phone = clean(data.get("phone", user["phone"]), 30)
    school = clean(data.get("school", user["school"]), 100)

    if len(name) < 2:
        return error("Please enter your full name.")
    if school not in SCHOOLS:
        return error("Please select a valid school or program.")

    new_password = str(data.get("newPassword") or "")
    if new_password:
        if not check_password_hash(user["password_hash"], str(data.get("currentPassword") or "")):
            return error("Your current password is incorrect.")
        if len(new_password) < 6:
            return error("New password must be at least 6 characters.")
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(new_password), user["id"]))

    db.execute("UPDATE users SET name = ?, phone = ?, school = ? WHERE id = ?", (name, phone, school, user["id"]))
    db.commit()
    updated = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return jsonify({"user": user_json(updated)})


# ─── Dashboard ─────────────────────────────────────────────────────────────────
@app.get("/api/dashboard")
@login_required
def dashboard():
    db = get_db()
    school = g.user["school"]
    now = datetime.now()

    sessions = [
        {
            "id": row["id"],
            "time": row["start_time"],
            "title": row["title"],
            "instructor": row["instructor"],
            "status": session_status(row["start_time"], now),
        }
        for row in db.execute("SELECT * FROM sessions WHERE school = ? ORDER BY start_time", (school,))
    ]
    resources = [
        dict(row)
        for row in db.execute(
            "SELECT id, title, subtitle, url FROM resources WHERE url IS NOT NULL AND (school IS NULL OR school = ?) ORDER BY id",
            (school,),
        )
    ]
    online_since = (now - timedelta(minutes=ONLINE_WINDOW_MINUTES)).isoformat(timespec="seconds")
    online = db.execute(
        "SELECT COUNT(*) FROM users WHERE school = ? AND last_seen >= ?", (school, online_since)
    ).fetchone()[0]
    announcements = [
        dict(row) for row in db.execute("SELECT id, title, body, created_at AS createdAt FROM announcements ORDER BY id DESC LIMIT 10")
    ]
    return jsonify(
        {
            "sessions": sessions,
            "resources": resources,
            "online": online,
            "announcements": announcements,
            "serverTime": now.isoformat(timespec="seconds"),
        }
    )


@app.get("/api/fees")
@login_required
def fees():
    rows = get_db().execute(
        "SELECT id, label, amount, status, created_at AS createdAt, paid_at AS paidAt FROM fees WHERE user_id = ? ORDER BY id",
        (g.user["id"],),
    ).fetchall()
    items = [dict(r) for r in rows]
    total = sum(i["amount"] for i in items)
    paid = sum(i["amount"] for i in items if i["status"] == "paid")
    return jsonify({"items": items, "total": total, "paid": paid, "balance": total - paid})


# ─── Classroom chat ────────────────────────────────────────────────────────────
@app.get("/api/messages")
@login_required
def list_messages():
    after = request.args.get("after", 0, type=int)
    rows = get_db().execute(
        "SELECT id, user_id AS userId, sender, text, created_at AS createdAt FROM messages "
        "WHERE school = ? AND id > ? ORDER BY id DESC LIMIT 100",
        (g.user["school"], after),
    ).fetchall()
    return jsonify({"messages": [dict(r) for r in reversed(rows)]})


@app.post("/api/messages")
@login_required
def post_message():
    text = clean(body().get("text"), 1000)
    if not text:
        return error("Message cannot be empty.")
    sender = "Instructor" if g.user["role"] == "admin" else g.user["name"]
    db = get_db()
    cur = db.execute(
        "INSERT INTO messages (school, user_id, sender, text, created_at) VALUES (?, ?, ?, ?, ?)",
        (g.user["school"], g.user["id"], sender, text, now_iso()),
    )
    db.commit()
    row = db.execute(
        "SELECT id, user_id AS userId, sender, text, created_at AS createdAt FROM messages WHERE id = ?", (cur.lastrowid,)
    ).fetchone()
    return jsonify({"message": dict(row)}), 201


# ─── Public: admissions enquiries ──────────────────────────────────────────────
@app.post("/api/enquiries")
def create_enquiry():
    data = body()
    name = clean(data.get("name"), 100)
    phone = clean(data.get("phone"), 30)
    email = clean(data.get("email"), 150)
    program = clean(data.get("program"), 150)
    message = clean(data.get("message"), 2000)

    if len(name) < 2:
        return error("Please enter your name.")
    if len(re.sub(r"\D", "", phone)) < 8:
        return error("Please enter a valid phone number.")
    if email and not EMAIL_RE.match(email):
        return error("Please enter a valid email address or leave it empty.")

    db = get_db()
    db.execute(
        "INSERT INTO enquiries (name, phone, email, program, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (name, phone, email, program, message, now_iso()),
    )
    db.commit()
    return jsonify({"ok": True}), 201


# ─── Admin ─────────────────────────────────────────────────────────────────────
@app.get("/api/admin/overview")
@admin_required
def admin_overview():
    db = get_db()
    students = [
        {**user_json(row), "feesDue": row["due"] or 0}
        for row in db.execute(
            "SELECT u.*, (SELECT SUM(amount) FROM fees f WHERE f.user_id = u.id AND f.status = 'pending') AS due "
            "FROM users u WHERE role = 'student' ORDER BY u.id DESC"
        )
    ]
    enquiries = [
        dict(row)
        for row in db.execute(
            "SELECT id, name, phone, email, program, message, status, created_at AS createdAt FROM enquiries ORDER BY id DESC"
        )
    ]
    return jsonify({"students": students, "enquiries": enquiries})


@app.post("/api/admin/students/<int:user_id>/mark-paid")
@admin_required
def admin_mark_paid(user_id):
    db = get_db()
    db.execute(
        "UPDATE fees SET status = 'paid', paid_at = ? WHERE user_id = ? AND status = 'pending'", (now_iso(), user_id)
    )
    db.commit()
    return jsonify({"ok": True})


@app.patch("/api/admin/enquiries/<int:enquiry_id>")
@admin_required
def admin_update_enquiry(enquiry_id):
    status = clean(body().get("status"), 20)
    if status not in ("new", "contacted", "closed"):
        return error("Invalid status.")
    db = get_db()
    db.execute("UPDATE enquiries SET status = ? WHERE id = ?", (status, enquiry_id))
    db.commit()
    return jsonify({"ok": True})


@app.post("/api/admin/announcements")
@admin_required
def admin_announce():
    data = body()
    title = clean(data.get("title"), 150)
    text = clean(data.get("body"), 2000)
    if not title or not text:
        return error("Title and message are required.")
    db = get_db()
    db.execute("INSERT INTO announcements (title, body, created_at) VALUES (?, ?, ?)", (title, text, now_iso()))
    db.commit()
    return jsonify({"ok": True}), 201


@app.get("/api/health")
def health():
    return jsonify({"ok": True})


@app.errorhandler(404)
def not_found(_e):
    return error("Not found.", 404)


@app.errorhandler(405)
def not_allowed(_e):
    return error("Method not allowed.", 405)


@app.errorhandler(500)
def server_error(_e):
    return error("Something went wrong on the server. Please try again.", 500)


# ─── Frontend (built React app) ────────────────────────────────────────────────
@app.get("/")
@app.get("/<path:path>")
def serve_frontend(path=""):
    if path.startswith("api/"):
        return error("Not found.", 404)
    if not DIST_DIR.exists():
        return "Frontend not built yet. Run `npm run build`, or use `npm run dev` during development.", 503
    target = (DIST_DIR / path).resolve()
    if path and target.is_file() and target.is_relative_to(DIST_DIR.resolve()):
        return send_from_directory(DIST_DIR, path)
    # Any other path is a client-side page, so hand back the React app.
    return send_from_directory(DIST_DIR, "index.html")


init_db()

if __name__ == "__main__":
    if SECRET_KEY == "change-this-secret-in-production" or ADMIN_PASSWORD == "admin12345":
        print("WARNING: using the default ITCAB_SECRET / ITCAB_ADMIN_PASSWORD. Set your own before going live.")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
