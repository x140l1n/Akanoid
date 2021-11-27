const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 700;
const BORDER_WIDTH = 20;

document.addEventListener("DOMContentLoaded", init);

function init() {
    let board = document.querySelector("#board");

    //Set style board.
    board.style.borderWidth = `${BORDER_WIDTH}px`;
    board.style.width = `${BOARD_WIDTH}px`;
    board.style.height = `${BOARD_HEIGHT}px`;

    let stats = document.querySelector("#stats");
    stats.style.display = "none";

     initGame();
}
