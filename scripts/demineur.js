function main() {
    const de_Xcells = 20;
    const de_Ycells = 20;

    let [de, de_cv_ct] = createDemineur(de_Xcells, de_Ycells);
    initDemineur(de, de_cv_ct);

    const restart_button = document.querySelector("#restart-button");

    restart_button.addEventListener("click", function (event) {
        initDemineur(de, de_cv_ct, de_Xcells, de_Ycells);
    })
}

function createDemineur(de_Xcells, de_Ycells) {
    var de_cv = document.getElementById("demineur_canvas");
    var de_cv_ct = de_cv.getContext("2d");

    var de_info = document.getElementById("demineur_info");

    var de = new Demineur(de_cv, de_cv_ct, de_info, de_Xcells, de_Ycells);

    de.de_cv.addEventListener("click", function (event) {
        let [x, y] = de.getClickCoordinates(event);

        [x, y] = de.cellCoordinates(x, y);

        if (de.firstMove) {
            de.setMines(x, y);
            de.computeMinesGrid();
            de.firstMove = false;
        }

        if (de.grid[x][y] == -1) {
            de.drawCellBackground("red", x, y);
            de.printInfo("BOOM !")
        } else if (de.grid[x][y] == 0) {
            de.updateZeroCells(x, y);
        } else {
            de.drawCellBackground("white", x, y);
            de.drawShape(de.grid[x][y], x, y);
            de.printInfo("");
        }


    });

    return [de, de_cv_ct];
}

function initDemineur(de, de_cv_ct, de_Xcells, de_Ycells) {
    de_cv_ct.clearRect(0, 0, de_Xcells * 30, de_Ycells * 30);

    de.drawGrid();
    de.removeMines();
    de.firstMove = true;
}

class Demineur {
    constructor(de_cv, de_cv_ct, de_info, de_Xcells, de_Ycells) {
        this.de_cv = de_cv;
        this.de_cv_ct = de_cv_ct;
        this.de_info = de_info;
        this.de_Xcells = de_Xcells;
        this.de_Ycells = de_Ycells;

        this.grid = Array.from({ length: de_Ycells }).map(() =>
            Array.from({ length: de_Xcells }).fill(0)
        );

        /* boolean to know if the mines have to be initialized or not */
        this.firstMove = true;
    }

    getClickCoordinates(event) {
        let rect = this.de_cv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        return [x, y];
    }

    cellCoordinates(x, y) {
        return [Math.floor(x / 30), Math.floor(y / 30)];
    }

    setMines(except_x, except_y) {
        var [Xs, Ys] = this.adjacentCells(except_x, except_y, true);

        /* 20% of mines in the grid */
        var minesLeft = Math.floor((this.de_Xcells * this.de_Ycells) * 0.2);

        for (var i = 0; i < this.de_Xcells; i++) {
            for (var j = 0; j < this.de_Ycells; j++) {

                if ((Math.random() <= 0.2) && (minesLeft > 0)) {
                    this.grid[i][j] = -1;
                    minesLeft -= 1;
                } else {
                    this.grid[i][j] = 0;
                }
            }
        }

        this.grid[except_x][except_y] = 0;

        for (var k = 0; k < Xs.length; k++) {
            this.grid[Xs[k]][Ys[k]] = 0;
        }
    }

    removeMines() {
        for (var i = 0; i < this.de_Xcells; i++) {
            for (var j = 0; j < this.de_Ycells; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    adjacentCells(x, y, diagonal) {
        var Xs = [];
        var Ys = [];

        if ((x - 1 >= 0) && (y - 1 >= 0) && (diagonal)) {
            Xs += [x - 1];
            Ys += [y - 1];
        }
        if ((y - 1 >= 0)) {
            Xs += [x];
            Ys += [y - 1];
        }
        if ((x + 1 < this.de_Xcells) && (y - 1 >= 0) && (diagonal)) {
            Xs += [x + 1];
            Ys += [y - 1];
        }
        if ((x - 1 >= 0)) {
            Xs += [x - 1];
            Ys += [y];
        }
        if ((x + 1 < this.de_Xcells)) {
            Xs += [x + 1];
            Ys += [y];
        }
        if ((x - 1 >= 0) && (y + 1 < this.de_Ycells) && (diagonal)) {
            Xs += [x - 1];
            Ys += [y + 1];
        }
        if ((y + 1 < this.de_Ycells)) {
            Xs += [x];
            Ys += [y + 1];
        }
        if ((x + 1 < this.de_Xcells) && (y + 1 < this.de_Ycells) && (diagonal)) {
            Xs += [x + 1];
            Ys += [y + 1];
        }

        return [Xs, Ys];
    }

    computeMinesNearCell(x, y) {
        var [Xs, Ys] = this.adjacentCells(x, y, true);

        for (var i = 0; i < Xs.length; i++) {
            if ((this.grid[Xs[i]][Ys[i]] == -1) && (this.grid[x][y] >= 0)) {
                this.grid[x][y] += 1;
            }
        }
    }

    computeMinesGrid() {
        for (var i = 0; i < this.de_Xcells; i++) {
            for (var j = 0; j < this.de_Ycells; j++) {
                this.computeMinesNearCell(i, j);
            }
        }
    }

    updateZeroCells(x, y) {
        var [Xs_0, Ys_0] = this.adjacentCells(x, y, false);
        var [Xs_m, Ys_m] = this.adjacentCells(x, y, true);

        this.drawCellBackground("white", x, y);
        this.grid[x][y] = -10;

        for (var i = 0; i < Xs_0.length; i++) {
            if ((this.grid[Xs_0[i]][Ys_0[i]] == 0)) {
                this.updateZeroCells(Xs_0[i], Ys_0[i]);
            }
        }

        for (var i = 0; i < Xs_m.length; i++) {
            if (this.grid[Xs_m[i]][Ys_m[i]] > 0) {
                this.drawCellBackground("white", Xs_m[i], Ys_m[i]);
                this.drawShape(this.grid[Xs_m[i]][Ys_m[i]], Xs_m[i], Ys_m[i]);
            }
        }
    }

    drawGrid() {
        this.de_cv_ct.beginPath();
        this.de_cv_ct.lineWidth = 1;
        this.de_cv_ct.strokeStyle = "black";

        for (var i = 1; i < this.de_Xcells; i++) {
            this.de_cv_ct.moveTo(30 * i, 0);
            this.de_cv_ct.lineTo(30 * i, this.de_Ycells * 30);
            this.de_cv_ct.stroke();
        }

        for (var i = 1; i < this.de_Ycells; i++) {
            this.de_cv_ct.moveTo(0, 30 * i);
            this.de_cv_ct.lineTo(this.de_Ycells * 30, 30 * i);
            this.de_cv_ct.stroke();
        }

        this.de_cv_ct.closePath();
    }

    drawShape(shape, x, y) {
        shape = shape.toString();

        this.de_cv_ct.fillStyle = "black";
        this.de_cv_ct.fillText(shape, 30 * x + 13, 30 * y + 19);
    }

    drawCellBackground(color, x, y) {
        this.de_cv_ct.fillStyle = color;
        if (x == 0) {
            x = 30 * x;
        } else if (x == this.de_Xcells) {
            x = 30 * x + 4;
        } else {
            x = 30 * x + 1;
        }

        if (y == 0) {
            y = 30 * y + 1;
        } else if (y == this.de_Ycells) {
            y = 30 * y + 4;
        } else {
            y = 30 * y + 1;
        }

        this.de_cv_ct.fillRect(x, y, 28, 28);
    }

    printInfo(text) {
        this.de_info.innerHTML = text;
    }

}