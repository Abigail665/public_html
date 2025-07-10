const boards = [
    {
        cells: 
        [
            ["E", "L", "W", "Y", "C","B", "A", "C", "Y"],
            ["Y", "L", "O", "D", "N", "U", "M", "N", "A"],
            ["U", "T", "R", "E", "E", "Y", "E", "U", "V"],
            ["E", "L", "P", "M", "V", "E", "L", "L", "M"],
            ["P", "U", "R", "A", "U", "O", "N", "B", "Y"],
            ["Y", "E", "M", "Y", "C", "W", "O", "G", "D"],
            ["G", "R", "L", "U", "I", "N", "D", "I", "E"],
            ["P", "I", "N", "K", "O", "R", "A", "N", "G"],
            ["B", "L", "A", "C", "K", "T", "E", "A", "L"]
        ],
        words: ["CYAN", "YELLOW", "PURPLE", "MAUVE", "BLUE", "TEAL", "GRAY", "PINK", "BLACK", "ORANGE", "INDIGO" ]
    },
    {
        cells: 
        [
            ["E", "W", "T", "A", "P", "E", "R", "T", "S"],
            ["A", "k", "L", "I", "R", "A", "N", "P", "U"],
            ["N", "S", "F", "A", "T", "G", "A", "S", "N"],
            ["L", "E", "E", "R", "A", "L", "U", "O", "A"],
            ["A", "G", "G", "U", "J", "E", "A", "K", "K"],
            ["B", "I", "R", "D", "L", "F", "B", "E", "E"],
            ["F", "O", "X", "O", "W", "L", "F", "O", "X"],
            ["C", "A", "T", "P", "Y", "T", "H", "O", "N"],
            ["S", "Q", "C", "U", "B", "S", "H", "Y", "G"]
        ],
        words: ["TAPIR", "EAGLE", "JAGUAR", "SNAKE", "WOLF", "CAT", "CUB", "BIRD","FOX (2x)", "OWL"]
    },
    {
        cells: [
            ["H", "C", "N", "A", "N", "B", "E", "R", "Y"],
            ["Y", "R", "G", "A", "A", "P", "L", "U", "M"],
            ["R", "E", "A", "Y", "B", "G", "R", "A", "P"],
            ["F", "P", "P", "E", "R", "E", "M", "O", "N"],
            ["I", "G", "A", "P", "A", "C", "H", "E", "R"],
            ["M", "A", "N", "G", "O", "K", "I", "W", "I"],
            ["L", "I", "M", "E", "P", "G", "P", "A", "Y"],
            ["D", "A", "T", "E", "F", "I", "A", "O", "R"],
            ["A", "P", "R", "I", "C", "O", "T", "P", "E"]],
        words: ["CHERRY", "PAPAYA", "BANANA", "PEAR", "FIG", "APRICOT", "FIG", "BERRY", "LIME"]
    },
]


function make_cell_list() {
    const cell_holder = document.getElementById("cell-holder");
    // It's better practice to generate the grid with JS
    // than to hard-code 81 divs in HTML.
    cell_holder.innerHTML = ''; // Clear any previous grid
    let cell_board = [];
    for (let y = 0; y < 9; y++) {
        let row = [];
        for (let x = 0; x < 9; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.onclick = () => on_click(x, y);
            cell_holder.appendChild(cell);
            row.push(cell);
        }
        cell_board.push(row);
    }
    return cell_board;
}

function setup_game(starting_cells) {
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            CELLS[y][x].innerHTML = starting_cells[y][x];
        }
    }
}

const CELLS = make_cell_list();
let selected_x = -1;
let selected_y = -1;

function load_board(board_index) {
    const board = boards[board_index];
    setup_game(board.cells);
    document.getElementById("words").innerHTML = "Words to spell: " + board.words.join(", ");
}

// Load the first board by default
load_board(0);


function move(x, y) {
    CELLS[y][x].innerHTML = CELLS[selected_y][selected_x].innerHTML + CELLS[y][x].innerHTML;
    CELLS[selected_y][selected_x].innerHTML = ""
    select(x, y);
}

function unselect(x, y) {
    CELLS[y][x].classList.remove("selected");
    selected_x = -1;
    selected_y = -1;
}

function select(x, y) {
    if (CELLS[y][x].innerHTML.length > 0) {
        if (selected_x >= 0 && selected_y >= 0)
            CELLS[selected_y][selected_x].classList.remove("selected");
        CELLS[y][x].classList.add("selected");
        selected_y = y;
        selected_x = x;
    }
}

function is_close(a, b) {
    return Math.abs(a - b) <= 1
}

function can_move(x, y) {
    let can_move = is_close(selected_x, x) && selected_y == y || is_close(selected_y, y) && selected_x == x;

    return selected_x >= 0 && selected_y >= 0 && can_move && CELLS[y][x].innerHTML.length > 0
}

function on_click(x, y) {
    if (selected_x == x && selected_y == y) {
        unselect(x, y)
    }
    else if (can_move(x, y)) {
        move(x, y)
    } else {
        select(x, y)
    }
}
