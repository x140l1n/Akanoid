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

    start_transitions();

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

                get_ranking();

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

function start_transitions() {
    let menu_options = document.querySelector("#menu-options");
    [].slice
        .call(menu_options.children)
        .forEach((element) => (element.style.left = 0));

    let logo = document.querySelector("#logo");
    logo = [].slice.call(logo.children);
    logo[0].style.left = 0;
    logo[1].style.top = 0;
    logo[2].style.right = 0;

    let menu_footer = document.querySelector("#menu-footer");
    menu_footer.firstElementChild.style.left = 0;
}

function get_ranking() {
    let data = new FormData();
    data.append("action", "get");
    data.append("id_game", 1);
    data.append("top", 10);
    data.append("id_user", 1);

    let table_ranking = document.querySelector("#table-ranking");
    table_ranking.style.height = "100%";
    let body = table_ranking.tBodies[0];
    let footer = table_ranking.tFoot;
    body.innerHTML = "";
    footer.innerHTML = "";

    let row_wait = document.createElement("tr");
    let cell_wait = document.createElement("td");
    cell_wait.innerText = "Espere...";
    row_wait.appendChild(cell_wait);
    body.appendChild(row_wait);

    fetch("./backend/ranking.php", {
        method: "POST",
        cache: "no-cache",
        body: data,
    })
    .then(response => response.json())
    .then(data => {
        table_ranking.style.height = "";

        create_ranking(body, footer, data, 1);
    })
    .catch(error => console.error(error));
}

function create_ranking(body, footer, data, id_user) {
    body.innerHTML = "";

    if (data.data.length > 0) {
        let isTop = false; //If the user is in the top 10.

        data.data.forEach((item, index) => {
            let position = index + 1;
            let nickname = Number.parseInt(item.id) === id_user ? "Tu": item.nickname;
            let time = item.time;

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

            let cell_time = document.createElement("td");

            cell_time.innerText = time;

            row.appendChild(cell_position);
            row.appendChild(cell_nickname);
            row.appendChild(cell_time);

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

            let cell_time = document.createElement("td");

            cell_time.innerText = data.data_user.time;

            row.appendChild(cell_position);
            row.appendChild(cell_nickname);
            row.appendChild(cell_time);
            
            footer.appendChild(row);
        }
    }
}
