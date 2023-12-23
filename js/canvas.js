const tile_width = 64;

function opposite(direction) {
  switch (direction) {
    case "t":
      return "b";
    case "b":
      return "t";
    case "l":
      return "r";
    case "r":
      return "l";
    default:
      return "";
  }
}

class GameSquare extends HTMLElement {
  /* Attributes "to" and "from" for direction and "tileset" for tileset pack to use */
  constructor() {
    super();
    this.image = document.createElement("img");
    this.appendChild(this.image);
    this.render();
  }

  static get observedAttributes() {
    return ["to", "from"];
  }

  attributeChangedCallback(_name, _oldValue, _newValue) {
    this.render();
  }

  get gameCanvas() {
    // TODO: This depends on the structure of the DOM, which isn't great
    return this.parentNode.parentNode;
  }

  get tileset() {
    return this.gameCanvas.getAttribute("tileset") || "lemon_beard";
  }

  assetName() {
    if (this.getAttribute("apple") === "true") return "apple";

    const from = this.getAttribute("from") || "";
    const to = this.getAttribute("to") || "";

    if (to === "" && from === "") return "blank";
    if (to === "") return `h${opposite(from)}`;
    if (from === "") return `e${opposite(to)}`;
    if (to === "l") return `l${from}`;
    if (from === "l") return `l${to}`;
    if (to === "t") return `t${from}`;
    if (from === "t") return `t${to}`;
    if (to === "r") return `r${from}`;
    if (from === "r") return `r${to}`;

    throw new Error(`Invalid direction: ${from} -> ${to}`);
  }

  assetFileName() {
    return `./tilesets/${this.tileset}/${this.assetName()}.svg`;
  }

  render() {
    this.image.src = this.assetFileName();
  }
}

class GameCanvas extends HTMLElement {
  constructor() {
    super();
    if (!this.hasAttribute("tileset")) {
      this.setAttribute("tileset", "lemon_beard");
    }
    this.createGameSquares();
    this.snake = [];
    this.apple = null;
    this.render();
  }

  static get observedAttributes() {
    return ["tileset"];
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "tileset") {
      appleIcon.src = `./tilesets/${newValue}/apple.svg`;
      this.render();
    }
  }

  get squares() {
    return this.querySelectorAll("game-square");
  }

  isApple(x, y) {
    if (!this.apple) return false;
    return this.apple[0] === x && this.apple[1] === y;
  }

  createSquare(x, y) {
    const square = document.createElement("game-square");
    square.id = `square-${x}-${y}`;
    return square;
  }

  createRow(width, y) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let x = 0; x < width; x++) {
      row.appendChild(this.createSquare(x, y));
    }
    return row;
  }

  /* Should only be run ONCE, during initialization */
  createGameSquares() {
    const game_width = this.getAttribute("game-width");
    const game_height = this.getAttribute("game-height");

    for (let y = 0; y < game_height; y++) {
      const row = this.createRow(game_width, y);
      this.appendChild(row);
    }
  }

  clear() {
    for (const square of this.squares) {
      square.setAttribute("to", "");
      square.setAttribute("from", "");
      square.removeAttribute("apple");
    }
  }

  renderSnake() {
    for (let i = 0; i < this.snake.length; i++) {
      const [x, y] = this.snake[i];
      const square = document.getElementById(`square-${x}-${y}`);
      if (i === 0) {
        square.setAttribute("from", "");
      } else {
        const [prevX, prevY] = this.snake[i - 1];
        if (prevX === x) {
          if (prevY < y) {
            square.setAttribute("from", "t");
          } else {
            square.setAttribute("from", "b");
          }
        } else {
          if (prevX < x) {
            square.setAttribute("from", "l");
          } else {
            square.setAttribute("from", "r");
          }
        }
      }
      if (i === this.snake.length - 1) {
        square.setAttribute("to", "");
      } else {
        const [nextX, nextY] = this.snake[i + 1];
        if (nextX === x) {
          if (nextY < y) {
            square.setAttribute("to", "t");
          } else {
            square.setAttribute("to", "b");
          }
        } else {
          if (nextX < x) {
            square.setAttribute("to", "l");
          } else {
            square.setAttribute("to", "r");
          }
        }
      }
    }
  }

  renderApple() {
    if (!this.apple) return;
    const [x, y] = this.apple;
    const square = document.getElementById(`square-${x}-${y}`);
    square.setAttribute("apple", "true");
  }

  render() {
    this.clear();
    this.renderSnake();
    this.renderApple();
  }
}

const appleIcon = document.getElementById("apple-icon");
customElements.define("game-canvas", GameCanvas);
customElements.define("game-square", GameSquare);
