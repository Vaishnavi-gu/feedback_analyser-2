from flask import Flask, render_template, request, jsonify
from database import init_db, save_feedback, get_feedback, delete_feedback, dashboard_data
from ai_engine import analyse_feedback

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

with app.app_context():
    init_db()

@app.get("/")
def dashboard():
    return render_template("dashboard.html")

@app.get("/analyse")
def analyse_page():
    return render_template("analyse.html")

@app.get("/history")
def history_page():
    return render_template("history.html")

@app.post("/api/feedback")
def submit_feedback():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("feedback") or "").strip()
    if not text:
        return jsonify({"error": "Please enter feedback before submitting."}), 400
    if len(text) > 3000:
        return jsonify({"error": "Feedback must be 3,000 characters or fewer."}), 400
    try:
        analysis = analyse_feedback(text)
        feedback_id = save_feedback(text, analysis)
        return jsonify({"id": feedback_id, "feedback": text, "analysis": analysis}), 201
    except Exception as exc:
        app.logger.exception("Feedback analysis failed")
        return jsonify({"error": f"Could not analyse feedback: {str(exc)}"}), 500

@app.get("/api/dashboard")
def get_dashboard():
    return jsonify(dashboard_data())

@app.get("/api/history")
def history():
    sentiment = request.args.get("sentiment", "all").lower()
    if sentiment not in {"all", "positive", "negative", "neutral", "mixed"}:
        sentiment = "all"
    return jsonify(get_feedback(sentiment))

@app.delete("/api/feedback/<int:feedback_id>")
def remove_feedback(feedback_id):
    if delete_feedback(feedback_id):
        return jsonify({"success": True})
    return jsonify({"error": "Feedback entry not found."}), 404

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
