import { Cell } from "./modules/cell.mjs";
import { Grid } from "./modules/grid.mjs";

window.addEventListener("load", main);

function main() {
    const cv = document.querySelector("#grid-canvas");
    const ctx = cv.getContext("2d");

    let de = new Demineur(cv, ctx, 50, 50, 1900, 1900, 1000);
    de.initializeGrid();

    const restart_button = document.querySelector("#restart-button");
    restart_button.addEventListener("click", function (e) {
        de.initializeGrid();
    });

    de.cv.addEventListener("click", function (e) {
        let [x, y] = de.getCellCoordinates(e);

        if (de.playing == false) {
            return;
        }

        if (de.isCellFlagged(x, y)) {
            return;
        }

        if (de.firstMove) {
            de.setMines(x, y);
            de.firstMove = false;
        }

        if (de.isCellUnveiled(x, y) && (de.getCellValue(x, y) > 0)) {
            de.unveilAdjacentCells(x, y);
        } else {
            de.unveilCell(x, y);
        }
    });

    de.cv.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    de.cv.addEventListener("auxclick", function (e) {
        let [x, y] = de.getCellCoordinates(e);

        if (de.playing == false) {
            return;
        }

        if (de.isCellUnveiled(x, y)) {
            return;
        }

        if (de.isCellFlagged(x, y)) {
            de.unflagCell(x, y);
        } else {
            de.flagCell(x, y);
        }
    });

}

class DemineurCell extends Cell {
    constructor(cv, ctx, x, y, width, heigth, value) {
        super(cv, ctx, x, y, width, heigth, value);

        this.unveiled = false;
        this.flagged = false;

        this.gridDrawn = true;
    }

    drawLine(x_start, y_start, x_end, y_end, lineWidth, color) {
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;

        this.ctx.moveTo(x_start, y_start);
        this.ctx.lineTo(x_end, y_end);
        this.ctx.stroke();

        this.ctx.closePath();
    }

    drawDisc(x, y, r, color) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = color;

        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.closePath();
    }

    drawNumber() {
        const colors = ["blue", "green", "red", "navy", "purple", "orange", "aqua", "maroon"];

        this.ctx.fillStyle = colors[this.value - 1];
        this.ctx.font = (this.heigth * 2 / 4) + "px Monospace";
        this.ctx.fillText(this.value, (this.x + this.width * (21 / 60)), (this.y + this.heigth * (21 / 30)));
    }

    drawShape(shape) {
        let coeff = Math.min(this.width, this.heigth);

        if (shape == "explosion") {
            this.setColor("red", true);

            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff * 11 / 30, "orange");
            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff / 5, "yellow");
            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff / 10, "white");
        } else if (shape == "bomb") {
            this.setColor("orange", true);
            this.drawDisc((this.x + coeff * (1 / 2)), (this.y + coeff * (1 / 2)), coeff * 7 / 30, "black");

            this.drawLine((this.x + coeff * (1 / 2)), (this.y + coeff * (1 / 6)), (this.x + coeff * (1 / 2)), (this.y + coeff * (5 / 6)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (4 / 15)), (this.y + coeff * (4 / 15)), (this.x + coeff * (11 / 15)), (this.y + coeff * (11 / 15)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (4 / 15)), (this.y + coeff * (11 / 15)), (this.x + coeff * (11 / 15)), (this.y + coeff * (4 / 15)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (1 / 6)), (this.y + coeff * (1 / 2)), (this.x + coeff * (5 / 6)), (this.y + coeff * (1 / 2)), coeff / 15, "black");
        } else if (shape == "flag") {
            this.drawLine((this.x + coeff * (11 / 30)), (this.y + coeff * (23 / 30)), (this.x + coeff * (23 / 30)), (this.y + coeff * (23 / 30)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (17 / 30)), (this.y + coeff * (1 / 6)), (this.x + coeff * (17 / 30)), (this.y + coeff * (23 / 30)), coeff / 15, "black");

            this.drawLine((this.x + 1 + coeff * (7 / 15)), (this.y + coeff * (7 / 30)), (this.x + 1 + coeff * (7 / 15)), (this.y + coeff * (17 / 30)), coeff / 10, "red");
            this.drawLine((this.x + 1 + coeff * (11 / 30)), (this.y + coeff * (9 / 30)), (this.x + 1 + coeff * (11 / 30)), (this.y + coeff * (1 / 2)), coeff / 10, "red");
            this.drawLine((this.x + 1 + coeff * (4 / 15)), (this.y + coeff * (11 / 30)), (this.x + 1 + coeff * (4 / 15)), (this.y + coeff * (13 / 30)), coeff / 10, "red");
        }
    }

    isMined() {
        return (this.value == -1);
    }

    isFree() {
        return (this.value == 0);
    }

    isUnveiled() {
        return this.unveiled;
    }

    isFlagged() {
        return this.flagged;
    }

    flag() {
        this.drawShape("flag");
        this.flagged = true;
    }

    unflag() {
        this.setColor("grey", true);
        this.flagged = false;
    }

    unveil() {
        this.setColor("white", true);

        if (this.value > 0) {
            this.drawNumber();
        }

        this.unveiled = true;
    }
}

class Demineur extends Grid {
    constructor(cv, ctx, nbXCells, nbYCells, width, heigth, nbMines) {
        super(cv, ctx, nbXCells, nbYCells, width, heigth);

        this.nbMines = nbMines;
        this.minesLeftToDiscover;

        this.firstMove = true;
        this.playing = true;

        this.gridDrawn = true;
    }

    initializeGrid() {
        this.grid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            this.grid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.grid[i][j] = new DemineurCell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0);
            }
        }

        this.drawGrid("black");
        this.setColor("grey");
        this.drawGrid("black");

        this.firstMove = true;
        this.playing = true;
    }

    setMines(except_x, except_y) {
        const [except_Xs, except_Ys] = this.getAdjacentCells(except_x, except_y, true);

        let minesLeftToPlace = this.nbMines;

        if (minesLeftToPlace > this.nbXCells * this.nbYCells - 9) {
            return;
        }

        this.minesLeftToDiscover = minesLeftToPlace;

        /* avoid placing mines around the first click */
        this.grid[except_x][except_y].setValue(-1);

        for (let k = 0; k < except_Xs.length; k++) {
            this.grid[except_Xs[k]][except_Ys[k]].setValue(-1);
        }

        /* placing the real mines */
        let i;
        let j;
        while (minesLeftToPlace > 0) {
            i = Math.floor(Math.random() * this.nbXCells);
            j = Math.floor(Math.random() * this.nbYCells);

            if (this.grid[i][j].getValue() == 0) {
                this.grid[i][j].setValue(-1);
                minesLeftToPlace -= 1;
            }
        }

        /* no mines around the first click */
        this.grid[except_x][except_y].setValue(0);

        for (let k = 0; k < except_Xs.length; k++) {
            this.grid[except_Xs[k]][except_Ys[k]].setValue(0);
        }

        /* Compute the values of each cell */
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                if (this.grid[i][j].isMined() == false) {
                    this.grid[i][j].setValue(this.computeMinesNearCell(i, j));
                }
            }
        }
    }

    computeMinesNearCell(x, y) {
        const [Xs, Ys] = this.getAdjacentCells(x, y, true);
        let m = 0;

        for (let i = 0; i < Xs.length; i++) {
            if (this.grid[Xs[i]][Ys[i]].isMined()) {
                m += 1;
            }
        }

        return m;
    }

    isCellFlagged(x, y) {
        return this.grid[x][y].isFlagged();
    }

    flagCell(x, y) {
        this.grid[x][y].flag();
        this.minesLeftToDiscover -= 1;
    }

    unflagCell(x, y) {
        this.grid[x][y].unflag();
        this.minesLeftToDiscover += 1;
    }

    isCellUnveiled(x, y) {
        return this.grid[x][y].isUnveiled();
    }

    unveilCell(x, y) {
        if (this.grid[x][y].isFlagged()) {
            return;
        }

        if (this.grid[x][y].isMined()) {
            this.revealMines();
            this.grid[x][y].drawShape("explosion");
            this.playing = false;

        } else if (this.grid[x][y].getValue() == 0) {
            this.updateFreeCells(x, y);

        } else {
            this.grid[x][y].unveil();
        }
    }

    unveilAdjacentCells(x, y) {
        const [Xs, Ys] = this.getAdjacentCells(x, y, true);

        /* verify that the number of flagged cells is equal to the number of the cell */
        let flaggedCells = 0;
        for (let i = 0; i < Xs.length; i++) {
            if (this.grid[Xs[i]][Ys[i]].isFlagged()) {
                flaggedCells += 1;
            }
        }

        if (flaggedCells != this.grid[x][y].getValue()) {
            return;
        }

        /* reveal adjacent cells */
        for (let k = 0; k < Xs.length; k++) {
            this.unveilCell(Xs[k], Ys[k]);
        }
    }

    updateFreeCells(x, y) {
        const [Xs, Ys] = this.getAdjacentCells(x, y, true);

        this.grid[x][y].unveil();

        for (let i = 0; i < Xs.length; i++) {
            if ((this.grid[Xs[i]][Ys[i]].isFree()) && (this.grid[Xs[i]][Ys[i]].isUnveiled() == false) && (this.grid[Xs[i]][Ys[i]].isFlagged() == false)) {
                this.updateFreeCells(Xs[i], Ys[i]);

            } else if ((this.grid[Xs[i]][Ys[i]].getValue() > 0) && (this.grid[Xs[i]][Ys[i]].isUnveiled() == false) && (this.grid[Xs[i]][Ys[i]].isFlagged() == false)) {
                this.grid[Xs[i]][Ys[i]].unveil();
            }
        }
    }

    revealMines() {
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                if ((this.grid[i][j].isMined()) && (this.grid[i][j].isFlagged() == false)) {
                    this.grid[i][j].drawShape("bomb");
                }
            }
        }
    }
}