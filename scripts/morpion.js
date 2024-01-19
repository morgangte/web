function main() {
    let [mp, mp_cv_ct] = newMorpion();
    initMorpion(mp, mp_cv_ct);

    const restart_button = document.querySelector("#restart-button");

    restart_button.addEventListener("click", function (event) {
        initMorpion(mp, mp_cv_ct);
    })
}

function newMorpion() {
    var mp_cv = document.getElementById("morpion_canvas");
    var mp_cv_ct = mp_cv.getContext("2d");

    var mp_info = document.getElementById("morpion_info");

    var mp = new Morpion(mp_cv, mp_cv_ct, mp_info);

    mp.mp_cv.addEventListener("click", function (event) {
        let [x, y] = mp.getClickCoordinates(event);

        [x, y] = mp.cellCoordinates(x, y);

        if (mp.freeCells == 0) {
            mp.printInfo("Partie terminée.")
        } else if (mp.grid[x][y] == 0) {
            mp.drawShape(mp.currentPlayer, x, y);
            mp.grid[x][y] = mp.currentPlayer;
            mp.nextPlayer();
            mp.printInfo("Tour : " + mp.currentPlayer);
            mp.freeCells -= 1;
        } else {
            mp.printInfo("Tour : " + mp.currentPlayer + "<br>Vous ne pouvez pas jouer ici !");
        }
    });

    return [mp, mp_cv_ct];
}

function initMorpion(mp, mp_cv_ct) {
    mp_cv_ct.clearRect(0, 0, 300, 300);

    mp.drawGrid();
    mp.printInfo("Tour : X");

    if (mp.currentPlayer == "O") {
        mp.currentPlayer = "X";
    }

    mp.grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    mp.freeCells = 9;
}

class Morpion {
    constructor(mp_cv, mp_cv_ct, mp_info) {
        this.mp_cv = mp_cv;
        this.mp_cv_ct = mp_cv_ct;
        this.mp_info = mp_info;

        this.currentPlayer = "X";

        /* 0=free; "X"; "O" */
        this.grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

        /* number of free cells */
        this.freeCells = 9;
    }

    nextPlayer() {
        if (this.currentPlayer == "X") {
            this.currentPlayer = "O";
        } else {
            this.currentPlayer = "X";
        }
    }

    drawGrid() {
        this.mp_cv_ct.beginPath();
        this.mp_cv_ct.lineWidth = 6;
        this.mp_cv_ct.strokeStyle = "grey";

        this.mp_cv_ct.moveTo(100.5, 0);
        this.mp_cv_ct.lineTo(100.5, 300.5);
        this.mp_cv_ct.stroke();

        this.mp_cv_ct.moveTo(200.5, 0);
        this.mp_cv_ct.lineTo(200.5, 300.5);
        this.mp_cv_ct.stroke();

        this.mp_cv_ct.lineWidth = 3;

        this.mp_cv_ct.moveTo(0, 100.5);
        this.mp_cv_ct.lineTo(300.5, 100.5);
        this.mp_cv_ct.stroke();

        this.mp_cv_ct.moveTo(0, 50.5);
        this.mp_cv_ct.lineTo(300.5, 50.5);
        this.mp_cv_ct.stroke();

        this.mp_cv_ct.closePath();
    }

    /**
     * 
     * @param {The shape to displat ("X" or "O")} shape 
     * @param {x coordinate of the cell} x 
     * @param {y coordinate of the cell} y 
     * @returns 
     */
    drawShape(shape, x, y) {
        if (shape == "X") {

            x = 101 * x + 12;
            y = 51 * y + 7;

            this.mp_cv_ct.beginPath();
            this.mp_cv_ct.lineWidth = 6;
            this.mp_cv_ct.strokeStyle = "grey";

            this.mp_cv_ct.moveTo(x, y);
            this.mp_cv_ct.lineTo(x + 75, y + 35);
            this.mp_cv_ct.stroke();

            this.mp_cv_ct.moveTo(x + 75, y);
            this.mp_cv_ct.lineTo(x, y + 35);
            this.mp_cv_ct.stroke();

            this.mp_cv_ct.closePath();
            return true;

        } else if (shape == "O") {

            x = 101 * x + 50;
            y = 51 * y + 24;

            this.mp_cv_ct.beginPath();
            this.mp_cv_ct.lineWidth = 6;
            this.mp_cv_ct.strokeStyle = "grey";

            this.mp_cv_ct.ellipse(x, y, 34, 17, 0, 0, 2 * Math.PI);
            this.mp_cv_ct.stroke();

            this.mp_cv_ct.closePath();
            return true;

        } else {
            return false;
        }
    }

    getClickCoordinates(event) {
        let rect = this.mp_cv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        return [x, y];
    }

    cellCoordinates(x, y) {
        let co = [x, y];
        var i;

        for (i = 0; i < 2; i++) {
            if (co[i] <= 100) {
                co[i] = 0;
            } else if (co[i] <= 200) {
                co[i] = 1;
            } else {
                co[i] = 2;
            }
        }

        return co;
    }

    printInfo(text) {
        this.mp_info.innerHTML = text;
    }


}