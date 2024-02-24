import { Drawable } from "./drawable.mjs";
import { Cell } from "./cell.mjs"

export class Grid extends Drawable {
    constructor(cv, ctx, nbXCells, nbYCells, width, heigth) {
        super(cv, ctx, width, heigth);

        this.nbXCells = nbXCells;
        this.nbYCells = nbYCells;

        this.cellWidth = width / nbXCells;
        this.cellHeigth = heigth / nbYCells;

        this.gridDrawn = false;
        this.grid;
    }

    initializeGrid() {
        this.grid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            this.grid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.grid[i][j] = new Cell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0);
            }
        }
    }

    getCellCoordinates(event) {
        let rect = this.cv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        /* Compute relative cell heigth and width because the size of the canvas can change */
        let relativeWidth = (rect.right - rect.left) / this.nbXCells;
        let relativeHeigth = (rect.bottom - rect.top) / this.nbYCells;

        return [Math.floor(x / relativeWidth), Math.floor(y / relativeHeigth)];
    }

    /**
     * Sets the color of each cell of the grid to color.
     * 
     * @param {string} color The color.
     * @param {boolean} gridDrawn Are the lines between the cells drawn ?
     */
    setColor(color) {
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.setCellColor(i, j, color);
            }
        }
    }

    setValue(value) {
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.setCellValue(i, j, value);
            }
        }
    }

    touch(value, color) {
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.touchCell(i, j, value, color);
            }
        }
    }

    getCellValue(x, y) {
        return this.grid[x][y].getValue();
    }

    setCellColor(x, y, color) {
        this.grid[x][y].setColor(color, this.gridDrawn);
    }

    setCellValue(x, y, value) {
        this.grid[x][y].setValue(value);
    }

    touchCell(x, y, value, color) {
        this.grid[x][y].touch(value, color, this.gridDrawn);
    }

    drawGrid(color) {
        this.gridDrawn = true;

        for (let i = 0; i <= this.nbXCells; i++) {
            this.drawLine(this.cellWidth * i, 0, this.cellWidth * i, this.nbYCells * this.cellWidth, 1, color);
        }

        for (let i = 0; i <= this.nbYCells; i++) {
            this.drawLine(0, this.cellHeigth * i, this.nbYCells * this.cellHeigth, this.cellHeigth * i, 1, color);
        }
    }

    /**
     * Returns the adjacent cells of a given cell (x, y).
     * 
     * @param {int} x x coordinate of the cell.
     * @param {int} y y coordinate of the cell.
     * @param {boolean} diagonal Count the diagonal adjacent cells ?
     * @returns A two-dimension array of x and y coordinates of adjacent cells.
     */
    getAdjacentCells(x, y, diagonal) {
        let Xs = [];
        let Ys = [];

        if ((x - 1 >= 0) && (y - 1 >= 0) && (diagonal)) {
            Xs.push(x - 1);
            Ys.push(y - 1);
        }
        if ((y - 1 >= 0)) {
            Xs.push(x);
            Ys.push(y - 1);
        }
        if ((x + 1 < this.nbXCells) && (y - 1 >= 0) && (diagonal)) {
            Xs.push(x + 1);
            Ys.push(y - 1);
        }
        if ((x - 1 >= 0)) {
            Xs.push(x - 1);
            Ys.push(y);
        }
        if ((x + 1 < this.nbXCells)) {
            Xs.push(x + 1);
            Ys.push(y);
        }
        if ((x - 1 >= 0) && (y + 1 < this.nbYCells) && (diagonal)) {
            Xs.push(x - 1);
            Ys.push(y + 1);
        }
        if ((y + 1 < this.nbYCells)) {
            Xs.push(x);
            Ys.push(y + 1);
        }
        if ((x + 1 < this.nbXCells) && (y + 1 < this.nbYCells) && (diagonal)) {
            Xs.push(x + 1);
            Ys.push(y + 1);
        }

        return [Xs, Ys];
    }
}