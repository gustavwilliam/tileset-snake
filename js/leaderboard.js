class GameLeaderboard extends HTMLElement {
  constructor() {
    super();
    this.allScores = [];
    this.lastScore = null;
  }

  updateAllScores() {
    const scores = localStorage.getItem("allScores");
    if (scores) this.allScores = JSON.parse(scores);
  }

  updateLastScore() {
    const score = localStorage.getItem("lastScore");
    if (score) this.lastScore = score;
  }

  get highScores() {
    return this.allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((score) => {
        return {
          score: score.score,
          date: new Date(score.date).toLocaleDateString(),
        };
      });
  }

  unsetLastScore() {
    localStorage.removeItem("lastScore");
  }

  padded(score) {
    return score.toString().padStart(3);
  }

  getScoreLi(score, date) {
    const li = document.createElement("li");
    li.classList.add("flex", "justify-between");
    const dateSpan = document.createElement("span");
    dateSpan.innerText = date;
    const scoreSpan = document.createElement("span");
    scoreSpan.innerText = this.padded(score);
    li.appendChild(scoreSpan);
    li.appendChild(dateSpan);
    return li;
  }

  render() {
    this.updateAllScores();
    this.updateLastScore();
    const ol = document.createElement("ol");
    ol.classList.add("font-mono");
    let gameMarked = false;

    for (const score of this.highScores) {
      const li = this.getScoreLi(score.score, score.date);
      if (
        score.score.toString() === this.lastScore &&
        new Date().toLocaleDateString() ===
          new Date(score.date).toLocaleDateString() &&
        !gameMarked
      ) {
        li.classList.add("text-yellow-500");
        li.children[1].innerText = "Now";
        gameMarked = true;
      }
      ol.appendChild(li);
    }
    if (
      this.lastScore &&
      this.highScores.length > 4 &&
      this.lastScore < this.highScores[4].score
    ) {
      const dotDotDot = document.createElement("li");
      dotDotDot.innerText = "...";
      ol.appendChild(dotDotDot);
      const lastScoreLi = this.getScoreLi(this.lastScore, "Now");
      lastScoreLi.classList.add("text-yellow-500");
      ol.appendChild(lastScoreLi);
    }

    if (this.highScores.length === 0) {
      const li = document.createElement("li");
      li.innerText = "No scores yet!";
      ol.appendChild(li);
    }

    this.appendChild(ol);
    this.unsetLastScore();
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("game-leaderboard", GameLeaderboard);
