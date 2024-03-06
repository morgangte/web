import { Cell } from "./modules/cell.mjs";
import { Grid } from "./modules/grid.mjs";

window.addEventListener("load", main);

function main() {
    let cv = document.querySelector("#game-canvas");
    let ctx = cv.getContext("2d");

    let de = new Demineur(cv, ctx, 15, 15, 2000, 2000, 56);

    /* ----------- Time and mines left -------------- */

    const minesLeftTextElement = document.querySelector("#demineur-mines-left");
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
        if (de.playing) {
            timeCount += 1;
            printTime();
        }
    }, 1000);

    /* ----------------- Presets -------------------- */

    const presets_nbXCells = [8, 12, 15, 20, 25, 30, 40];
    const presets_nbYCells = [8, 12, 15, 15, 20, 25, 40];

    const presets_width = [2000, 2000, 2000, 2500, 2500, 2400, 2000];
    const presets_heigth = [2000, 2000, 2000, 2000, 2000, 2000, 2000];

    const presets_mines_perc = [15, 18, 20, 25, 28, 31, 36];

    const presets_names = ["débutant", "initié", "intermédiaire", "avancé", "expert", "master", "alien"];

    const presets_zoom = [30, 50, 60, 70, 90, 100, 120];

    /* ----------------- Settings ------------------- */

    let sett_applied_info = document.querySelector("#setting-applied-info");

    let preset_setting = document.querySelector("#demineur-preset");

    let width_setting = document.querySelector("#demineur-width");

    let heigth_setting = document.querySelector("#demineur-heigth");

    let mines_percentage_setting = document.querySelector("#demineur-mine-percentage");

    /* ----------------- Buttons -------------------- */

    /* zoom */

    let zoom = 100;

    let gameboard = document.querySelector(".game-board");
    let game_top = document.querySelector(".game-top");
    let game_bottom = document.querySelector(".game-bottom");

    function updateZoom() {
        gameboard.style.setProperty("--zoom", zoom + "vh");
        game_top.style.setProperty("--zoom", zoom + "vh");
        game_bottom.style.setProperty("--zoom", zoom + "vh");
    }

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

    /* Demineur commands */

    const restart_button = document.querySelector("#demineur-restart-button");
    restart_button.addEventListener("click", function (e) {
        timeCount = 0;
        printTime();
        de.initializeGrid();
        minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";
    });

    function applyDefaultSettings() {
        timeCount = 0;
        printTime();

        preset_setting.value = 2;
        let i = preset_setting.value;

        de = new Demineur(cv, ctx, presets_nbXCells[i], presets_nbYCells[i], presets_width[i], presets_heigth[i], Math.floor(presets_nbXCells[i] * presets_nbYCells[i] * presets_mines_perc[i] / 100));

        cv.width = presets_width[i];
        cv.heigth = presets_heigth[i];

        de.initializeGrid();
        minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";

        zoom = presets_zoom[i];
        updateZoom();

        de.initializeGrid();
        sett_applied_info.textContent = "Paramètres par défaut appliqués (preset " + presets_names[i] + ")";
    }

    const default_sett_button = document.querySelector("#default-settings");
    default_sett_button.addEventListener("click", applyDefaultSettings);

    const apply_ch_button = document.querySelector("#apply-changes");
    apply_ch_button.addEventListener("click", function (e) {
        timeCount = 0;
        printTime();

        if (((width_setting.value == null) || (width_setting.value == "")) ||
            ((heigth_setting.value == null) || (heigth_setting.value == "")) ||
            ((mines_percentage_setting.value == null) || (mines_percentage_setting.value == ""))) {

            let i = preset_setting.value;
            de = new Demineur(cv, ctx, presets_nbXCells[i], presets_nbYCells[i], presets_width[i], presets_heigth[i], Math.floor(presets_nbXCells[i] * presets_nbYCells[i] * presets_mines_perc[i] / 100));

            cv.width = presets_width[i];
            cv.heigth = presets_heigth[i];

            de.initializeGrid();
            minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";

            zoom = presets_zoom[i];
            updateZoom();

            de.initializeGrid();
            sett_applied_info.textContent = "Preset " + presets_names[i] + " appliqué (" + presets_nbYCells[i] + " x " + presets_nbXCells[i] + ", " + presets_mines_perc[i] + "%)";
        } else {
            let nbXCells = Math.max(4, Math.min(150, width_setting.value));
            let nbYCells = Math.max(4, Math.min(150, heigth_setting.value));
            let mines_perc = Math.max(4, Math.min(95, mines_percentage_setting.value));
            let mines_nb = Math.floor(nbXCells * nbYCells * mines_perc / 100);

            de = new Demineur(cv, ctx, nbXCells, nbYCells, Math.floor(2000 * nbXCells / nbYCells), 2000, mines_nb);

            cv.width = Math.floor(2000 * nbXCells / nbYCells);
            cv.heigth = 2000;

            de.initializeGrid();
            minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";

            zoom = 100;
            updateZoom();

            de.initializeGrid();
            sett_applied_info.textContent = "Paramètres appliqués : " + nbYCells + " x " + nbXCells + ", " + mines_perc + "%";
        }
    });

    /* ------------------ Canvas -------------------- */

    de.cv.addEventListener("click", function (e) {
        let [x, y] = de.getCellCoordinates(e);

        if (de.firstMove) {
            de.setMines(x, y);
            de.playing = true;
            de.firstMove = false;
            minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";
        }

        if (de.playing == false) {
            console.log(de.freeCellsLeft);
            return;
        }

        if (de.isCellFlagged(x, y)) {
            console.log(de.freeCellsLeft);
            return;
        }

        if (de.isCellUnveiled(x, y) && (de.getCellValue(x, y) > 0)) {
            de.unveilAdjacentCells(x, y);
        } else {
            de.unveilCell(x, y);
        }

        if (de.freeCellsLeft == 0) {
            minesLeftTextElement.textContent = "Victoire !";
            de.playing = false;
            console.log(de.freeCellsLeft);
            return;
        }

        console.log(de.freeCellsLeft);
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
            minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";
        } else {
            de.flagCell(x, y);
            minesLeftTextElement.textContent = de.minesLeftToDiscover.toString() + " / " + de.nbMines.toString() + " mines restantes";
        }
    });

    /* -------------- Default settings --------------- */

    applyDefaultSettings();
}

class DemineurCell extends Cell {
    constructor(cv, ctx, x, y, width, heigth, value, color, colorUnveiled) {
        super(cv, ctx, x, y, width, heigth, value);

        this.unveiled = false;
        this.flagged = false;

        this.gridDrawn = false;

        this.color = color;
        this.colorUnveiled = colorUnveiled;
    }

    drawNumber() {
        const numberColors = ["blue", "green", "red", "navy", "purple", "orange", "aqua", "maroon"];

        this.ctx.fillStyle = numberColors[this.value - 1];
        this.ctx.font = (this.heigth * 2 / 3) + "px Monospace";
        this.ctx.fillText(this.value, (this.x + this.width * (18 / 60)), (this.y + this.heigth * (23 / 30)));
    }

    drawShape(shape) {
        let coeff = Math.min(this.width, this.heigth);

        if (shape == "explosion") {
            this.setColor("red", this.gridDrawn);

            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff * 11 / 30, "orange");
            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff / 5, "yellow");
            this.drawDisc(this.x + coeff * (1 / 2), this.y + coeff * (1 / 2), coeff / 10, "white");
        } else if (shape == "bomb") {
            this.drawDisc((this.x + coeff * (1 / 2)), (this.y + coeff * (1 / 2)), coeff * 7 / 30, "black");

            this.drawLine((this.x + coeff * (1 / 2)), (this.y + coeff * (1 / 6)), (this.x + coeff * (1 / 2)), (this.y + coeff * (5 / 6)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (4 / 15)), (this.y + coeff * (4 / 15)), (this.x + coeff * (11 / 15)), (this.y + coeff * (11 / 15)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (4 / 15)), (this.y + coeff * (11 / 15)), (this.x + coeff * (11 / 15)), (this.y + coeff * (4 / 15)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (1 / 6)), (this.y + coeff * (1 / 2)), (this.x + coeff * (5 / 6)), (this.y + coeff * (1 / 2)), coeff / 15, "black");
        } else if (shape == "flag") {
            this.drawLine((this.x + coeff * (11 / 30)), (this.y + coeff * (23 / 30)), (this.x + coeff * (23 / 30)), (this.y + coeff * (23 / 30)), coeff / 15, "black");
            this.drawLine((this.x + coeff * (17 / 30)), (this.y + coeff * (1 / 6)), (this.x + coeff * (17 / 30)), (this.y + coeff * (23 / 30)), coeff / 15, "black");

            this.drawLine((this.x + 2 + coeff * (7 / 15)), (this.y + coeff * (7 / 30)), (this.x + 2 + coeff * (7 / 15)), (this.y + coeff * (17 / 30)), coeff / 10, "red");
            this.drawLine((this.x + 2 + coeff * (11 / 30)), (this.y + coeff * (9 / 30)), (this.x + 2 + coeff * (11 / 30)), (this.y + coeff * (1 / 2)), coeff / 10, "red");
            this.drawLine((this.x + 2 + coeff * (4 / 15)), (this.y + coeff * (11 / 30)), (this.x + 2 + coeff * (4 / 15)), (this.y + coeff * (13 / 30)), coeff / 10, "red");
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
        this.setColor(this.color, this.gridDrawn);
        this.flagged = false;
    }

    unveil() {
        this.setColor(this.colorUnveiled, this.gridDrawn);

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
        this.freeCellsLeft; // When this equals 0, the game is won

        this.firstMove = true;
        this.playing = false;
        this.gridDrawn = false;

        this.colors = ["#e6ccb2", "#ddb892"];
        this.colorsUnveiled = ["#FFF4E9", "#f3ede2"];
    }

    initializeGrid() {
        this.grid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            this.grid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.grid[i][j] = new DemineurCell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0, this.colors[(i + j) % 2], this.colorsUnveiled[(i + j) % 2]);
                this.grid[i][j].setColor(this.colors[(i + j) % 2], false);
            }
        }

        this.firstMove = true;
        this.playing = false;
        this.minesLeftToDiscover = this.nbMines;
        this.freeCellsLeft = (this.nbXCells * this.nbYCells) - this.nbMines;
    }

    setMines(except_x, except_y) {
        const [except_Xs, except_Ys] = this.getAdjacentCells(except_x, except_y, true);

        let minesLeftToPlace = this.nbMines;
        this.freeCellsLeft = (this.nbXCells * this.nbYCells) - this.nbMines;

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

        } else if (this.grid[x][y].isUnveiled() == false) {
            this.grid[x][y].unveil();
            this.freeCellsLeft -= 1;

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
            if (this.grid[x][y].isUnveiled() == false) {
                this.freeCellsLeft -= 1;
                this.unveilCell(Xs[k], Ys[k]);
            } else {
                this.unveilCell(Xs[k], Ys[k]);
            }
        }
    }

    updateFreeCells(x, y) {
        const [Xs, Ys] = this.getAdjacentCells(x, y, true);

        if (this.grid[x][y].isUnveiled() == false) {
            this.grid[x][y].unveil();
            this.freeCellsLeft -= 1;
        } else {
            this.grid[x][y].unveil();
        }

        for (let i = 0; i < Xs.length; i++) {
            if ((this.grid[Xs[i]][Ys[i]].isFree()) && (this.grid[Xs[i]][Ys[i]].isUnveiled() == false) && (this.grid[Xs[i]][Ys[i]].isFlagged() == false)) {
                this.updateFreeCells(Xs[i], Ys[i]);

            } else if ((this.grid[Xs[i]][Ys[i]].getValue() > 0) && (this.grid[Xs[i]][Ys[i]].isUnveiled() == false) && (this.grid[Xs[i]][Ys[i]].isFlagged() == false)) {
                this.grid[Xs[i]][Ys[i]].unveil();
                this.freeCellsLeft -= 1;
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