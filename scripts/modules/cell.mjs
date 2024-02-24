import { Drawable } from "./drawable.mjs";

export class Cell extends Drawable {
    constructor(cv, ctx, x, y, width, heigth, value) {
        super(cv, ctx, width, heigth);

        this.x = x;
        this.y = y;

        this.value = value;

        this.gridDrawn = false;
    }

    setColor(color, gridDrawn) {
        this.ctx.fillStyle = color;
        this.gridDrawn = gridDrawn;

        if (gridDrawn) {
            this.ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, this.heigth - 2);
        } else {
            this.ctx.fillRect(this.x, this.y, this.width, this.heigth);
        }
    }

    setValue(value) {
        this.value = value;
    }

    touch(value, color, gridDrawn) {
        this.value = value;
        this.setColor(color, gridDrawn);
    }

    getValue() {
        return this.value;
    }
}