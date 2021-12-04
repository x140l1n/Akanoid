document.addEventListener("DOMContentLoaded", init);

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 700;
const BORDER_WIDTH = 20;

const RANKING_MENU = document.querySelector("#ranking-menu");
const TABLE_RANKING = RANKING_MENU.querySelector("#table-ranking");

const MAIN_MENU = document.querySelector("#main-menu");

const INSTRUCCIONS_MENU = document.querySelector("#instructions-menu");
const CONTENT_INSTRUCTIONS = INSTRUCCIONS_MENU.querySelector("#content-instructions");
const ARRAY_PAGES = CONTENT_INSTRUCTIONS.querySelectorAll("div[name='page']");

let controller = null;
let signal = null;

function init() {
    let board = document.querySelector("#board");

    //Set style board.
    board.style.borderWidth = `${BORDER_WIDTH}px`;
    board.style.width = `${BOARD_WIDTH}px`;
    board.style.height = `${BOARD_HEIGHT}px`;

    start_transitions();

    board_menu = document.querySelector("#board-menu");
    board_menu.addEventListener("click", (e) => {
        let action = e.target.dataset.action;

        switch (action) {
            case "play":
                board_menu.style.display = "none";

                setTimeout(init_game, 1000);

                break;
            case "instructions":
                MAIN_MENU.style.display = "none";

                INSTRUCCIONS_MENU.style.display = "flex";

                var content_instructions = CONTENT_INSTRUCTIONS;
                var current_page = Number.parseInt(content_instructions.dataset.currentPage);

                render_page_button(current_page);
                
                break;
            case "ranking":
                controller = new AbortController(); //Abort one or more request.
                signal = controller.signal;

                MAIN_MENU.style.display = "none";

                RANKING_MENU.style.display = "flex";

                get_ranking(signal);

                break;
            case "go-back":
                //Display none all menus except main menu.
                [].slice.call(board_menu.children).forEach((element) => {
                    if (element !== MAIN_MENU) {
                        element.style.display = "none";
                    } else {
                        element.style.display = "flex";
                    }
                });

                if (controller != null) 
                {
                    controller.abort(); //Abort the request ranking.
                    controller = null;
                }

                break;
            case "go-back-page":
                var content_instructions = CONTENT_INSTRUCTIONS;
                var current_page = Number.parseInt(content_instructions.dataset.currentPage);
                
                current_page--;

                if (current_page <= ARRAY_PAGES.length && current_page > 0) {    
                    content_instructions.dataset.currentPage = current_page.toString();

                    render_page_button(current_page);
                }
                
                break;
            case "go-next-page":
                var content_instructions = CONTENT_INSTRUCTIONS;
                var current_page = Number.parseInt(content_instructions.dataset.currentPage);

                current_page++;

                if (current_page <= ARRAY_PAGES.length && current_page > 0) {
                    content_instructions.dataset.currentPage = current_page.toString();

                    render_page_button(current_page);
                }

                break;
        }
    });

    //board_menu.style.display = "none";

    //init_game();
}

function start_transitions() {
    let menu_options = MAIN_MENU.querySelector("#menu-options");
    [].slice
        .call(menu_options.children)
        .forEach((element) => (element.style.left = 0));

    let logo = MAIN_MENU.querySelector("#logo");
    logo = [].slice.call(logo.children);
    logo[0].style.left = 0;
    logo[1].style.top = 0;
    logo[2].style.right = 0;

    let menu_footer = MAIN_MENU.querySelector("#menu-footer");
    menu_footer.firstElementChild.style.left = 0;
}

function render_page_button(num_page) {
    ARRAY_PAGES.forEach((page) => {
        if (page.dataset.page === num_page.toString()) {
            page.style.display = "block";
        } else {
            page.style.display = "none";
        }
    });

    let current_page_element = INSTRUCCIONS_MENU.querySelector(`div[data-page='${num_page}']`);

    let go_back_page_element = INSTRUCCIONS_MENU.querySelector("button[data-action='go-back-page']");
    let go_next_page_element = INSTRUCCIONS_MENU.querySelector("button[data-action='go-next-page']");

    if (current_page_element.previousElementSibling !== null) {
        let previous_page_name = current_page_element.previousElementSibling.dataset.pageName;
        go_back_page_element.innerText = previous_page_name;
    } else {
        go_back_page_element.innerText = "";
    }
    
    if (current_page_element.nextElementSibling !== null) {
        let next_page_name = current_page_element.nextElementSibling.dataset.pageName;
        go_next_page_element.innerText = next_page_name;
    } else {
        go_next_page_element.innerText = "";
    }

    go_back_page_element.style.display = "block";
    go_back_page_element.style.display = "block";

    go_next_page_element.style.display = "block";
    go_next_page_element.style.display = "block";
    
    if (num_page === 1) {
        go_back_page_element.style.display = "none";
    } else if (num_page === ARRAY_PAGES.length) {
        go_next_page_element.style.display = "none";
    }
}

function get_ranking(signal) {
    let data = new FormData();
    data.append("action", "get");
    data.append("id_game", 1);
    data.append("top", 10);
    data.append("id_user", 1);

    TABLE_RANKING.style.height = "100%";

    let body = TABLE_RANKING.tBodies[0];

    let footer = TABLE_RANKING.tFoot;

    body.innerHTML = "";
    footer.innerHTML = "";

    let row_wait = document.createElement("tr");
    let cell_wait = document.createElement("td");
    cell_wait.innerText = "Un moment...";
    row_wait.appendChild(cell_wait);
    body.appendChild(row_wait);

    fetch("./backend/ranking.php", {
        method: "POST",
        cache: "no-cache",
        body: data,
        signal: signal
    })
    .then(response => response.json())
    .then(data => {
        TABLE_RANKING.style.height = "";

        render_ranking(body, footer, data, 1);
    })
    .catch(error => console.error(error));
}

function render_ranking(body, footer, data, id_user) {
    body.innerHTML = "";

    if (data.data.length > 0) {
        let isTop = false; //If the user is in the top 10.

        data.data.forEach((item, index) => {
            let position = index + 1;
            let nickname = Number.parseInt(item.id) === id_user ? "Tu": item.nickname;
            let points = item.points;
            let win = item.win;

            let row = document.createElement("tr");

            if (nickname === "Tu") {
                row.style.backgroundColor = "#1b61a7";
                isTop = true;
            }

            let cell_position = document.createElement("td");

            if (position >= 1 && position <= 3) {
                let position_medal = document.createElement("img");
                position_medal.src = `./assets/img/${position}.png`;
                position_medal.width = 30;

                cell_position.appendChild(position_medal);
            } else {
                cell_position.innerText = position;
            }

            let cell_nickname = document.createElement("td");
            cell_nickname.innerText = nickname;

            let cell_points = document.createElement("td");
            cell_points.innerText = `${points}p`;

            let cell_win = document.createElement("td");
            cell_win.innerText = win === 1 ? "Guanyat" : "Perdut";

            row.appendChild(cell_position);
            row.appendChild(cell_nickname);
            row.appendChild(cell_points);
            row.appendChild(cell_win);

            body.appendChild(row);
        });

        //Add user ranking in footer of table if there is not in the top 10.
        if (!isTop && data.data_user !== null) {
            let row = document.createElement("tr");
            row.style.backgroundColor = "#1b61a7";

            let cell_position = document.createElement("td");
            cell_position.innerText = "-";
            
            let cell_nickname = document.createElement("td");
            cell_nickname.innerText = "Tu";

            let cell_points = document.createElement("td");
            cell_points.innerText = `${data.data_user.points}p`;
            
            let cell_win = document.createElement("td");
            cell_win.innerText = data.data_user.win === 1 ? "Guanyat" : "Perdut";

            row.appendChild(cell_position);
            row.appendChild(cell_nickname);
            row.appendChild(cell_points);
            row.appendChild(cell_win);

            footer.appendChild(row);
        }
    }
}
