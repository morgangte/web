import { Grid } from "./modules/grid.mjs";
import { Cell } from "./modules/cell.mjs";

window.addEventListener("load", main);

function main() {

    /* ------------------ Time ---------------------- */

    const timeTextElement = document.querySelector("#time-element");

    let timeCount = 0;

    function printTime() {
        if ((timeCount >= 600) && ((timeCount % 60) < 10)) {
            timeTextElement.textContent = "Temps : " + (Math.floor(timeCount / 60)).toString() + ":0" + (timeCount % 60).toString();
        } else if (timeCount >= 600) {
            timeTextElement.textContent = "Temps : " + (Math.floor(timeCount / 60)).toString() + ":" + (timeCount % 60).toString();
        } else if ((timeCount % 60) < 10) {
            timeTextElement.textContent = "Temps : 0" + (Math.floor(timeCount / 60)).toString() + ":0" + (timeCount % 60).toString();
        } else {
            timeTextElement.textContent = "Temps : 0" + (Math.floor(timeCount / 60)).toString() + ":" + (timeCount % 60).toString();
        }
    }

    setInterval(function () {
        if (snake.playing) {
            timeCount += 1;
            printTime();
        }
    }, 1000);

    /* --------------------- Snake ------------------- */

    let cv = document.querySelector("#game-canvas");
    let ctx = cv.getContext("2d");
    const scoreElement = document.querySelector("#snake-score-element");

    let snake;
    let initialSnakeLength;

    function applyDefaultSettings() {
        timeCount = 0;
        printTime();

        initialSnakeLength = 4;

        snake = new Snake(cv, ctx, scoreElement, 15, 15, 2000, 2000);
        snake.initializeSnake(15, 15, initialSnakeLength, "black", 125);
    }

    applyDefaultSettings();

    /* ----------------- Buttons -------------------- */

    /* restart */

    const restart_button = document.querySelector("#snake-restart-button");
    restart_button.addEventListener("click", function (e) {
        timeCount = 0;
        printTime();
        snake.stopInterval();
        snake.playing = false;
        snake.initializeSnake(snake.nbXCells, snake.nbYCells, initialSnakeLength, snake.snakeColor, snake.speed);
    });

    /* zoom */

    let zoom = 60;

    let gameboard = document.querySelector(".game-board");
    let game_top = document.querySelector(".game-top");
    let game_bottom = document.querySelector(".game-bottom");

    function updateZoom() {
        gameboard.style.setProperty("--zoom", zoom + "vh");
        game_top.style.setProperty("--zoom", zoom + "vh");
        game_bottom.style.setProperty("--zoom", zoom + "vh");
    }

    updateZoom();

    const zoom_plus_button = document.querySelector("#zoom-plus");
    zoom_plus_button.addEventListener("click", function (e) {
        if (zoom > 140) {
            return;
        }

        zoom += 20;
        updateZoom();
    });

    const zoom_minus_button = document.querySelector("#zoom-minus");
    zoom_minus_button.addEventListener("click", function (e) {
        if (zoom < 30) {
            return;
        }

        zoom -= 20;
        updateZoom();
    });

    /* default settings */

    const default_sett_button = document.querySelector("#default-settings");
    default_sett_button.addEventListener("click", function (e) {
        snake.stopInterval();
        applyDefaultSettings();
    });

    /* apply changes */

    /* --------------- Controls ---------------------- */

    window.addEventListener("keydown", function (e) {
        if (snake.lost) {
            return;
        }

        switch (e.key) {
            case "ArrowUp":
            case "z":
                if (snake.currentDirection != "S") {
                    snake.nextDirection = "N";
                }
                break;
            case "ArrowLeft":
            case "q":
                if (snake.currentDirection != "E") {
                    snake.nextDirection = "W";
                }
                break;
            case "ArrowDown":
            case "s":
                if (snake.currentDirection != "N") {
                    snake.nextDirection = "S";
                }
                break;
            case "ArrowRight":
            case "d":
                if (snake.currentDirection != "W") {
                    snake.nextDirection = "E";
                }
                break;
        }

        if (snake.playing == false) {
            snake.startInterval();
        }
    });
}

class SnakeCell extends Cell {
    constructor(cv, ctx, x, y, width, heigth, value) {
        super(cv, ctx, x, y, width, heigth, value);
    }

    drawShape(shape) {
        let coeff = Math.min(this.width, this.heigth);

        if (shape == "apple") {
            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff / 3, "red");
        }
    }
}

class Snake extends Grid {
    constructor(cv, ctx, scoreElement, nbXCells, nbYCells, width, heigth) {
        super(cv, ctx, nbXCells, nbYCells, width, heigth);
        this.gridDrawn = false;
        this.scoreElement = scoreElement;

        this.playing = false;
        this.lost;
        this.interval;
        this.currentDirection = "N";
        this.nextDirection = "N";

        this.grid;
        this.snake;
        this.snakeLength = 4;
        this.snakeColor = "black";
        this.speed = 200;
        this.appleEaten = false;
        this.score = 0;

        this.colors = ["#3fa04d", "#2a9134"];
    }

    drawEverything() {
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                if (this.getCellValue(i, j) == 1) {
                    this.grid[i][j].setColor(this.snakeColor, false);
                } else if (this.getCellValue(i, j) == -1) {
                    this.grid[i][j].setColor(this.colors[(i + j) % 2], false);
                    this.grid[i][j].drawShape("apple");
                } else {
                    this.grid[i][j].setColor(this.colors[(i + j) % 2], false);
                }
            }
        }
    }

    initializeSnake(nbXCells, nbYCells, snakeLength, snakeColor, speed) {
        this.nbXCells = nbXCells;
        this.nbYCells = nbYCells;

        this.grid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            this.grid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.grid[i][j] = new SnakeCell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0);
            }
        }

        this.snakeLength = snakeLength;
        this.snakeColor = snakeColor;
        this.speed = speed;
        this.currentDirection = "N";
        this.lost = false;
        this.score = 0;
        this.scoreElement.textContent = "Score : " + this.score;

        if (snakeLength > this.nbYCells / 2) {
            return;
        }

        this.snake = [];
        let x = Math.floor(this.nbXCells / 2);
        let y = Math.floor(this.nbYCells / 4);

        /* Initial apple */
        this.setCellValue(x, y, -1);
        this.appleEaten = false;

        /* Initial snake */
        for (let i = 0; i < this.snakeLength; i++) {
            y = Math.floor((this.nbYCells / 2) + i);

            this.snake.push([x, y]);
            this.setCellValue(x, y, 1);
        }

        this.drawEverything();
    }

    startInterval() {
        if (this.playing) {
            return;
        }

        this.playing = true;
        this.interval = setInterval(this.simulation.bind(this), this.speed);
    }

    stopInterval() {
        if (this.playing == false) {
            return;
        }

        this.playing = false;
        clearInterval(this.interval);
    }

    getRandomFreeCell() {
        let freeCells = [];
        let numberOfFreeCells = 0;

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                if (this.getCellValue(i, j) == 0) {
                    freeCells.push([i, j]);
                    numberOfFreeCells += 1;
                }
            }
        }

        let randomNumber = Math.floor(Math.random() * numberOfFreeCells);
        return [freeCells[randomNumber][0], freeCells[randomNumber][1]];
    }

    placeRandomApple() {
        let [x, y] = this.getRandomFreeCell();
        this.setCellValue(x, y, -1);
        this.appleEaten = false;
    }

    isSnakeThere(x, y) {
        if ((x < 0) || (x >= this.nbXCells) || (y < 0) || (y >= this.nbYCells)) {
            return false;
        }

        return (this.getCellValue(x, y) == 1);
    }

    simulation() {
        if (this.playing == false) {
            return;
        }

        let x, y;
        switch (this.nextDirection) {
            case "N":
                x = this.snake[0][0];
                y = this.snake[0][1] - 1;
                break;
            case "W":
                x = this.snake[0][0] - 1;
                y = this.snake[0][1];
                break;
            case "S":
                x = this.snake[0][0];
                y = this.snake[0][1] + 1;
                break;
            case "E":
                x = this.snake[0][0] + 1;
                y = this.snake[0][1];
                break;
        }
        this.currentDirection = this.nextDirection;

        if (this.isSnakeThere(x, y) || (x < 0) || (x >= this.nbXCells) || (y < 0) || (y >= this.nbYCells)) {
            this.lost = true;
            this.stopInterval();
            return;
        }

        if (this.getCellValue(x, y) == -1) {
            this.appleEaten = true;
        }

        this.snake.unshift([x, y]);
        this.setCellValue(x, y, 1);

        if (this.appleEaten) {
            this.placeRandomApple();
            this.snakeLength += 1;
            this.score += 1;
            this.scoreElement.textContent = "Score : " + this.score;
        } else {
            [x, y] = this.snake.pop();
            this.setCellValue(x, y, 0);
        }

        this.drawEverything();
    }
}