"use strict";

const ARRAY_BLOCKS_DESTROYABLE = [];
const ARRAY_BLOCKS_REMAINING = [];
const ARRAY_IMAGES_BLOCKS = {
    0: "./assets/img/block_red.png",
    1: "./assets/img/block_orange.png",
    2: "./assets/img/block_purple.png",
    3: "./assets/img/block_green.png",
    4: "./assets/img/block_cyan.png",
};

const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 30;
const COUNT_ROWS_BLOCKS = 5;
const COUNT_COLS_BLOCKS = 14;

const ARRAY_FRASE = {
    0: { name: "FLEXIBILITAT", color: "red", description: "La <strong><u>flexibilitat</u></strong> és la capacitat que té un alumne en treballar amb una visió global del projecte, tant del producte/servei com de l'aprenentatge. Això permet fer adaptacions fàcilment." },
    1: { name: "RESPONSABILITAT", color: "orange", description: "La <strong><u>responsabilitat</u></strong> és la capacitat en que un alumne coneix els objectius amb precisió i es treballa de manera continuada i intensiva." },
    2: { name: "AUTONOMIA", color: "purple", description: "La <strong><u>autonomia</u></strong> és la capacitat en que un alumne pot prendre una decisió i també pot atendre els suggeriments d'una autoritat considerada igual, superior o interior en una escala jeràrquica." },
    3: { name: "SOCIABILITAT", color: "green", description: "La <strong><u>sociabilitat</u></strong> és la capacitat en que un alumne es comunica intensivament tant en el temps i espai acadèmic com a fora d'ell." },
    4: { name: "EVOLUCIO", color: "cyan", description: "La <strong><u>evolució</u></strong> és la capacitat en que un alumne treballa de manera constant, completant els fulls de ruta amb escrit crític. Hi ha preocupació entrenant el sentit de cada tasca i com connecta amb el global del projecte." },
};

const ARRAY_ITEMS = [];
const ARRAY_TYPES_ITEMS = {
    0: {
        type: "add 15 seconds",
        speed: 2,
        image_url: "./assets/img/timer_plus_15.png",
        function: () => {
            if (timer) timer.add_seconds(15);
            //Add +15s message to ship.
            if (ship) {
                ship.sprite.dataset.before = "+15 s";

                setTimeout(() => {

                    //Remove the message from ship.
                    if (ship) ship.sprite.dataset.before = "";
                }, 2000);
            }
        },
    },
    1: {
        type: "add 100 points",
        speed: 2,
        image_url: "./assets/img/100p.png",
        function: () => {
            if (ship) {
                ship.add_points(100);
            }
        },
    },
};

const TIME_UPDATE_ITEM = 1000 / 60; //In milliseconds (ms).

const BALL_WIDTH_HEIGHT = 15;
const SPEED_DEFAULT_X_BALL = 5;
const SPEED_DEFAULT_Y_BALL = 10;
const TIME_UPDATE_BALL = 1000 / 60; //In milliseconds (ms).

const SHIP_WIDTH = 120;
const SHIP_HEIGHT = 20;
const ACCUMULATE_POINTS_DEFAULT = 100;
const SPEED_DEFAULT_SHIP = 12;
const TIME_REPEAT_CONTROLLER = 1000 / 60; //In milliseconds (ms).

const TIMER_MINUTES_DEFAULT = 1;
const TIMER_SECONDS_DEFAULT = 0;

const POINTS_ELEMENT = STATS_ELEMENT.querySelector("#points");
const TIMER_ELEMENT = STATS_ELEMENT.querySelector("#timer");

let ship = null;
let ball = null;
let content_blocks = null;
let content_frase = null;
let timer = null;

class Ball {
    constructor(
        ship,
        width,
        height,
        x,
        y,
        image,
        speed_default_x,
        speed_default_y,
        time_update
    ) {
        this.ship = ship;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.default_position_x = x;
        this.default_position_y = y;
        this.image = image;
        this.speed_default_x = speed_default_x;
        this.speed_default_y = speed_default_y;
        this.directionX = 1;
        this.directionY = 1;
        this.speedX = 0;
        this.speedY = 0;
        this.time_update = time_update;
    }

    create() {
        if (!this.sprite) {
            this.sprite = document.createElement("div");

            Object.assign(this.sprite.style, {
                position: "absolute",
                borderRadius: "50%",
                width: `${this.width}px`,
                height: `${this.height}px`,
                left: `${this.default_position_x}px`,
                top: `${this.default_position_y}px`,
                backgroundImage: `url(${this.image})`,
                backgroundSize: "cover",
                animation: "create_sprite .80s",
            });

            BOARD_GAME_ELEMENT.appendChild(this.sprite);
        } else {
            Object.assign(this.sprite.style, {
                width: `${this.width}px`,
                height: `${this.height}px`,
                left: `${this.default_position_x}px`,
                top: `${this.default_position_y}px`,
                animation: "",
            });

            this.draw();
        }
    }

    draw() {
        this.sprite.style.left = `${this.x}px`;
        this.sprite.style.top = `${this.y}px`;
    }

    update() {
        if (this.speedX !== 0 && this.speedY !== 0) {
            //Check if the ball intersect with border right or border left of board.
            if (this.x + this.width > BOARD_WIDTH - BORDER_WIDTH) {
                this.directionX = -1;
            } else if (this.x - BORDER_WIDTH < 0) {
                this.directionX = 1;
            }

            //Check if the ball touch border bottom or border top of board.
            if (this.y + this.height > BOARD_HEIGHT - BORDER_WIDTH) {
                //this.directionY = -1;
                this.respawn();
                this.ship.die();

                return;
            } else if (this.y - BORDER_WIDTH < 0) {
                this.directionY = 1;
            }

            //Check if the ball is intersect with the ship.
            if (intersect(this, this.ship)) {
                //Only change direction when the direction Y is positive, in other words, when the ball goes down.
                if (this.directionY === 1) {
                    //Check if the ball not exceded the ship height.
                    if (this.y + this.height < this.ship.y + this.ship.height / 2) {
                        //If the ball is touch the left side of the ship.

                        let isIntersectLeftRight = false;

                        let cloneShipLeft = { ...this.ship };
                        cloneShipLeft.width /= 5;

                        let cloneShipRight = { ...this.ship };
                        cloneShipRight.x += cloneShipRight.width - cloneShipRight.width / 5;

                        //If ball touch the left side of the ship.
                        if (intersect(this, cloneShipLeft)) {
                            isIntersectLeftRight = true;

                            this.directionX = -1;
                        } else if (intersect(this, cloneShipRight)) {
                            //If ball touch the right side of the ship.
                            isIntersectLeftRight = true;

                            this.directionX = 1;
                        } else {
                            //If the ball touch center of the ship.
                            this.speedX = SPEED_DEFAULT_X_BALL;
                            this.speedY = SPEED_DEFAULT_Y_BALL;
                        }

                        if (isIntersectLeftRight) {
                            cloneShipLeft.width /= 2;
                            cloneShipRight.x += cloneShipLeft.width;

                            if (
                                intersect(this, cloneShipLeft) ||
                                intersect(this, cloneShipRight)
                            ) {
                                this.speedX = this.speed_default_x + 5;
                                this.speedY = this.speed_default_y - 5;
                            } else {
                                this.speedX = this.speed_default_x;
                                this.speedY = this.speed_default_y;
                            }
                        }

                        cloneShipLeft = null;
                        cloneShipRight = null;

                        this.directionY = -1;
                    }
                }
            }

            let indexBlocks = 0;
            let blocksTouch = [];
            let blockDestroy = null;

            //Loop to check if the ball intersect with any blocks.
            while (indexBlocks < ARRAY_BLOCKS_REMAINING.length) {
                if (intersect(this, ARRAY_BLOCKS_REMAINING[indexBlocks])) {
                    blocksTouch.push(ARRAY_BLOCKS_REMAINING[indexBlocks]);
                }

                indexBlocks++;
            }

            //If ball touch more than one block. Check which block will destroy.
            if (blocksTouch.length > 1) {
                let lessOffset = Number.MAX_VALUE;

                for (let i = 0; i < blocksTouch.length; i++) {
                    let block_rect = blocksTouch[i].sprite.getBoundingClientRect();
                    let ball_rect = ball.sprite.getBoundingClientRect();

                    let offsetBottom = Math.abs(block_rect.bottom - ball_rect.bottom);
                    let offsetTop = Math.abs(block_rect.top - ball_rect.top);
                    let offsetRight = Math.abs(block_rect.right - ball_rect.right);
                    let offsetLeft = Math.abs(block_rect.left - ball_rect.left);

                    let totalOffset = offsetBottom + offsetTop + offsetRight + offsetLeft;

                    if (totalOffset < lessOffset) {
                        blockDestroy = blocksTouch[i];
                        lessOffset = totalOffset;
                    }
                }
            } else if (blocksTouch.length == 1) {
                blockDestroy = blocksTouch[0];
            }

            //If ball is intersect any block.
            if (blockDestroy !== null) {
                blockDestroy.destroy();
                blockDestroy.check_border_intersect(this);
                blockDestroy.generate_item(this.ship);

                let block_destroy_index = ARRAY_BLOCKS_REMAINING.indexOf(blockDestroy);
                ARRAY_BLOCKS_REMAINING.splice(block_destroy_index, 1);

                this.ship.add_points(ACCUMULATE_POINTS_DEFAULT);

                if (Object.values(ARRAY_BLOCKS_REMAINING).length === 0) {
                    win();
                }
            }

            this.x += this.speedX * this.directionX;
            this.y += this.speedY * this.directionY;
        }

        this.draw();
    }

    respawn() {
        this.speedX = 0;
        this.speedY = 0;
        this.directionX = 1;
        this.directionY = 1;
        this.x = this.default_position_x;
        this.y = this.default_position_y;

        clearInterval(this.interval_ball);
        this.interval_ball = null;

        this.create();
    }
}
class Ship {
    constructor(width, height, x, y, image, speed) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.default_position_x = x;
        this.default_position_y = y;
        this.image = image;
        this.directionX = 1;
        this.speed = speed;
        this.isMove = false;
        this.points = 0;
        this.combo_points = 1;
        this.count_blocks_destroy = 0;
    }

    create() {
        if (!this.sprite) {
            this.sprite = document.createElement("div");
            this.sprite.id = "ship";
            this.sprite.dataset.before = "";

            Object.assign(this.sprite.style, {
                position: "absolute",
                width: `${this.width}px`,
                height: `${this.height}px`,
                left: `${this.default_position_x}px`,
                top: `${this.default_position_y}px`,
                backgroundImage: `url(${this.image})`,
                backgroundSize: `${this.width}px ${this.height}px`,
                animation: "create_sprite .80s",
            });

            //Add arrow direction shoot.
            this.arrow_direction_shoot = document.createElement("i");
            this.arrow_direction_shoot.classList.add(
                "fas",
                "fa-long-arrow-alt-right"
            );
            this.arrow_direction_shoot.style.visibility = "hidden";

            this.sprite.appendChild(this.arrow_direction_shoot);

            BOARD_GAME_ELEMENT.appendChild(this.sprite);
        } else {
            Object.assign(this.sprite.style, {
                width: `${this.width}px`,
                height: `${this.height}px`,
                left: `${this.default_position_x}px`,
                top: `${this.default_position_y}px`,
                animation: "",
            });

            //Make visible the arrow direction shoot.
            this.arrow_direction_shoot.style.visibility = "visible";

            this.draw();
        }

        //Set default direction arrow (right).
        this.set_arrow_direction(1);
    }

    draw() {
        this.sprite.style.left = `${this.x}px`;
        this.sprite.style.top = `${this.y}px`;
    }

    add_points(points) {
        this.points += this.combo_points * points;

        POINTS_ELEMENT.innerText = `${this.points}p`;
    }

    substract_points(points) {
        this.points -= points;

        //Add message to ship.
        this.sprite.dataset.before = `-${points}p`;

        setTimeout(() => {
            //Remove the message from ship.
            this.sprite.dataset.before = "";
        }, 2000);

        POINTS_ELEMENT.innerText = `${this.points}p`;
    }

    update() {
        let newX = this.x + this.speed * this.directionX;

        if (
            newX + this.width <= BOARD_WIDTH - BORDER_WIDTH &&
            newX - BORDER_WIDTH >= 0
        ) {
            this.x = newX;
            this.isMove = true;
            this.draw();
        } else {
            this.isMove = false;
        }
    }

    set_arrow_direction(direction) {
        //If is -1 is left.
        //If is 1 is right.
        if (direction === -1) {
            Object.assign(this.arrow_direction_shoot.style, {
                color: "white",
                fontSize: "50px",
                position: "absolute",
                left: `${(this.width - (this.width - 32)) / 2}px`,
                top: `-70px`,
                transform: "rotate(-115deg)",
            });

            this.direction_shoot = -1;
        } else {
            Object.assign(this.arrow_direction_shoot.style, {
                color: "white",
                fontSize: "50px",
                position: "absolute",
                left: `${(this.width - 10) / 2}px`,
                top: `-70px`,
                transform: "rotate(-65deg)",
            });

            this.direction_shoot = 1;
        }
    }

    die() {
        //Add blink effect on ship.
        let interval_blink = setInterval(() => {
            this.sprite.style.visibility =
                this.sprite.style.visibility === "hidden" ? "" : "hidden";
        }, 100);

        setTimeout(() => {
            clearInterval(interval_blink);
            interval_blink = null;
            this.sprite.style.visibility = "visible";
        }, 1000);

        this.x = this.default_position_x;
        this.y = this.default_position_y;

        this.substract_points(200);

        this.create();
    }
}
class Block {
    constructor(
        content_blocks,
        width,
        height,
        x,
        y,
        image,
        row,
        col,
        isDestroy,
        isVisible
    ) {
        this.content_blocks = content_blocks;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = image;
        this.row = row;
        this.col = col;
        this.isDestroy = isDestroy;
        this.isVisible = isVisible;
    }

    create() {
        if (!this.sprite) this.sprite = document.createElement("div");

        Object.assign(this.sprite.style, {
            backgroundImage: `url(${this.image})`,
            backgroundSize: "100% 100%",
            visibility: `${this.isVisible ? "visible" : "hidden"}`,
            animation: "create_sprite .80s",
        });

        this.content_blocks.appendChild(this.sprite);
    }

    destroy() {
        Object.assign(this.sprite.style, {
            transition: "transform .40s",
            transform: "scale(0)",
        });

        this.isDestroy = true;
    }

    check_border_intersect(ball) {
        let block_rect = this.sprite.getBoundingClientRect();
        let ball_rect = ball.sprite.getBoundingClientRect();

        let offsetBottom = Math.abs(block_rect.bottom - ball_rect.top);
        let offsetTop = Math.abs(block_rect.top - ball_rect.bottom);
        let offsetRight = Math.abs(block_rect.right - ball_rect.left);
        let offsetLeft = Math.abs(block_rect.left - ball_rect.right);

        if (offsetBottom < Math.min(offsetTop, offsetLeft, offsetRight)) {
            if (ball.directionY == -1) {
                ball.directionY = 1;
            } else {
                ball.directionX *= -1;
            }
        } else if (offsetTop < Math.min(offsetBottom, offsetLeft, offsetRight)) {
            if (ball.directionY == 1) {
                ball.directionY = -1;
            } else {
                ball.directionX *= -1;
            }
        } else if (offsetLeft < Math.min(offsetTop, offsetBottom, offsetRight)) {
            if (ball.directionX == 1) {
                ball.directionX = -1;
            } else {
                ball.directionY *= -1;
            }
        } else if (offsetRight < Math.min(offsetTop, offsetBottom, offsetLeft)) {
            if (ball.directionX == -1) {
                ball.directionX = 1;
            } else {
                ball.directionY *= -1;
            }
        }
    }

    generate_item(ship) {
        if (this.isDestroy) {
            let type_item = null;

            if (timer.seconds < 30 && timer.minutes === 0) {
                if (!ARRAY_ITEMS.some((items) => items.type === ARRAY_TYPES_ITEMS[0])) {
                    type_item = ARRAY_TYPES_ITEMS[0];
                } else {
                    if (
                        !ARRAY_ITEMS.some((items) => items.type === ARRAY_TYPES_ITEMS[1])
                    ) {
                        type_item = ARRAY_TYPES_ITEMS[1];
                    }
                }
            } else {
                if (!ARRAY_ITEMS.some((items) => items.type === ARRAY_TYPES_ITEMS[1])) {
                    type_item = ARRAY_TYPES_ITEMS[1];
                }
            }

            if (type_item !== null) {
                let item = new Item(this, ship, type_item, TIME_UPDATE_ITEM);
                item.create();

                ARRAY_ITEMS.push(item);
            }
        }
    }
}
class Timer {
    constructor() {
        this.minutes = TIMER_MINUTES_DEFAULT;
        this.seconds = TIMER_SECONDS_DEFAULT;
    }

    start() {
        this.interval_timer = setInterval(() => {
            this.seconds--;

            if (this.seconds < 0) {
                this.seconds = 59;
                this.minutes--;
            }

            //If time remaining is less than 00:30.
            if (this.minutes === 0 && this.seconds <= 30) {
                BOARD_GAME_ELEMENT.style.animation = "board_shadow 1s infinite";
            } else {
                BOARD_GAME_ELEMENT.style.animation = "";
            }

            if (this.minutes < 0) {
                game_over();
            } else {
                TIMER_ELEMENT.innerText = `${this.minutes < 10 ? `0${this.minutes}` : this.minutes
                    }:${this.seconds < 10 ? `0${this.seconds}` : this.seconds}`;
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval_timer);
        this.interval_timer = null;
    }

    restart() {
        this.minutes = TIMER_MINUTES_DEFAULT;
        this.seconds = TIMER_SECONDS_DEFAULT;

        this.start();
    }

    substract_seconds(seconds) {
        let diff_seconds = timer.seconds - seconds;

        if (diff_seconds < 0) {
            timer.seconds = 59 - Math.abs(diff_seconds);

            timer.minutes--;
        } else {
            timer.seconds = diff_seconds;
        }

        if (timer.minutes < 0) {
            TIMER_ELEMENT.innerText = "00:00";
        } else {
            TIMER_ELEMENT.innerText = `${timer.minutes < 10 ? `0${timer.minutes}` : timer.minutes
                }:${timer.seconds < 10 ? `0${timer.seconds}` : timer.seconds}`;
        }
    }

    add_seconds(seconds) {
        let diff_seconds = timer.seconds + seconds;

        if (diff_seconds > 59) {
            timer.seconds = diff_seconds - 59;

            timer.minutes++;
        } else {
            timer.seconds = diff_seconds;
        }

        if (timer.minutes < 0) {
            TIMER_ELEMENT.innerText = "00:00";
        } else {
            TIMER_ELEMENT.innerText = `${timer.minutes < 10 ? `0${timer.minutes}` : timer.minutes
                }:${timer.seconds < 10 ? `0${timer.seconds}` : timer.seconds}`;
        }
    }
}
class Item {
    constructor(block, ship, type, time_update) {
        this.x = block.x;
        this.y = block.y;
        this.width = BLOCK_WIDTH;
        this.height = BLOCK_HEIGHT;
        this.ship = ship;
        this.type = type;
        this.time_update = time_update;
    }

    create() {
        this.sprite = document.createElement("div");

        Object.assign(this.sprite.style, {
            position: "absolute",
            width: `${this.width}px`,
            height: `${this.height}px`,
            left: `${this.x}px`,
            top: `${this.y}px`,
            zIndex: 3,
            backgroundImage: `url(${this.type.image_url})`,
            backgroundSize: `${this.width}px ${this.height}px`,
            backgroundRepeat: "no-repeat",
        });

        this.interval_item = setInterval(() => this.update(), this.time_update);

        BOARD_GAME_ELEMENT.appendChild(this.sprite);
    }

    draw() {
        this.sprite.style.left = `${this.x}px`;
        this.sprite.style.top = `${this.y}px`;
    }

    update() {
        //Check if the ball touch border bottom or border top of board.
        if (this.y + this.height > BOARD_HEIGHT - BORDER_WIDTH) {
            //Remove item.
            this.remove();
        }

        //If item intersect with ship.
        if (intersect(this, this.ship)) {
            this.type.function();

            this.remove();
        }

        this.y += this.type.speed;

        this.draw();
    }

    remove() {
        clearInterval(this.interval_item);
        this.interval_item = null;

        BOARD_GAME_ELEMENT.removeChild(this.sprite);

        let index_remove = ARRAY_ITEMS.indexOf(this);

        if (index_remove > -1) {
            ARRAY_ITEMS.splice(index_remove, 1);
        }
    }
}

function init_game() {
    STATS_ELEMENT.style.display = "block";
    POINTS_ELEMENT.innerText = "0p";
    BOARD_GAME_ELEMENT.style.display = "block";
    BOARD_GAME_FINISH_ELEMENT.style.display = "none";
    TIMER_ELEMENT.innerText = "00:00";

    timer = new Timer();

    //Create ship.
    ship = new Ship(
        SHIP_WIDTH,
        SHIP_HEIGHT,
        (BOARD_WIDTH - SHIP_WIDTH) / 2,
        (BOARD_HEIGHT - SHIP_HEIGHT) / 1.15,
        "./assets/img/ship.png",
        SPEED_DEFAULT_SHIP
    );
    ship.create();

    //Create ball.
    ball = new Ball(
        ship,
        BALL_WIDTH_HEIGHT,
        BALL_WIDTH_HEIGHT,
        (BOARD_WIDTH - BALL_WIDTH_HEIGHT) / 2,
        ship.y - BALL_WIDTH_HEIGHT,
        "./assets/img/ball.png",
        SPEED_DEFAULT_X_BALL,
        SPEED_DEFAULT_Y_BALL,
        TIME_UPDATE_BALL
    );
    ball.create();

    //Create content blocks.
    create_content_blocks(() => {
        //When finish content blocks, then create content frase.
        create_content_frase();

        create_count_down(() => {

            if (!timer.interval_timer) {
                timer.start();
            }

            //Make visible the arrow direction shoot.
            ship.arrow_direction_shoot.style.visibility = "visible";

            //Create controllers game.
            //Code 39 => Move left
            //Code 37 <= Move right
            //Code 38 Set direction shoot left
            //Code 40 Set direciton shoot right
            //Code 32 Space bar
            keyboard_controller(
                {
                    37: function () {
                        if (ship != null && ball != null) {
                            ship.directionX = -1;
                            ship.update();

                            if (ball.speedX === 0 && ball.speedY === 0 && ship.isMove) {
                                ball.x -= SPEED_DEFAULT_SHIP;
                                ball.update();
                            }
                        }
                    },
                    38: function () {
                        if (
                            ship != null &&
                            ball != null &&
                            ball.speedX === 0 &&
                            ball.speedY === 0
                        ) {
                            ship.set_arrow_direction(-1);
                        }
                    },
                    39: function () {
                        if (ship != null && ball != null) {
                            ship.directionX = 1;
                            ship.update();

                            if (ball.speedX === 0 && ball.speedY === 0 && ship.isMove) {
                                ball.x += SPEED_DEFAULT_SHIP;
                                ball.update();
                            }
                        }
                    },
                    40: function () {
                        if (
                            ship != null &&
                            ball != null &&
                            ball.speedX === 0 &&
                            ball.speedY === 0
                        ) {
                            ship.set_arrow_direction(1);
                        }
                    },
                    32: function () {
                        if (ship != null && ball != null) {
                            if (ball.speedX === 0 && ball.speedY === 0) {
                                ship.arrow_direction_shoot.style.visibility = "hidden";

                                ball.directionX = ship.direction_shoot;

                                ball.speedX = SPEED_DEFAULT_X_BALL;
                                ball.speedY = SPEED_DEFAULT_Y_BALL;

                                ball.interval_ball = setInterval(function () {
                                    ball.update();
                                }, ball.time_update);
                            }
                        }
                    },
                },
                TIME_REPEAT_CONTROLLER
            );
        });
    });
}

function create_count_down(callback) {
    let contentCountDown = document.createElement("div");
    contentCountDown.classList.add("countdown");
    contentCountDown.innerText = "3";

    BOARD_GAME_ELEMENT.appendChild(contentCountDown);

    let countdown = setInterval(function () {
        let text = Number.parseInt(contentCountDown.innerText) - 1;

        contentCountDown.innerText = "";

        if (text !== 0 && !isNaN(text)) {
            contentCountDown.innerText = text;
        } else if (text === 0 && !isNaN(text)) {
            text = "GO!";
            contentCountDown.innerText = text;
        } else {
            clearInterval(countdown);
            countdown = null;
        }
    }, 1000);

    setTimeout(callback, 3500);
}

function create_content_blocks(callback) {
    content_blocks = document.createElement("div");

    let width_content = BLOCK_WIDTH * COUNT_COLS_BLOCKS;
    let height_content = BLOCK_HEIGHT * COUNT_ROWS_BLOCKS;

    //Create content grid of blocks.
    Object.assign(content_blocks.style, {
        position: "absolute",
        display: "grid",
        width: `${width_content}px`,
        height: `${height_content}px`,
        top: `${BORDER_WIDTH * 5}px`,
        zIndex: 2,
        left: `${BOARD_WIDTH / 2 - width_content / 2}px`,
        gridTemplateColumns: `repeat(${COUNT_COLS_BLOCKS}, ${BLOCK_WIDTH}px)`,
        gridTemplateRows: `repeat(${COUNT_ROWS_BLOCKS}, ${BLOCK_HEIGHT}px)`,
    });

    BOARD_GAME_ELEMENT.appendChild(content_blocks);

    //Create blocks.
    for (let row = 0; row < COUNT_ROWS_BLOCKS; row++) {
        for (let col = 0; col < COUNT_COLS_BLOCKS; col++) {
            let isDestroy = false;
            let isVisible = true;

            //Make this design of content blocks.
            /*
                -- --------- --
                -- --------- --
                -- --------- --
                -- --------- --
            */
            if (col == 2 || col == COUNT_COLS_BLOCKS - 3) {
                isDestroy = true;
                isVisible = false;
            } else {
                isDestroy = false;
                isVisible = true;
            }

            let block = new Block(
                content_blocks,
                BLOCK_WIDTH,
                BLOCK_HEIGHT,
                content_blocks.offsetLeft + BLOCK_WIDTH * col,
                content_blocks.offsetTop + BLOCK_HEIGHT * row,
                ARRAY_IMAGES_BLOCKS[row],
                row,
                col,
                isDestroy,
                isVisible
            );

            block.create();

            if (isVisible && !isDestroy) {
                ARRAY_BLOCKS_DESTROYABLE.push(block);
                ARRAY_BLOCKS_REMAINING.push(block);
            }
        }
    }

    setTimeout(callback, 1500);
}

function create_content_frase() {
    content_frase = document.createElement("div");

    let width_content = BLOCK_WIDTH * COUNT_COLS_BLOCKS;
    let height_content = BLOCK_HEIGHT * COUNT_ROWS_BLOCKS;

    Object.assign(content_frase.style, {
        position: "absolute",
        display: "grid",
        width: `${width_content}px`,
        height: `${height_content}px`,
        zIndex: 1,
        top: `${BORDER_WIDTH * 5}px`,
        left: `${BOARD_WIDTH / 2 - width_content / 2}px`,
        gridTemplateColumns: "1fr",
        gridTemplateRows: `repeat(${COUNT_ROWS_BLOCKS}, ${BLOCK_HEIGHT}px)`,
    });

    //Create frase.
    for (let row = 0; row < COUNT_ROWS_BLOCKS; row++) {
        let frase = ARRAY_FRASE[row];

        let div_frase = document.createElement("div");
        let span_frase = document.createElement("span");

        Object.assign(div_frase.style, {
            color: frase["color"],
            fontSize: "24px",
            textAlign: "center",
            paddingTop: "2px",
        });

        span_frase.dataset.description = frase["description"];
        span_frase.innerText = frase["name"];
        span_frase.style.position = "relative";

        div_frase.appendChild(span_frase);

        content_frase.appendChild(div_frase);
    }

    BOARD_GAME_ELEMENT.appendChild(content_frase);
}

//Keyboard input with customizable repeat (set to 0 for no key repeat).
function keyboard_controller(keys, repeat) {
    //Lookup of key codes to timer ID, or null for no repeat.
    var timers = {};

    //When key is pressed and we don't already think it's pressed, call the
    //key action callback and set a timer to generate another one after a delay.
    document.onkeydown = function (event) {
        var key = (event || window.event).keyCode;

        if (typeof key !== "undefined") {
            if (!(key in keys)) {
                return true;
            }

            if (!(key in timers)) {
                timers[key] = null;
                keys[key]();

                if (repeat !== 0) {
                    timers[key] = setInterval(keys[key], repeat);
                }
            }
        }

        return false;
    };

    //Cancel timeout and mark key as released on keyup.
    document.onkeyup = function (event) {
        var key = (event || window.event).keyCode;

        if (typeof key !== "undefined") {
            if (key in timers) {
                if (timers[key] !== null) {
                    clearInterval(timers[key]);
                    timers[key] = null;
                }

                delete timers[key];
            }
        }
    };
}

/**
 * Check if two elements is intersect.
 * @param {*} element1 The object 1 with x, y, width, height values.
 * @param {*} element2 The object 2 with x, y, width, height values.
 * @returns Returns true if intersect, otherwise, false.
 */
function intersect(element1, element2) {
    let isIntersect = true;

    if (
        element1.x > element2.x + element2.width ||
        element2.x > element1.x + element1.width
    )
        isIntersect = false;
    if (
        element1.y > element2.y + element2.height ||
        element2.y > element1.y + element1.height
    )
        isIntersect = false;

    return isIntersect;
}

function win() {
    //If the length of array blocks ramaining is equal than 0.
    //if (Object.values(ARRAY_BLOCKS_REMAINING).length === 0) {
    if (true) {
        timer.stop();

        clearInterval(timer.interval_timer);
        timer.interval_timer = null;

        clearInterval(ball.interval_ball);
        ball.interval_ball = null;

        STATS_ELEMENT.style.display = "none";

        BOARD_GAME_ELEMENT.style.animation = "";
        BOARD_GAME_ELEMENT.removeChild(ship.sprite);
        BOARD_GAME_ELEMENT.removeChild(ball.sprite);
        BOARD_GAME_ELEMENT.removeChild(content_blocks);

        ARRAY_BLOCKS_DESTROYABLE.splice(0, ARRAY_BLOCKS_DESTROYABLE.length);

        ARRAY_BLOCKS_REMAINING.splice(0, ARRAY_BLOCKS_REMAINING.length);

        ARRAY_ITEMS.slice(0).forEach((item) => item.remove());
        ARRAY_ITEMS.splice(0, ARRAY_ITEMS.length);

        //Add event listener hover in span frase to show more information.
        content_frase.querySelectorAll("span").forEach(element => {
            element.addEventListener("mouseover", e => {
                if (!element.firstElementChild) {
                    let ballon_message = document.createElement("div");

                    let message = document.createElement("p");
                    message.innerHTML = e.target.dataset.description;

                    ballon_message.appendChild(message);

                    element.appendChild(ballon_message);

                    ballon_message.style.position = "absolute";
                    ballon_message.style.fontSize = "12px";
                    ballon_message.style.width = "500px";
                    ballon_message.style.border = "5px white dashed";
                    ballon_message.style.display = "inline-block";
                    ballon_message.style.backgroundColor = "black";
                    ballon_message.style.padding = "20px";
                    ballon_message.style.top = `-${ballon_message.getBoundingClientRect().height}px`;
                }
            });

            element.addEventListener("mouseleave", e => {
                if (element.firstElementChild) {
                    element.removeChild(element.firstElementChild);
                }
            });
        });

        //Show game over menu over game .
        BOARD_GAME_FINISH_ELEMENT.style.position = "absolute";
        BOARD_GAME_FINISH_ELEMENT.style.top = "120px";
        BOARD_GAME_FINISH_ELEMENT.style.left = "0px";
        BOARD_GAME_FINISH_ELEMENT.style.padding = "50px";
        
        //Add 500 points extra.
        ship.points += 500;

        send_score(ship.points, (data, previous_score) => {
            //Show game over menu.
            BOARD_GAME_FINISH_ELEMENT.querySelector("#text-game-finish").innerHTML =
                "<u><strong>Enhorabona has guanyat!</strong></u>" +
                "<br/><br/>" +
                "Com pots veure la FRASE són les sigles de Flexibilitat, Responsabilitat, Autonomia, Sociabilitat y Evolució." +
                "<br/><br/>" +
                "<small>(Pots veure més informació si passes el cursor per damunt de la paraula)<small>";
            BOARD_GAME_FINISH_ELEMENT.querySelector("#points-game-finish").innerText = `${previous_score} punts`;
            BOARD_GAME_FINISH_ELEMENT.querySelectorAll("#content-game-finish > div").forEach((element, index) => setTimeout(() => element.style.visibility = "visible", 1000 * index));
            BOARD_GAME_FINISH_ELEMENT.style.display = "flex";
        });

        ship = null;
        ball = null;
        timer = null;
    }
}

function game_over() {
    //Game over if the minutes is less than minutes and the length of array blocks remaining is not equal than 0.
    if (timer.minutes < 0 && ARRAY_BLOCKS_REMAINING.length !== 0) {
        timer.stop();

        TIMER_ELEMENT.innerText = "00:00";

        clearInterval(timer.interval_timer);
        timer.interval_timer = null;

        clearInterval(ball.interval_ball);
        ball.interval_ball = null;

        STATS_ELEMENT.style.display = "none";

        BOARD_GAME_ELEMENT.style.animation = "";
        BOARD_GAME_ELEMENT.removeChild(ship.sprite);
        BOARD_GAME_ELEMENT.removeChild(ball.sprite);
        BOARD_GAME_ELEMENT.removeChild(content_blocks);
        BOARD_GAME_ELEMENT.removeChild(content_frase);

        ARRAY_BLOCKS_DESTROYABLE.splice(0, ARRAY_BLOCKS_DESTROYABLE.length);

        ARRAY_BLOCKS_REMAINING.splice(0, ARRAY_BLOCKS_REMAINING.length);

        ARRAY_ITEMS.slice(0).forEach((item) => item.remove());
        ARRAY_ITEMS.splice(0, ARRAY_ITEMS.length);

        BOARD_GAME_ELEMENT.innerHTML = "";
        BOARD_GAME_ELEMENT.style.display = "none";

        //Show game over menu over game .
        BOARD_GAME_FINISH_ELEMENT.style.position = "";
        BOARD_GAME_FINISH_ELEMENT.style.top = "x";
        BOARD_GAME_FINISH_ELEMENT.style.left = "";
        BOARD_GAME_FINISH_ELEMENT.style.padding = "";
        
        send_score(ship.points, (data, previous_score) => {
            //Show game over menu.
            BOARD_GAME_FINISH_ELEMENT.querySelector("#text-game-finish").innerHTML = "GAME OVER <br/><br/>Que pena s'ha acabat el temps, no has pogut descobrir el significat de la FRASE, torna-ho a intentar!";
            BOARD_GAME_FINISH_ELEMENT.querySelector("#points-game-finish").innerText = `${previous_score} punts`;
            BOARD_GAME_FINISH_ELEMENT.querySelectorAll("#content-game-finish > div").forEach((element, index) => setTimeout(() => element.style.visibility = "visible", 1000 * index));
            BOARD_GAME_FINISH_ELEMENT.style.display = "flex";
        });

        ship = null;
        ball = null;
        timer = null;
    }
}

/**
 * Send the score to backend.
 * @param {Number} points The total points of player.
 * @param {callback} callback The callback when fetch is resolved.
 */
function send_score(points, callback) {
    //If the player win the game or lose the game.
    if (Object.values(ARRAY_BLOCKS_REMAINING).length === 0 || (timer.minutes < 0 && ARRAY_BLOCKS_REMAINING.length !== 0)) {
        callback(null, points);
        /*let data = new FormData();
        data.append("action", "insert");
        data.append("id_game", 1);
        data.append("id_user", 1);
        data.append("is_win", is_win);
        data.append("points", points);

        fetch("./backend/ranking.php", {
            method: "POST",
            cache: "no-cache",
            body: data,
        })
            .then((response) => response.json())
            .then((data) => {
                callback(data, points);
            })
            .catch((error) => console.error(error));*/
    }
}
