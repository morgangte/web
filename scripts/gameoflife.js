import { Cell } from "./modules/cell.mjs"
import { Grid } from "./modules/grid.mjs"

window.addEventListener("load", main);

function main() {
    const cv = document.querySelector("#game-canvas");
    const ctx = cv.getContext("2d");

    let gol = new GameOfLife(cv, ctx, 20, 20, 600, 600);
    gol.initializeGrid();

    /* ----------------- Preset ---------------------- */

    const presets_id = {
        "glider": 0
    }

    const presets_nbXCells = [20];
    const presets_nbYCells = [20];

    /* ----------------- Settings -------------------- */

    let preset_setting = document.querySelector("#gol-spaceship-select");

    /* ----------------- Buttons --------------------- */

    /* zoom */

    let zoom = 100;

    let gameboard = document.querySelector(".game-board");

    function updateZoom() {
        gameboard.style.setProperty("--zoom", zoom + "vh");
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

    /* Game of life commands */

    const start_button = document.querySelector("#gol-start");
    start_button.addEventListener("click", function (e) {
        gol.start(150);
        start_button.disabled = true;
        stop_button.disabled = false;
        play_button.disabled = false;
    });

    const play_button = document.querySelector("#gol-play-pause");
    play_button.disabled = true;
    play_button.addEventListener("click", function (e) {
        gol.switchPlayPause();
    });

    const stop_button = document.querySelector("#gol-stop");
    stop_button.disabled = true;
    stop_button.addEventListener("click", function (e) {
        gol.stop();
        start_button.disabled = false;
        stop_button.disabled = true;
        play_button.disabled = true;
    });

    const apply_ch_button = document.querySelector("#gol-apply-changes");
    apply_ch_button.addEventListener("click", function (e) {
        let id = presets_id[preset_setting.value];

        if (gol.isRunning()) {
            gol.stop();
            gol.start(300);
        }

        gol.selectPreset("glider");
    });

    const clear_button = document.querySelector("#gol-clear");
    clear_button.addEventListener("click", function (e) {
        gol.selectPreset("none");
    });

    gol.cv.addEventListener("click", function (e) {
        let [x, y] = gol.getCellCoordinates(e);

        if (gol.getCellValue(x, y) == 1) {
            gol.touchCell(x, y, 0, "white");
        } else {
            gol.touchCell(x, y, 1, "black");
        }
    });
}

class GameOfLife extends Grid {
    constructor(cv, ctx, nbXCells, nbYCells, width, heigth) {
        super(cv, ctx, nbXCells, nbYCells, width, heigth);

        this.running = false;
        this.started = false;

        this.grid;
        this.interval;

        this.colors = ["#FEFEFE", "#FCFCFC"];
    }

    initializeGrid() {
        this.grid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            this.grid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.grid[i][j] = new Cell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0);
                this.grid[i][j].setColor(this.colors[(i + j) % 2]);
            }
        }
    }

    play() {
        this.running = true;
    }

    pause() {
        this.running = false;
    }

    switchPlayPause() {
        this.running = !this.running;
    }

    isRunning() {
        return this.running;
    }

    start(delay) {
        if (this.started) {
            return;
        }

        this.started = true;
        this.running = true;

        this.interval = setInterval(this.simulation.bind(this), delay);
    }

    stop() {
        this.started = false;
        this.running = false;

        clearInterval(this.interval);
    }

    simulation() {
        if (this.running == false) {
            return;
        }

        let newGrid = new Array(this.nbXCells);

        for (let i = 0; i < this.nbXCells; i++) {
            newGrid[i] = new Array(this.nbYCells);
        }

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                newGrid[i][j] = new Cell(this.cv, this.ctx, this.cellWidth * i, this.cellHeigth * j, this.cellWidth, this.cellHeigth, 0);
                this.grid[i][j].setColor(this.colors[(i + j) % 2]);
            }
        }

        let count = 0;
        let k = 0;

        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {

                const [Xs, Ys] = this.getAdjacentCells(i, j, true);

                /* while (count < 5) to limit the number of operations */
                while ((count < 5) && (k < Xs.length)) {
                    count += this.grid[Xs[k]][Ys[k]].value;
                    k += 1;
                }

                if ((count < 2) && (this.grid[i][j].value == 1)) {
                    newGrid[i][j].touch(0, this.colors[(i + j) % 2], this.gridDrawn);
                } else if ((count > 3) && (this.grid[i][j].value == 1)) {
                    newGrid[i][j].touch(0, this.colors[(i + j) % 2], this.gridDrawn);
                } else if (this.grid[i][j].value == 1) {
                    newGrid[i][j].touch(1, "black", this.gridDrawn);
                } else if ((count == 3) && (this.grid[i][j].value == 0)) {
                    newGrid[i][j].touch(1, "black", this.gridDrawn);
                }

                count = 0;
                k = 0;
            }
        }

        this.grid = newGrid;
    }

    selectPreset(preset) {
        let Xs;
        let Ys;
        for (let i = 0; i < this.nbXCells; i++) {
            for (let j = 0; j < this.nbYCells; j++) {
                this.touchCell(i, j, 0, this.colors[(i + j) % 2]);
            }
        }

        switch (preset) {
            case "glider":
                Xs = [2, 3, 4, 4, 3];
                Ys = [5, 5, 5, 4, 3];
                break;
            case "ahbon":
                Xs = [2, 3, 4, 4, 3, 6, 6, 7];
                Ys = [5, 5, 5, 4, 3, 3, 2, 5];
                break;
            case "none":
                Xs = [];
                Ys = [];
            default:
                Xs = [];
                Ys = [];
                break;
        }

        for (let i = 0; i < Xs.length; i++) {
            this.touchCell(Xs[i], Ys[i], 1, "black");
        }
    }
}