import json
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).with_name("feedback.db")

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feedback TEXT NOT NULL,
                sentiment TEXT NOT NULL,
                confidence REAL NOT NULL,
                aspects TEXT NOT NULL,
                issues TEXT NOT NULL,
                keywords TEXT NOT NULL,
                recommendations TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

def save_feedback(text, analysis):
    with connect() as conn:
        cur = conn.execute("""
            INSERT INTO feedback
            (feedback, sentiment, confidence, aspects, issues, keywords, recommendations, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            text, analysis["sentiment"], analysis["confidence"],
            json.dumps(analysis["aspects"]), json.dumps(analysis["issues"]),
            json.dumps(analysis["keywords"]), json.dumps(analysis["recommendations"]),
            datetime.now().isoformat(timespec="seconds")
        ))
        return cur.lastrowid

def row_to_dict(row):
    return {
        "id": row["id"], "feedback": row["feedback"],
        "sentiment": row["sentiment"], "confidence": row["confidence"],
        "aspects": json.loads(row["aspects"]), "issues": json.loads(row["issues"]),
        "keywords": json.loads(row["keywords"]),
        "recommendations": json.loads(row["recommendations"]),
        "created_at": row["created_at"]
    }

def get_feedback(sentiment="all"):
    with connect() as conn:
        if sentiment == "all":
            rows = conn.execute("SELECT * FROM feedback ORDER BY id DESC").fetchall()
        else:
            rows = conn.execute("SELECT * FROM feedback WHERE sentiment=? ORDER BY id DESC", (sentiment,)).fetchall()
        return [row_to_dict(r) for r in rows]

def delete_feedback(feedback_id):
    with connect() as conn:
        cur = conn.execute("DELETE FROM feedback WHERE id=?", (feedback_id,))
        return cur.rowcount > 0

def dashboard_data():
    entries = get_feedback()
    total = len(entries)
    counts = {s: sum(1 for x in entries if x["sentiment"] == s) for s in ["positive", "negative", "neutral", "mixed"]}
    # Satisfaction is the percentage of entries whose overall label is positive.
    satisfaction = round((counts["positive"] / total) * 100, 1) if total else 0
    issue_counts, aspect_counts, daily = {}, {}, {}
    appreciated = {}
    for item in entries:
        day = item["created_at"][:10]
        daily[day] = daily.get(day, 0) + 1
        for issue in item["issues"]:
            issue_counts[issue] = issue_counts.get(issue, 0) + 1
        for aspect in item["aspects"]:
            name = aspect["aspect"]
            bucket = aspect_counts.setdefault(name, {"positive": 0, "negative": 0, "neutral": 0})
            bucket[aspect["sentiment"]] = bucket.get(aspect["sentiment"], 0) + 1
            if aspect["sentiment"] == "positive":
                appreciated[name] = appreciated.get(name, 0) + 1
    return {
        "total": total, "counts": counts, "satisfaction": satisfaction,
        "issues": sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:7],
        "aspects": aspect_counts,
        "appreciated": sorted(appreciated.items(), key=lambda x: x[1], reverse=True)[:5],
        "daily": sorted(daily.items())[-7:],
        "recent": entries[:5],
        "recommendations": [r for item in entries[:20] for r in item["recommendations"]][:8]
    }
