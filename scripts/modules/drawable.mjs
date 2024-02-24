export class Drawable {
    constructor(cv, ctx, width, heigth) {
        this.cv = cv;
        this.ctx = ctx;

        this.width = width;
        this.heigth = heigth;
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
}