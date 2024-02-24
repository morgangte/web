function main() {
    createDemineur();
}

function createDemineur() {
    let cv = document.getElementById("demineur_canvas");
    let cv_ct = cv.getContext("2d");

    let info = document.getElementById("demineur_info");

    let balise_cellsNb = document.querySelector("#de_opt_dimensions");
    let balise_minesNb = document.querySelector("#de_opt_minesNumber");

    const minesPercentage = new Map();
    minesPercentage.set("TF", 0.1);
    minesPercentage.set("F", 0.15);
    minesPercentage.set("PF", 0.2);
    minesPercentage.set("M", 0.25);
    minesPercentage.set("PD", 0.3);
    minesPercentage.set("D", 0.37);
    minesPercentage.set("TD", 0.45);
    minesPercentage.set("I", 0.6);

    /* default settings */
    function applyDefaultSettings() {
        balise_cellsNb.value = 20;
        balise_minesNb.value = "M";
    }

    applyDefaultSettings();

    let de = new Demineur(cv, cv_ct, info, balise_cellsNb.value, balise_cellsNb.value, balise_cellsNb.value * balise_cellsNb.value * minesPercentage.get(balise_minesNb.value));
    de.reset();

    /* restart button */
    const restart_button = document.querySelector("#restart-button");

    restart_button.addEventListener("click", function (event) {
        de.printInfo("");
        de.reset();
    });

    /* set to default values button */
    const def_val_button = document.querySelector("#default-values-button");

    def_val_button.addEventListener("click", applyDefaultSettings);

    /* apply changes button */
    const apply_ch_button = document.querySelector("#apply-changes-button");

    apply_ch_button.addEventListener("click", function (event) {
        let cellsNb = balise_cellsNb.value;
        let minesNb = minesPercentage.get(balise_minesNb.value) * cellsNb * cellsNb;

        de.printInfo("");
        de.Xcells = cellsNb;
        de.Ycells = cellsNb;
        de.minesNb = minesNb;
        de.reset();
    });

    /* clicks events */
    function clickListener(event) {
        let [x, y] = de.getClickCoordinates(event);
        [x, y] = de.cellCoordinates(x, y);

        if ((de.flagged[x][y]) || (de.playing == false)) {
            return;
        }

        if (de.firstMove) {
            de.setMines(x, y);
            de.computeMinesGrid();
            de.firstMove = false;
            de.printInfo("Mines restantes : " + de.minesLeftToDiscover);
        }

        if ((de.unveiled[x][y]) && (de.grid[x][y] > 0)) {
            de.tryUnveilingAdjacentCells(x, y);
        } else {
            de.unveilCell(x, y);
        }
    }

    function auxclickListener(event) {
        let [x, y] = de.getClickCoordinates(event);
        [x, y] = de.cellCoordinates(x, y);

        if ((de.unveiled[x][y]) || (de.playing == false)) {
            return false;
        }

        if (de.flagged[x][y]) {
            de.drawCellBackground("lightgray", x, y);
            de.flagged[x][y] = false;
            de.minesLeftToDiscover += 1;
            de.printInfo("Mines restantes : " + de.minesLeftToDiscover);
        } else if (de.unveiled[x][y] == false) {
            de.drawShape("flag", x, y);
            de.flagged[x][y] = true;
            de.minesLeftToDiscover -= 1;
            de.printInfo("Mines restantes : " + de.minesLeftToDiscover);
        }

        return false;
    }

    de.cv.addEventListener("click", clickListener, false);

    de.cv.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    de.cv.addEventListener("auxclick", auxclickListener, false);
}

class Demineur {
    constructor(cv, cv_ct, info, Xcells, Ycells, minesNb) {
        this.cv = cv;
        this.cv_ct = cv_ct;
        this.info = info;
        this.Xcells = Xcells;
        this.Ycells = Ycells;
        this.minesNb = minesNb;
        this.minesLeftToDiscover = 0;

        this.grid = Array.from({ length: Ycells }).map(() =>
            Array.from({ length: Xcells }).fill(0)
        );

        this.unveiled = Array.from({ length: Ycells }).map(() =>
            Array.from({ length: Xcells }).fill(false)
        );

        this.flagged = Array.from({ length: Ycells }).map(() =>
            Array.from({ length: Xcells }).fill(false)
        );

        /* boolean to know if the mines have to be initialized or not */
        this.firstMove = true;

        /* false if the player has lost */
        this.playing = true;
    }

    /* done */
    reset() {
        this.cv.width = 30 * this.Xcells;
        this.cv.height = 30 * this.Ycells;

        this.cv_ct.clearRect(0, 0, this.Xcells * 30, this.Ycells * 30);
        this.drawGrid();
        this.firstMove = true;
        this.playing = true;
        this.minesLeftToDiscover = 0;

        this.grid = Array.from({ length: this.Ycells }).map(() =>
            Array.from({ length: this.Xcells }).fill(0)
        );

        this.unveiled = Array.from({ length: this.Ycells }).map(() =>
            Array.from({ length: this.Xcells }).fill(false)
        );

        this.flagged = Array.from({ length: this.Ycells }).map(() =>
            Array.from({ length: this.Xcells }).fill(false)
        );

        for (let i = 0; i < this.Xcells; i++) {
            for (let j = 0; j < this.Ycells; j++) {
                this.grid[i][j] = 0;
                this.unveiled[i][j] = false;
                this.flagged[i][j] = false;
            }
        }
    }

    /* done */
    getClickCoordinates(event) {
        let rect = this.cv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        return [x, y];
    }

    /* done */
    cellCoordinates(x, y) {
        return [Math.floor(x / 30), Math.floor(y / 30)];
    }

    /* done */
    setMines(except_x, except_y) {
        const [except_Xs, except_Ys] = this.adjacentCells(except_x, except_y, true);

        let minesLeftToPlace = this.minesNb;
        let i;
        let j;

        /* avoid infinite while loop */
        if (minesLeftToPlace > this.Xcells * this.Ycells) {
            console.log("Can't initialize the minesweeper : more mines than cells.");
            return;
        }

        /* avoid placing mines around the first click */
        this.grid[except_x][except_y] = -1;

        for (let k = 0; k < except_Xs.length; k++) {
            this.grid[except_Xs[k]][except_Ys[k]] = -1;
        }

        /* placing the real mines */
        while (minesLeftToPlace > 0) {
            i = Math.floor(Math.random() * this.Xcells);
            j = Math.floor(Math.random() * this.Ycells);

            if (this.grid[i][j] == 0) {
                this.grid[i][j] = -1;
                minesLeftToPlace -= 1;
            }
        }

        /* no mines around the first click */
        this.grid[except_x][except_y] = 0;

        for (let k = 0; k < except_Xs.length; k++) {
            this.grid[except_Xs[k]][except_Ys[k]] = 0;
        }
    }

    /*done */
    /**
     * @param {int} x x coordinate
     * @param {int} y y coordinate
     * @param {boolean} diagonal 
     * @returns coordinates of adjacent cells of the cell (x, y)
     */
    adjacentCells(x, y, diagonal) {
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
        if ((x + 1 < this.Xcells) && (y - 1 >= 0) && (diagonal)) {
            Xs.push(x + 1);
            Ys.push(y - 1);
        }
        if ((x - 1 >= 0)) {
            Xs.push(x - 1);
            Ys.push(y);
        }
        if ((x + 1 < this.Xcells)) {
            Xs.push(x + 1);
            Ys.push(y);
        }
        if ((x - 1 >= 0) && (y + 1 < this.Ycells) && (diagonal)) {
            Xs.push(x - 1);
            Ys.push(y + 1);
        }
        if ((y + 1 < this.Ycells)) {
            Xs.push(x);
            Ys.push(y + 1);
        }
        if ((x + 1 < this.Xcells) && (y + 1 < this.Ycells) && (diagonal)) {
            Xs.push(x + 1);
            Ys.push(y + 1);
        }

        return [Xs, Ys];
    }

    /* done */
    computeMinesNearCell(x, y) {
        const [Xs, Ys] = this.adjacentCells(x, y, true);

        for (let i = 0; i < Xs.length; i++) {
            if ((this.grid[Xs[i]][Ys[i]] == -1) && (this.grid[x][y] >= 0)) {
                this.grid[x][y] += 1;
            }
        }
    }

    /* done */
    computeMinesGrid() {
        for (let i = 0; i < this.Xcells; i++) {
            for (let j = 0; j < this.Ycells; j++) {
                this.computeMinesNearCell(i, j);

                if (this.grid[i][j] == -1) {
                    this.minesLeftToDiscover += 1;
                }
            }
        }
    }

    /* done */
    revealMines() {
        for (var i = 0; i < this.Xcells; i++) {
            for (var j = 0; j < this.Ycells; j++) {
                if ((this.grid[i][j] == -1) && (this.flagged[i][j] == false)) {
                    this.drawCellBackground("orange", i, j);
                    this.drawShape("bomb", i, j);
                }
            }
        }
    }

    /* done */
    unveilCell(x, y) {
        if (this.flagged[x][y]) {
            return;
        }

        if (this.grid[x][y] == -1) {
            this.revealMines();
            this.drawCellBackground("red", x, y);
            this.drawShape("explosion", x, y);
            this.playing = false;
        } else if (this.grid[x][y] == 0) {
            this.updateZeroCells(x, y);
        } else {
            this.drawCellBackground("white", x, y);
            this.drawNumber(this.grid[x][y], x, y);
        }

        this.unveiled[x][y] = true;
    }

    /* done */
    tryUnveilingAdjacentCells(x, y) {
        const [Xs, Ys] = this.adjacentCells(x, y, true);

        /* verify that the number of flagged cells is equal to the number of the cell */
        let flaggedCells = 0;
        for (let i = 0; i < Xs.length; i++) {
            if (this.flagged[Xs[i]][Ys[i]]) {
                flaggedCells += 1;
            }
        }

        if (flaggedCells != this.grid[x][y]) {
            return;
        }

        /* reveal adjacent cells */
        for (let k = 0; k < Xs.length; k++) {
            this.unveilCell(Xs[k], Ys[k]);
        }
    }

    /* done */
    updateZeroCells(x, y) {
        var [Xs_0, Ys_0] = this.adjacentCells(x, y, false);
        var [Xs_m, Ys_m] = this.adjacentCells(x, y, true);

        this.drawCellBackground("white", x, y);
        this.unveiled[x][y] = true;

        for (var i = 0; i < Xs_0.length; i++) {
            if ((this.grid[Xs_0[i]][Ys_0[i]] == 0) && (this.unveiled[Xs_0[i]][Ys_0[i]] == false) && (this.flagged[Xs_0[i]][Ys_0[i]] == false)) {
                this.updateZeroCells(Xs_0[i], Ys_0[i]);
            }
        }

        for (var i = 0; i < Xs_m.length; i++) {
            if ((this.grid[Xs_m[i]][Ys_m[i]] > 0) && (this.unveiled[Xs_m[i]][Ys_m[i]] == false) && (this.flagged[Xs_m[i]][Ys_m[i]] == false)) {
                this.drawCellBackground("white", Xs_m[i], Ys_m[i]);
                this.drawNumber(this.grid[Xs_m[i]][Ys_m[i]], Xs_m[i], Ys_m[i]);
                this.unveiled[Xs_m[i]][Ys_m[i]] = true;
            }
        }
    }

    /* done */
    drawLine(x_start, y_start, x_end, y_end, lineWidth, color) {
        this.cv_ct.beginPath();
        this.cv_ct.lineWidth = lineWidth;
        this.cv_ct.strokeStyle = color;

        this.cv_ct.moveTo(x_start, y_start);
        this.cv_ct.lineTo(x_end, y_end);
        this.cv_ct.stroke();

        this.cv_ct.closePath();
    }

    /* done */
    drawDisc(x, y, r, color) {
        this.cv_ct.beginPath();
        this.cv_ct.lineWidth = 2;
        this.cv_ct.fillStyle = color;

        this.cv_ct.arc(x, y, r, 0, 2 * Math.PI);
        this.cv_ct.fill();

        this.cv_ct.closePath();
    }

    /* done */
    drawGrid() {
        for (var i = 0; i <= this.Xcells; i++) {
            this.drawLine(30 * i, 0, 30 * i, this.Ycells * 30, 1, "black");
        }

        for (var i = 0; i <= this.Ycells; i++) {
            this.drawLine(0, 30 * i, this.Ycells * 30, 30 * i, 1, "black");
        }
    }

    /* done */
    drawNumber(num, x, y) {
        const colors = ["blue", "green", "red", "navy", "purple", "orange", "aqua", "maroon"];

        num = num.toString();

        this.cv_ct.fillStyle = colors[num - 1];
        this.cv_ct.font = "20px Monospace";
        this.cv_ct.fillText(num, 30 * x + 9.5, 30 * y + 22);
    }

    /* done */
    drawShape(shape, x, y) {
        if (shape == "bomb") {
            this.drawDisc(30 * x + 15, 30 * y + 15, 7, "black");

            this.drawLine(30 * x + 15, 30 * y + 5, 30 * x + 15, 30 * y + 25, 2, "black");
            this.drawLine(30 * x + 8, 30 * y + 8, 30 * x + 22, 30 * y + 22, 2, "black");
            this.drawLine(30 * x + 8, 30 * y + 22, 30 * x + 22, 30 * y + 8, 2, "black");
            this.drawLine(30 * x + 5, 30 * y + 15, 30 * x + 25, 30 * y + 15, 2, "black");
        } else if (shape == "explosion") {
            this.drawDisc(30 * x + 15, 30 * y + 15, 11, "orange");
            this.drawDisc(30 * x + 15, 30 * y + 15, 6, "yellow");
            this.drawDisc(30 * x + 15, 30 * y + 15, 3, "white");
        } else if (shape == "flag") {
            this.drawLine(30 * x + 11, 30 * y + 23, 30 * x + 23, 30 * y + 23, 2, "black");
            this.drawLine(30 * x + 17, 30 * y + 5, 30 * x + 17, 30 * y + 23, 2, "black");

            this.drawLine(30 * x + 14, 30 * y + 7, 30 * x + 14, 30 * y + 17, 3, "red");
            this.drawLine(30 * x + 11, 30 * y + 9, 30 * x + 11, 30 * y + 15, 3, "red");
            this.drawLine(30 * x + 8, 30 * y + 11, 30 * x + 8, 30 * y + 13, 3, "red");
        }
    }

    /* done */
    drawCellBackground(color, x, y) {
        this.cv_ct.fillStyle = color;
        this.cv_ct.fillRect(30 * x + 1, 30 * y + 1, 28, 28);
    }

    /* done */
    printInfo(text) {
        this.info.innerHTML = text;
    }
}