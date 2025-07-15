let container = document.getElementById("container")
let cells = container.children;
console.log(cells)

function who_won() {

    // horizontal
    for(let row = 0; row < 3; row++) { 
        if(cells[row * 3].firstElementChild.innerHTML == cells[row * 3 + 1].firstElementChild.innerHTML &&
            cells[row * 3 + 1].firstElementChild.innerHTML == cells[row * 3 + 2].firstElementChild.innerHTML) {
            return cells[row * 3].firstElementChild.innerHTML;

        }
    }

    //vertical
    for(let column = 0; column < 3; column++) { 
        if(cells[column].firstElementChild.innerHTML == cells[column + 3].firstElementChild.innerHTML &&
            cells[column + 3].firstElementChild.innerHTML == cells[column + 3 * 2].firstElementChild.innerHTML) {
            return cells[column].firstElementChild.innerHTML;
        }
    }

    //diagonal 1
    if (cells[0 * 3 +0].firstElementChild.innerHTML == cells[1 * 3 +1].firstElementChild.innerHTML &&
        cells[1 * 3 +1].firstElementChild.innerHTML == cells[2 * 3 +2].firstElementChild.innerHTML) {
        return cells[0 * 3 +0].firstElementChild.innerHTML;
    }

    //diagonal 2
    if (cells[2 * 3 +0].firstElementChild.innerHTML == cells[1 * 3 +1].firstElementChild.innerHTML &&
        cells[0 * 3 +2].firstElementChild.innerHTML == cells[1 * 3 +1].firstElementChild.innerHTML) {
        return cells[0 * 3 +0].firstElementChild.innerHTML;
    }

    return ''
}


//index of the cell
function onmouseclick(index) {
    let clicked_cell = cells[index];
    let clicked_inner_cell = clicked_cell.firstElementChild;
    if (clicked_inner_cell.innerHTML != '') {
        return;
    }
    clicked_inner_cell.innerHTML = 'X'

    if(who_won() == 'X') {
        setTimeout(() => alert("YOU WON!!!!!"), 100)
    }

    
    
    let enemy_choices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    while(enemy_choices.length > 0) {
        let enemy_choice_index = Math.floor(Math.random() * enemy_choices.length);
        let enemy_choice = enemy_choices.splice(enemy_choice_index, 1);
        
        let enemy_clicked_cell = cells[enemy_choice];
        let enemy_clicked_inner_cell = enemy_clicked_cell.firstElementChild;
        if (enemy_clicked_inner_cell.innerHTML != '') {
            continue;
        }
        enemy_clicked_inner_cell.innerHTML = 'O'
        break;  
    }

    if(who_won() == 'O') {
        alert("YOU LOST!!!!!", 100)
    }

}