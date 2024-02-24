function main() {
    createSnake();
}

function createSnake() {
    const cv = document.getElementById("snake_canvas");
    const ctx = cv.getContext("2d");

    const info = document.getElementById("snake_info");

    const SQUARE_SIZE = 30;
    const NB_X_CELLS = cv.width / SQUARE_SIZE;
    const NB_Y_CELLS = cv.height / SQUARE_SIZE;

    const GREEN_LIGHT = "#8AC926";
    const GREEN_DARK = "#43BB22";
    const BLUE_LIGHT = "#1A9AC4";
    const BLUE_DARK = "#43BB22";

    let [snake, snakeLength] = initializeSnake();

    const SNAKE_WIDTH = SQUARE_SIZE * 0.6;
    const GAP = (SQUARE_SIZE - SNAKE_WIDTH) / 2;

    let nextDirection = "N";

    document.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "z":
                if ((nextDirection != "S") && (canChangeDiretion)) {
                    nextDirection = "N";
                    canChangeDiretion = false;
                }
                break;
            case "q":
                if ((nextDirection != "E") && (canChangeDiretion)) {
                    nextDirection = "W";
                    canChangeDiretion = false;
                }
                break;
            case "s":
                if ((nextDirection != "N") && (canChangeDiretion)) {
                    nextDirection = "S";
                    canChangeDiretion = false;
                }
                break;
            case "d":
                if ((nextDirection != "W") && (canChangeDiretion)) {
                    nextDirection = "E";
                    canChangeDiretion = false;
                }
                break;
        }
    })

    function initializeSnake() {
        let snake = [];
        let snakeLength = Math.max(5, (NB_Y_CELLS / 2) - 1);

        for (let i = 0; i < snakeLength; i++) {
            snake[i] = [];
            snake[i][0] = NB_X_CELLS / 2;
            snake[i][1] = (NB_Y_CELLS / 2) + i;
            snake[i][2] = "N";
        }

        return [snake, snakeLength];
    }

    function drawBackground() {
        for (let i = 0; i < NB_X_CELLS; i++) {
            for (let j = 0; j < NB_Y_CELLS; j++) {
                if ((i % 2) == (j % 2)) {
                    ctx.fillStyle = GREEN_LIGHT;
                } else {
                    ctx.fillStyle = GREEN_DARK;
                }

                ctx.fillRect(i * SQUARE_SIZE, j * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
            }
        }
    }

    function drawHead(diff) {
        ctx.fillStyle = BLUE_LIGHT;

        switch (snake[0][2]) {
            case "N":
                ctx.fillRect(snake[0][0] * SQUARE_SIZE + GAP, snake[0][1] * SQUARE_SIZE + SQUARE_SIZE * (1 - diff), SNAKE_WIDTH, SQUARE_SIZE * diff);
                return;
            case "S":
                ctx.fillRect(snake[0][0] * SQUARE_SIZE + GAP, snake[0][1] * SQUARE_SIZE, SNAKE_WIDTH, (SQUARE_SIZE) * diff);
                return;
            case "E":
                ctx.fillRect(snake[0][0] * SQUARE_SIZE, snake[0][1] * SQUARE_SIZE + GAP, (SQUARE_SIZE) * diff, SNAKE_WIDTH);
                return;
            case "W":
                ctx.fillRect(snake[0][0] * SQUARE_SIZE + SQUARE_SIZE * (1 - diff), snake[0][1] * SQUARE_SIZE + GAP, (SQUARE_SIZE) * diff, SNAKE_WIDTH);
                return;
        }
    }

    function drawBodyPart(i) {
        ctx.fillStyle = BLUE_LIGHT;

        switch (snake[i][2]) {
            case "N":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE + GAP, snake[i][1] * SQUARE_SIZE, SNAKE_WIDTH, SQUARE_SIZE - GAP);
                break;
            case "S":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE + GAP, snake[i][1] * SQUARE_SIZE + GAP, SNAKE_WIDTH, SQUARE_SIZE - GAP);
                break;
            case "E":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE + GAP, snake[i][1] * SQUARE_SIZE + GAP, SQUARE_SIZE - GAP, SNAKE_WIDTH);
                break;
            case "W":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE, snake[i][1] * SQUARE_SIZE + GAP, SQUARE_SIZE - GAP, SNAKE_WIDTH);
                break;
        }

        switch (snake[i + 1][2]) {
            case "N":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE + GAP, snake[i][1] * SQUARE_SIZE + GAP, SNAKE_WIDTH, SQUARE_SIZE - GAP);
                return;
            case "S":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE + GAP, snake[i][1] * SQUARE_SIZE, SNAKE_WIDTH, SQUARE_SIZE - GAP);
                return;
            case "E":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE, snake[i][1] * SQUARE_SIZE + GAP, SQUARE_SIZE - GAP, SNAKE_WIDTH);
                return;
            case "W":
                ctx.fillRect(snake[i][0] * SQUARE_SIZE + GAP, snake[i][1] * SQUARE_SIZE + GAP, SQUARE_SIZE - GAP, SNAKE_WIDTH);
                return;
        }
    }

    function drawTail(diff) {
        ctx.fillStyle = BLUE_LIGHT;

        switch (snake[snakeLength - 1][2]) {
            case "N":
                ctx.fillRect(snake[snakeLength - 1][0] * SQUARE_SIZE + GAP, snake[snakeLength - 1][1] * SQUARE_SIZE, SNAKE_WIDTH, SQUARE_SIZE * (1 - diff));
                return;
            case "S":
                ctx.fillRect(snake[snakeLength - 1][0] * SQUARE_SIZE + GAP, snake[snakeLength - 1][1] * SQUARE_SIZE + SQUARE_SIZE * diff, SNAKE_WIDTH, SQUARE_SIZE * (1 - diff));
                return;
            case "E":
                ctx.fillRect(snake[snakeLength - 1][0] * SQUARE_SIZE + (SQUARE_SIZE) * (diff), snake[snakeLength - 1][1] * SQUARE_SIZE + GAP, SQUARE_SIZE * (1 - diff), SNAKE_WIDTH);
                return;
            case "W":
                ctx.fillRect(snake[snakeLength - 1][0] * SQUARE_SIZE, snake[snakeLength - 1][1] * SQUARE_SIZE + GAP, (SQUARE_SIZE) * (1 - diff), SNAKE_WIDTH);
                return;
        }

    }

    function drawSnake(diff) {
        drawHead(diff);

        for (let i = 1; i < snakeLength - 1; i++) {
            drawBodyPart(i);
        }

        drawTail(diff);
    }

    function draw() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        drawBackground();
        drawSnake(diff);

        diff = Math.min(diff + 0.01, 1);

        if (diff == 1) {
            diff = 0;
            snake.pop();
            canChangeDiretion = true;

            switch (nextDirection) {
                case "N":
                    snake.unshift([snake[0][0], snake[0][1] - 1, nextDirection]);
                    break;
                case "S":
                    snake.unshift([snake[0][0], snake[0][1] + 1, nextDirection]);
                    break;
                case "E":
                    snake.unshift([snake[0][0] + 1, snake[0][1], nextDirection]);
                    break;
                case "W":
                    snake.unshift([snake[0][0] - 1, snake[0][1], nextDirection]);
                    break;
            }
        }

        requestAnimationFrame(draw);

    }

    let diff = 0.8;
    let canChangeDiretion = false;

    requestAnimationFrame(draw);

}