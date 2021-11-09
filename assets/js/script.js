'use strict';

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 700;
const BORDER_WIDTH = 20;

const BALL_WIDTH_HEIGHT = 20;
const SPEED_DEFAULT_X_BALL = 5;
const SPEED_DEFAULT_Y_BALL = 10;

const SHIP_WIDTH = 120;
const SHIP_HEIGHT = 20;
const SHIP_MAX_LIFES = 3;
const SPEED_DEFAULT_SHIP = 10;

const TIME_UPDATE_BALL = 1000/60; //In milliseconds (ms).
const TIME_REPEAT_CONTROLLER = 1000/60; //In milliseconds (ms).

document.addEventListener("DOMContentLoaded", init);

const BOARD = document.querySelector("#board");
class Ball {
    constructor(ship, width, height, x, y, image) {
        this.ship = ship;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = image;
        this.directionX = 1;
        this.directionY = 1;
        this.speedX = 0;
        this.speedY = 0;
    }

    create() {
        this.sprite = document.createElement("div");

        Object.assign(this.sprite.style, {
            position: "absolute",
            borderRadius: "50%",
            width: `${this.width}px`,
            height: `${this.height}px`,
            left: `${this.x}px`,
            top: `${this.y}px`,
            backgroundImage: `url(${this.image})`,
            backgroundSize: "cover"
        });

        BOARD.appendChild(this.sprite);

        let ball = this;

        //Every 10ms update the position of ball.
        setInterval(function () {
            if (ball.speedX !== 0 && ball.speedY !== 0) {
                ball.update();
            }
        }, TIME_UPDATE_BALL);
    }

    draw() {
        this.sprite.style.left = `${this.x}px`;
        this.sprite.style.top = `${this.y}px`;
    }

    update() {
        if (this.speedX !== 0 && this.speedY !== 0) {
            if (this.x + this.width > BOARD_WIDTH - BORDER_WIDTH) {
                this.directionX = -1;
            } else if (this.x - BORDER_WIDTH < 0) {
                this.directionX = 1;
            }
    
            if (this.y + this.height > BOARD_HEIGHT - BORDER_WIDTH) {
                //this.directionY = -1;
                this.ship.die();
                this.respawn();

                return;
            } else if (this.y - BORDER_WIDTH < 0) {
                this.directionY = 1;
            }
            
            if (intersect(this, this.ship)) {
                //Only change direction when the direction Y is positive, in other words, when the ball goes down.
                if (this.directionY === 1) {
                    //Check if the ball not exceded the ship height.
                    if (this.y + this.height < this.ship.y + this.ship.height / 2) {
                        //If the ball is touch the left side of the ship.
    
                        let isIntersectLeftRight = false;
                        
                        let cloneShipLeft = {...this.ship};
                        cloneShipLeft.width /= 5; 
                        
                        let cloneShipRight = {...this.ship};
                        cloneShipRight.x += cloneShipRight.width - (cloneShipRight.width / 5);
    
                        //If ball touch the left side of the ship.
                        if (intersect(this, cloneShipLeft)) {
                            isIntersectLeftRight = true;

                            this.directionX = -1;
                        } else if (intersect(this, cloneShipRight)) { //If ball touch the right side of the ship.
                            isIntersectLeftRight = true;

                            this.directionX = 1;
                        } else { //If the ball touch center of the ship.
                            this.speedX = SPEED_DEFAULT_X_BALL;
                            this.speedY = SPEED_DEFAULT_Y_BALL;
                        }

                        if (isIntersectLeftRight) {
                            cloneShipLeft.width /= 2;
                            cloneShipRight.x += cloneShipLeft.width;

                            if (intersect(this, cloneShipLeft) || intersect(this, cloneShipRight)) {
                                this.speedX = SPEED_DEFAULT_X_BALL + 5;
                                this.speedY = SPEED_DEFAULT_Y_BALL - 5;
                            } else {
                                this.speedX = SPEED_DEFAULT_X_BALL;
                                this.speedY = SPEED_DEFAULT_Y_BALL;
                            }
                        }

                        cloneShipLeft = null;
                        cloneShipRight = null;
    
                        this.directionY = -1;
                    }
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
        this.y = this.ship.y - BALL_WIDTH_HEIGHT;
        this.x = (BOARD_WIDTH - BALL_WIDTH_HEIGHT) / 2;

        this.draw();
    }
}

class Ship {
    constructor(width, height, x, y, image) {
        this.width = width;
        this.height = height;
        this.life = SHIP_MAX_LIFES;
        this.x = x;
        this.y = y;
        this.image = image;
        this.directionX = 1;
        this.speed = SPEED_DEFAULT_SHIP;
        this.isMove = false;
    }

    create() {
        this.sprite = document.createElement("div");

        Object.assign(this.sprite.style, {
            position: "absolute",
            width: `${this.width}px`,
            height: `${this.height}px`,
            left: `${this.x}px`,
            top: `${this.y}px`,
            backgroundImage: `url(${this.image})`,
            backgroundSize: `${this.width}px ${this.height}px`,
            backgroundRepeat: "no-repeat"
        });

        BOARD.appendChild(this.sprite);
    }

    draw() {
        this.sprite.style.left = `${this.x}px`;
        this.sprite.style.top = `${this.y}px`;
    }

    update() {   
        let newX = this.x + this.speed * this.directionX;
        
        if (newX + this.width <= BOARD_WIDTH - BORDER_WIDTH && newX - BORDER_WIDTH >= 0) {
            this.x = newX;
            this.isMove = true;
            this.draw();
        } else {
            this.isMove = false;
        }
    }

    die() {
        this.life--;
        this.x = (BOARD_WIDTH - SHIP_WIDTH) / 2;
        this.draw();
    }
}

class Block {
    construct
}

function init() {
    //Initialize board style.
    BOARD.style.borderWidth = `${BORDER_WIDTH}px`;
    BOARD.style.width = `${BOARD_WIDTH}px`;
    BOARD.style.height = `${BOARD_HEIGHT}px`;

    //Create new ball.
    let ship = new Ship(SHIP_WIDTH, SHIP_HEIGHT, (BOARD_WIDTH - SHIP_WIDTH) / 2, (BOARD_HEIGHT - SHIP_HEIGHT) / 1.15, "./assets/img/ship.png");
    ship.create();

    let ball = new Ball(ship, BALL_WIDTH_HEIGHT, BALL_WIDTH_HEIGHT, (BOARD_WIDTH - BALL_WIDTH_HEIGHT) / 2, ship.y - BALL_WIDTH_HEIGHT, "./assets/img/ball.png");
    ball.create();

    //Create controllers game.
    //Code 39 =>
    //Code 37 <=
    //Code 32 Space bar
    keyboardController({
        37: function() { 
            ship.directionX = -1; 
            ship.update(); 

            if (ball.speedX === 0 && 
                ball.speedY === 0 &&
                ship.isMove) {
                ball.x -= SPEED_DEFAULT_SHIP;
                ball.update(); 
            }
        },
        39: function() { 
            ship.directionX = 1;
            ship.update(); 
             
            if (ball.speedX === 0 && 
                ball.speedY === 0 && 
                ship.isMove) {
                ball.x += SPEED_DEFAULT_SHIP;
                ball.update(); 
            }
        },
        32: function() { ball.speedX = SPEED_DEFAULT_X_BALL; ball.speedY = SPEED_DEFAULT_Y_BALL; }
    }, TIME_REPEAT_CONTROLLER);
}

//Keyboard input with customizable repeat (set to 0 for no key repeat).
function keyboardController(keys, repeat) {
    //Lookup of key codes to timer ID, or null for no repeat.
    var timers= {};

    //When key is pressed and we don't already think it's pressed, call the
    //key action callback and set a timer to generate another one after a delay.
    document.onkeydown= function(event) {
        var key = (event || window.event).keyCode;

        if (!(key in keys)) {
            return true;
        }

        if (!(key in timers)) {

            timers[key]= null;
            keys[key]();
            
            if (repeat !== 0) {
                timers[key]= setInterval(keys[key], repeat);
            }
        }

        return false;
    };

    //Cancel timeout and mark key as released on keyup.
    document.onkeyup= function(event) {
        var key = (event || window.event).keyCode;

        if (key in timers) {
            if (timers[key] !== null) {
                clearInterval(timers[key]);
            }

            delete timers[key];
        }
    };

    //When window is unfocused we may not get key events. To prevent this
    //causing a key to 'get stuck down', cancel all held keys.
    window.onblur= function() {
        for (key in timers) {
            if (timers[key]!==null) {
                clearInterval(timers[key]);
            }
        }

        timers= {};
    };
}

/**
 * Check if two objects is intersect.
 * @param {*} obj1 The object 1 with x, y, width, height values.
 * @param {*} obj2 The object 2 with x, y, width, height values.
 * @returns Returns true if intersect, otherwise, false.
 */
function intersect(obj1, obj2) {
    let isIntersect = true;

    if (obj1.x > obj2.x + obj2.width || obj2.x > obj1.x + obj1.width) isIntersect = false;
    if (obj1.y > obj2.y + obj2.height || obj2.y > obj1.y + obj1.height) isIntersect = false;

    return isIntersect;
}