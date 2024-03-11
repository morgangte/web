import { Grid } from "./modules/grid.mjs";
import { Cell } from "./modules/cell.mjs";

window.addEventListener("load", main);

function main() {
    let cv = document.querySelector("#game-canvas");
    let ctx = cv.getContext("2d");

    let bb = new BrickBreaker(cv, ctx, scoreElement, 15, 15, 2000, 2000);


}

class BrickBreakerCell extends Cell {
    constructor(cv, ctx, x, y, width, heigth, value) {
        super(cv, ctx, x, y, width, heigth, value);
    }
}

class BrickBreaker extends Grid {
    constructor(cv, ctx, scoreElement, nbXCells, nbYCells, width, heigth) {
        super(cv, ctx, scoreElement, nbXCells, nbYCells, width, heigth);

        this.playing = false;
    }

    drawEverything() {

    }

    initializeGame() {
        this.nbXCells = nbXCells;
        this.nbYCells = nbYCells;

        this.grid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            this.grid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.grid[i][j] = new BrickBreakerCell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0);
            }
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < 5; j++) {

            }
        }
    }

    startGame() {
        this.playing = true;
        requestAnimationFrame(this.simulation());
    }

    stopGame() {
        this.playing = false;
    }

    simulation() {

        if (this.playing) {
            requestAnimationFrame(this.simulation());
        }

    }
}