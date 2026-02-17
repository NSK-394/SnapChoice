SnapChoice Premium — Smart Decision Helper

SnapChoice Premium is a lightweight decision-support web application that helps users make better everyday decisions using a transparent weighted scoring model. It compares multiple options based on urgency, importance, and difficulty, then produces an explainable recommendation with confidence metrics.

Built as a fast, dependency-free frontend project for hackathon use and real-world practicality.

🚀 Features

Multi-criteria decision scoring (Urgency, Importance, Difficulty)

Weighted SnapScore formula

Deterministic tie-breaker logic

Confidence index based on score gap

Full score breakdown table

Visual comparison bars

Human-readable reasoning output

Shareable decision links (URL state encoding)

Recent decision history (localStorage)

Demo scenario loader

Responsive UI with dark mode support

No external JS frameworks

🧠 Scoring Model

The SnapScore is computed using:

Score
=
0.35
𝑈
+
0.40
𝐼
+
0.25
(
11
−
𝐷
)
Score=0.35U+0.40I+0.25(11−D)

Where:

U = Urgency (1–10)

I = Importance (1–10)

D = Difficulty (1–10, inverted)

Tie-breaking priority:

Higher Importance → Higher Urgency → Lower Difficulty

🛠 Tech Stack

HTML5

CSS3 (Glassmorphism + CSS variables)

Vanilla JavaScript (ES6+)

Vite (dev build tool)

localStorage persistence

Base64 URL fragment state sharing

▶️ Run Locally

Using Vite:

npm install
npm run dev


Then open the local dev URL shown in the terminal.

Or open index.html directly if using the static build.

📦 How It Works

Enter a decision context

Add 2–5 options

Rate urgency, importance, difficulty

Run analysis

View ranked results, confidence, and reasoning

Share or save decision state

🧪 Reliability Features

Input validation and trimming

Numeric clamping and NaN protection

Near-tie detection

Safe URL decode with error handling

History size limits

🔮 Future Improvements

Adjustable weighting modes

Additional decision factors

Advanced visual analytics

Optional AI-generated reasoning layer

📄 License

MIT License — free to use and modify.