const STATE = { STARTUP: 0, PLAYING: 1, GAMEOVER: 2 };

const BOARD_WIDTH = 500;
const BOARD_HEIGHT = 500;
const PADDLE_WIDTH = 25;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12.5;
const PADDLE_VELOCITY = 5;
const PADDLE_FORCE = 1.0; // 110% of speed before

class Model {
    ball;
    paddleL;
    paddleR;
    scoreL = 0;
    scoreR = 0;
    is_cpu = false;
    state = STATE.STARTUP;
    intervalID = -1;

    constructor() {
        this.resetGame();
    }

    resetGame() {
        this.state = STATE.STARTUP;
        clearTimeout(this.intervalID);
        this.resetBall();
        this.paddleL = new Paddle(2, 0, PADDLE_WIDTH, PADDLE_HEIGHT, SIDE.LEFT, "#485f88");
        this.paddleR = new Paddle(BOARD_WIDTH - PADDLE_WIDTH, 1, PADDLE_WIDTH, PADDLE_HEIGHT, SIDE.RIGHT, "#9daccc");
    }

    resetBall() {
        this.ball = new Ball(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 1, -1);
    }

}
