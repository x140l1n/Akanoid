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

    //Trigger transitions.
    let menu_options = document.querySelector("#menu-options");
    [].slice.call(menu_options.children).forEach((element) => element.style.left = 0);

    let logo = document.querySelector("#logo");
    logo = [].slice.call(logo.children);
    logo[0].style.left = 0;
    logo[1].style.top = 0;
    logo[2].style.right = 0;

    let menu_footer = document.querySelector("#menu-footer");
    menu_footer.firstElementChild.style.left = 0;

    let main_menu = document.querySelector("#main-menu");

    board_menu = document.querySelector("#board-menu");
    board_menu.addEventListener("click", (e) => {
        let action = e.target.dataset.action;

        switch (action) {
            case "play":
                board_menu.style.display = "none";

                setTimeout(initGame, 1000);

                break;
            case "instructions":
                main_menu.style.display = "none";

                let instructions_menu = document.querySelector("#instructions-menu");
                instructions_menu.style.display = "flex";

                break;
            case "ranking":
                main_menu.style.display = "none";

                let ranking_menu = document.querySelector("#ranking-menu");
                ranking_menu.style.display = "flex";

                break;

            case "go-back":
                //Display none all menus except main menu.
                [].slice.call(board_menu.children).forEach((element) => {
                    if (element !== main_menu) {
                        element.style.display = "none";
                    } else {
                        element.style.display = "flex";
                    }
                });

                break;
        }
    });
    
    //initGame();
}
