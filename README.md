# InsightAI — AI-Powered Feedback Analyser

## Run on macOS

```bash
cd feedback_analyser
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

The first feedback analysis downloads the Hugging Face DistilBERT model. This can take a few minutes and requires an internet connection. Later runs use the cached model.

## Important implementation notes

- DistilBERT SST-2 is a binary positive/negative sentiment model. This project adds transparent neutral/mixed post-processing using lexical polarity signals; it does not claim that the pretrained model itself predicts all four classes.
- Aspect detection and issue grouping currently use explicit keyword dictionaries and sentence-level polarity heuristics. These are NLP components, but they are not a separately trained aspect-based sentiment model.
- Feedback and analysis are stored in `feedback.db`, created automatically.
- Dashboard data and charts are fetched from the Flask API and update after each submission/page refresh.
- Chart.js and Google Fonts are loaded from CDNs, so the UI needs internet access for those assets.

## API endpoints

- `POST /api/feedback` — submit and analyse feedback
- `GET /api/dashboard` — dashboard metrics
- `GET /api/history?sentiment=all|positive|negative|neutral|mixed` — history
- `DELETE /api/feedback/<id>` — delete one record
