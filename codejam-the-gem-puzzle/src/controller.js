import './styles/main.scss';

const canvas = document.getElementById('gem-puzzle');
const context = canvas.getContext('2d');

// State
const gameSize = 4;
const coords = [];
const gameOver = false;
const tileSize  = canvas.width / gameSize;
let field = [];
const winArr = [];
let curTile = null;


canvas.addEventListener('click', function(e) {
    const clientX = e.offsetX;
    const clientY = e.offsetY;

    let colIndex;
    let rowIndex;

    for(let i = 0; i < gameSize; i++) {

        let curTileID = coords[i].find(el => {
            return clientX > el.x && clientX < el.x + tileSize && clientY > el.y && clientY < el.y + tileSize;
        })

        if(curTileID) {
            colIndex = i;
            rowIndex = coords[i].indexOf(curTileID);

            curTile = field[colIndex][rowIndex];
        }
    }

    const getEmptyTile = function() {
        if(field[colIndex]?.[rowIndex - 1] == 0) {
            return {col: colIndex, row: rowIndex - 1};
        }
        if(field[colIndex]?.[rowIndex + 1] == 0) {
            return {col: colIndex, row: rowIndex + 1};
        }
        if(field[colIndex - 1 ]?.[rowIndex] == 0) {
            return {col: colIndex - 1, row: rowIndex};
        }
        if( field[colIndex + 1]?.[rowIndex] == 0) {
            return {col: colIndex + 1, row: rowIndex};
        }
    }
    const emptyTile = getEmptyTile();

    if(emptyTile) {
        const temp = field[colIndex][rowIndex];
        field[colIndex][rowIndex] = 0;
        field[emptyTile.col][emptyTile.row] = temp;
        curTile = null;
    }
    
})


function getRandomField(size) {
    const exist = [];
    const resArr = [];
    let counter = 1;
    for(let i = 0; i < size; i++) {
        const row = [];
        const winArrRow = [];
        const coordsRow = [];
        for(let j = 0; j < size; j++) {
            while(row.length !== size) {
                const suffle = Math.floor(Math.random() * size * size);
                if(!exist.includes(suffle)) {
                    row.push(suffle);
                    
                    exist.push(suffle);
                }
            }
            winArrRow.push(counter);
            coordsRow.push({i , j , x: j * tileSize, y: i * tileSize});
            counter++;
        }
        resArr.push(row);
        coords.push(coordsRow);
        winArr.push(winArrRow);
    }
    winArr[winArr.length - 1][gameSize - 1] = 0;
    return resArr;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(gameOver) {
        console.log('game over');
    } else {
        for(let i = 0; i < gameSize; i++) {
            for(let j = 0; j < gameSize; j++) {

                const dx = j * tileSize;
                const dy = i * tileSize;
                
                if(field[i][j]) {

                    context.beginPath();

                    context.rect(dx, dy, tileSize, tileSize);
                    context.fillStyle = 'white';
                    context.fill();

                    context.strokeStyle = 'black';
                    context.stroke();

                    context.font = '50px Roboto';
                    context.fillStyle = 'black';
                    context.textAlign = 'left';
                    context.textBaseline = 'top';

                    const text = context.measureText(field[i][j]);
                    const offset = tileSize - text.width;

                    context.fillText(field[i][j], dx + offset / 2, dy + tileSize / 4);
                }
            }
        }
    }
    requestAnimationFrame(draw);
}

function init() {
    field = getRandomField(gameSize);
    // console.log(field, coords, winArr);
    draw(gameSize);
}

init();