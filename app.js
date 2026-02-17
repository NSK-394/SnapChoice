let optionsCount = 0;
const container = document.getElementById('options-container');

document.addEventListener('DOMContentLoaded', () => {
    const sharedData = window.location.hash.substring(1);
    if (sharedData) {
        try {
            const decoded = decodeURIComponent(atob(sharedData));
            const data = JSON.parse(decoded);
            restoreState(data);
            showMessage("Shared decision loaded!", "success");
        } catch (e) {
            console.error('Failed to restore shared state', e);
            showMessage("Could not load shared link. It might be corrupted.", "error");
            initDefault();
        }
    } else {
        initDefault();
    }

    document.getElementById('add-option').addEventListener('click', addOption);
    document.getElementById('get-recommendation').addEventListener('click', runScoring);
    document.getElementById('reset-app').addEventListener('click', resetApp);
    document.getElementById('share-decision').addEventListener('click', shareDecision);
    document.getElementById('load-example').addEventListener('click', loadExample);
    document.getElementById('toggle-how-to').addEventListener('click', toggleHowTo);

    updateHistoryUI();
});

function toggleHowTo() {
    const content = document.getElementById('how-to-content');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

function loadExample() {
    const example = {
        context: "Best weekend project approach",
        options: [
            { name: "Build MVP Fast", urgency: 9, importance: 8, difficulty: 4 },
            { name: "Deep Research Mode", urgency: 4, importance: 9, difficulty: 8 },
            { name: "Learn New Framework", urgency: 6, importance: 7, difficulty: 9 }
        ]
    };
    restoreState(example);
    showMessage("Example scenario loaded!", "success");
}

function showMessage(text, type = "warning") {
    const msgArea = document.getElementById('message-area');
    msgArea.textContent = text;
    msgArea.className = `message-banner ${type}`;
    msgArea.style.display = 'block';
    setTimeout(() => {
        msgArea.style.display = 'none';
    }, 5000);
}

function initDefault() {
    addOption();
    addOption();
}

function restoreState(data) {
    document.getElementById('decision-context').value = data.context || '';
    container.innerHTML = '';
    optionsCount = 0;
    data.options.forEach(opt => {
        addOptionWithData(opt);
    });
}

function addOptionWithData(data) {
    addOption();
    const lastCard = container.lastElementChild;
    lastCard.querySelector('.option-name').value = data.name;
    lastCard.querySelector('.urgency-slider').value = data.urgency;
    lastCard.querySelector('.importance-slider').value = data.importance;
    lastCard.querySelector('.difficulty-slider').value = data.difficulty;

    const id = lastCard.id;
    updateSliderValue(`${id}-urgency-val`, data.urgency);
    updateSliderValue(`${id}-importance-val`, data.importance);
    updateSliderValue(`${id}-difficulty-val`, data.difficulty);
}

function addOption() {
    if (optionsCount >= 5) return;

    optionsCount++;
    const optionId = `option-${Date.now()}`;
    const card = document.createElement('div');
    card.className = 'option-card new-card';
    card.id = optionId;

    card.innerHTML = `
        <div class="card-header">
            <h3>Option ${optionsCount}</h3>
            ${optionsCount > 2 ? `<button class="remove-btn" onclick="removeOption('${optionId}')" aria-label="Remove option">×</button>` : ''}
        </div>
        <div class="card-body">
            <input type="text" class="option-name" placeholder="Enter option name..." aria-label="Option name">
            
            <div class="slider-group">
                <div class="slider-label-row">
                    <label>🔥 Urgency</label>
                    <span class="value-badge" id="${optionId}-urgency-val">5</span>
                </div>
                <input type="range" class="slider urgency-slider" min="1" max="10" value="5" 
                    oninput="updateSliderValue('${optionId}-urgency-val', this.value)">
                <div class="slider-hints">
                    <span>Low (1)</span>
                    <span>High (10)</span>
                </div>
            </div>

            <div class="slider-group">
                <div class="slider-label-row">
                    <label>⭐ Importance</label>
                    <span class="value-badge" id="${optionId}-importance-val">5</span>
                </div>
                <input type="range" class="slider importance-slider" min="1" max="10" value="5" 
                    oninput="updateSliderValue('${optionId}-importance-val', this.value)">
                <div class="slider-hints">
                    <span>Low (1)</span>
                    <span>High (10)</span>
                </div>
            </div>

            <div class="slider-group">
                <div class="slider-label-row">
                    <label>🧗 Difficulty</label>
                    <span class="value-badge" id="${optionId}-difficulty-val">5</span>
                </div>
                <input type="range" class="slider difficulty-slider" min="1" max="10" value="5" 
                    oninput="updateSliderValue('${optionId}-difficulty-val', this.value)">
                <div class="slider-hints">
                    <span>Easy (1)</span>
                    <span>Hard (10)</span>
                </div>
            </div>
        </div>
    `;

    container.appendChild(card);
    updateAddButton();
}

function removeOption(id) {
    const card = document.getElementById(id);
    if (card) {
        card.remove();
        optionsCount--;
        reindexOptions();
        updateAddButton();
    }
}

function reindexOptions() {
    const cards = container.querySelectorAll('.option-card');
    cards.forEach((card, index) => {
        card.querySelector('h3').textContent = `Option ${index + 1}`;
    });
}

function updateSliderValue(badgeId, value) {
    document.getElementById(badgeId).textContent = value;
}

function updateAddButton() {
    const btn = document.getElementById('add-option');
    btn.style.display = optionsCount >= 5 ? 'none' : 'block';
}

function shareDecision() {
    const state = {
        context: document.getElementById('decision-context').value,
        options: getOptionsData()
    };
    try {
        const json = JSON.stringify(state);
        const b64 = btoa(encodeURIComponent(json));
        const url = `${window.location.origin}${window.location.pathname}#${b64}`;

        if (url.length > 2000) {
            showMessage("Decision is too large to share via URL. Try reducing option names.", "error");
            return;
        }

        navigator.clipboard.writeText(url).then(() => {
            const btn = document.getElementById('share-decision');
            const originalText = btn.textContent;
            btn.textContent = '✅ Link Copied!';
            setTimeout(() => btn.textContent = originalText, 2000);
        });
    } catch (e) {
        showMessage("Failed to generate share link.", "error");
    }
}

function getOptionsData() {
    const cards = container.querySelectorAll('.option-card');
    return Array.from(cards).map(card => ({
        name: card.querySelector('.option-name').value,
        urgency: parseInt(card.querySelector('.urgency-slider').value),
        importance: parseInt(card.querySelector('.importance-slider').value),
        difficulty: parseInt(card.querySelector('.difficulty-slider').value)
    }));
}

function calculateScore(urgency, importance, difficulty) {
    return (0.35 * urgency) + (0.40 * importance) + (0.25 * (11 - difficulty));
}

function calculateConfidence(topScore, secondScore) {
    const gap = ((topScore - secondScore) / topScore) * 100;
    return Math.min(Math.round(gap), 99);
}

function runScoring() {
    const cards = container.querySelectorAll('.option-card');
    const results = [];
    const context = document.getElementById('decision-context').value.trim();

    if (!context) {
        showMessage("Note: Adding a decision context helps keep track of results!", "warning");
    }

    cards.forEach(card => {
        const nameInput = card.querySelector('.option-name').value.trim().substring(0, 60);
        if (!nameInput && results.length >= 2) return;

        const name = nameInput || `Option ${results.length + 1}`;

        const getVal = (selector) => {
            const val = parseInt(card.querySelector(selector).value);
            return isNaN(val) ? 5 : Math.max(1, Math.min(10, val));
        };

        const urgency = getVal('.urgency-slider');
        const importance = getVal('.importance-slider');
        const difficulty = getVal('.difficulty-slider');

        const score = calculateScore(urgency, importance, difficulty);

        results.push({ name, urgency, importance, difficulty, score });
    });

    if (results.length < 2) {
        showMessage("Please enter at least 2 valid options to compare.", "error");
        return;
    }

    const allSame = results.every(r =>
        r.urgency === results[0].urgency &&
        r.importance === results[0].importance &&
        r.difficulty === results[0].difficulty
    );
    if (allSame && results.length > 1) {
        showMessage("Low differentiation — adjust priorities for a better recommendation.", "warning");
    }

    results.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;

        if (b.importance !== a.importance) return b.importance - a.importance;
        if (b.urgency !== a.urgency) return b.urgency - a.urgency;
        return a.difficulty - b.difficulty;
    });

    if (results.length > 1 && Math.abs(results[0].score - results[1].score) <= 0.2) {
        showMessage("Extremely close scores! Review the breakdown table to see the tie-breaker logic.", "warning");
    }

    displayResults(results);
}

function displayResults(results) {
    const winner = results[0];
    const second = results[1] || { score: 0 };
    const confidence = calculateConfidence(winner.score, second.score);

    const resultsSection = document.getElementById('results-section');

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-score-badge').textContent = `Score: ${winner.score.toFixed(1)} / 10`;
    document.getElementById('confidence-label').textContent = `Confidence: ${confidence}%`;

    const bar = document.getElementById('confidence-bar');
    bar.style.width = '0';

    const chart = document.getElementById('comparison-chart');
    const tableBody = document.querySelector('#score-breakdown-table tbody');
    chart.innerHTML = '';
    tableBody.innerHTML = '';

    results.forEach((res, idx) => {
        const row = document.createElement('div');
        row.className = 'chart-row';
        row.innerHTML = `
            <div class="chart-label" title="${res.name}">${res.name}</div>
            <div class="chart-bar-container">
                <div class="chart-bar ${idx === 0 ? 'winner' : ''}" style="width: 0"></div>
            </div>
            <div class="chart-score">${res.score.toFixed(1)}</div>
        `;
        chart.appendChild(row);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${res.name}</strong></td>
            <td>${res.urgency}</td>
            <td>${res.importance}</td>
            <td>${res.difficulty}</td>
            <td><strong>${res.score.toFixed(1)}</strong></td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById('reasoning-text').textContent = generateReasoning(winner);

    resultsSection.style.display = 'block';
    document.getElementById('share-decision').style.display = 'block';

    saveToHistory({
        context: document.getElementById('decision-context').value || 'Decision',
        winner: results[0].name,
        score: results[0].score,
        timestamp: new Date().toISOString()
    });

    requestAnimationFrame(() => {
        resultsSection.classList.add('visible');

        setTimeout(() => {
            bar.style.width = `${confidence}%`;

            const chartBars = chart.querySelectorAll('.chart-bar');
            results.forEach((res, idx) => {
                chartBars[idx].style.width = `${(res.score / 10) * 100}%`;
            });
        }, 100);
    });

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function saveToHistory(item) {
    const history = JSON.parse(localStorage.getItem('snapchoice_history') || '[]');
    history.unshift(item);
    localStorage.setItem('snapchoice_history', JSON.stringify(history.slice(0, 5)));
    updateHistoryUI();
}

function updateHistoryUI() {
    const history = JSON.parse(localStorage.getItem('snapchoice_history') || '[]');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');

    if (history.length === 0) {
        historySection.style.display = 'none';
        return;
    }

    historySection.style.display = 'block';
    historyList.innerHTML = history.map(item => `
        <div class="history-item card-bg" style="padding: 12px; margin-bottom: 8px; border-radius: 8px; background: rgba(var(--primary-blue-rgb), 0.05); border: 1px solid var(--border-color);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(item.timestamp).toLocaleDateString()}</div>
            <div style="font-weight: 600;">${item.context}</div>
            <div style="font-size: 0.85rem;">Winner: <span style="color: var(--primary-blue)">${item.winner}</span> (${item.score.toFixed(1)})</div>
        </div>
    `).join('');
}

function generateReasoning(winner) {
    const { name, urgency, importance, difficulty, score } = winner;

    if (importance >= urgency && importance >= difficulty) {
        return `${name} stands out as your best choice. It scored ${importance}/10 on importance, suggesting it delivers the most long-term value. With an urgency score of ${urgency} and a difficulty of ${difficulty}/10, it's the option most worth your energy right now.`;
    }

    if (urgency > importance && urgency >= difficulty) {
        return `Given the time-sensitivity of your options, ${name} rises to the top. Its urgency score of ${urgency}/10 suggests it needs attention now. Paired with an importance score of ${importance}/10, this is your most time-critical and valuable task.`;
    }

    return `${name} offers the best overall balance. No single factor dominates, but together — urgency ${urgency}, importance ${importance}, difficulty ${difficulty} — it achieves the strongest composite SnapScore of ${score.toFixed(1)} out of 10.`;
}

function resetApp() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('visible');

    setTimeout(() => {
        resultsSection.style.display = 'none';
        document.getElementById('decision-context').value = '';
        container.innerHTML = '';
        optionsCount = 0;
        addOption();
        addOption();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
}

window.removeOption = removeOption;
window.updateSliderValue = updateSliderValue;
