import './styles/main.scss';

const canvas = document.getElementById('gem-puzzle');
const context = canvas.getContext('2d');
const _patentElement  = document.querySelector('.game-body');

// State
const state = {
    gameSize: 4,
    results: [],
}

// let gameSize = 4;
let coords = [];
let gameOver = false;
let tileSize;
let field = [];
let winArr = [];
let curTile = null;
let moves = 0, time = 0;
let gameTimer;

canvas.addEventListener('click', function(e) {
    const clientX = e.offsetX;
    const clientY = e.offsetY;

    if(gameOver) {
        gameOver = false;
        moves = 0;
        time = 0;
        curTile = null;

        field = [];
        coords = [];
        winArr = [];

        document.querySelector('.moves-number').textContent = 0;
        document.querySelector('.seconds').textContent = '00:00';
        clearInterval(gameTimer);
        gameTimer = undefined;
        field = getRandomField(state.gameSize);
        draw(state.gameSize);
        return;
    }

    let colIndex;
    let rowIndex;
    
    const movesEl = document.querySelector('.moves-number');
    if(moves === 0) {
        const secondsEl = document.querySelector('.seconds');
        clearInterval(gameTimer);
        gameTimer = setInterval(() => {
            time++;
            secondsEl.textContent = formatSeconds(time);
        }, 1000);
    }
    
    for(let i = 0; i < state.gameSize; i++) {

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
        moves++;
        movesEl.textContent = moves;

        gameOver = checkWin();
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
    winArr[winArr.length - 1][state.gameSize - 1] = 0;
    return resArr;
}

function checkWin() {
    for (let i = 0; i < state.gameSize; i++) {
        for(let j = 0; j < state.gameSize; j++) {
            if(field[i][j] !== winArr[i][j])
            return false;
        }
    }
    let curSize = state.gameSize;
    state.results.push({size: curSize, time: time, moves: moves});
    persistState();
    return true;
}

function showGameWinScreen(winTime) {
    // context.fillStyle = 'white';
    context.font = '32px Roboto';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText(`Hooray!`, 50, 90);
    context.fillText(`You solved the puzzle in`, 50, 130);
    context.fillText(`${formatSeconds(winTime)}`, 50, 170);
    context.fillText(`and ${moves} moves!`, 50, 210);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(gameOver) {
        let curTime = time;
        clearInterval(gameTimer);
        showGameWinScreen(curTime);
    } else {
        for(let i = 0; i < state.gameSize; i++) {
            for(let j = 0; j < state.gameSize; j++) {

                const dx = j * tileSize;
                const dy = i * tileSize;
                
                if(field[i][j]) {
                    context.beginPath();

                    context.rect(dx, dy, tileSize, tileSize);
                    context.fillStyle = 'white';
                    context.fill();

                    context.strokeStyle = 'black';
                    context.stroke();

                    context.font = '50px roboto';
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

function formatSeconds(seconds) {
    const date = new Date(1970, 0, 1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}).*/, "$1");
}

function persistState() {
    localStorage.setItem('state', JSON.stringify(state));
}

function getElemetnsTop() {
    const markup = `
        <div class="btn-top">
            <div class="btn-primary shuffle-start">
                <button class="text-reg" id="shuffle">Shuffle and start</button>
            </div>
            <div class="btn-primary stop">
                <button class="text-reg" id="stop">Stop</button>
            </div>
            <div class="btn-primary save">
                <button class="text-reg" id="save">Save</button>
            </div>
            <div class="btn-primary results">
                <button class="text-reg" id="results">Results</button>
            </div>
        </div>
        <div class="indicators">
            <div class="moves">
                <p class="text-reg">Moves:</p>
                <p class="text-reg moves-number">0</p>
            </div>
            <div class="text-reg time">
                <p class="text-reg">Time:</p>
                <span class="text-reg seconds">00:00</span>
            </div>
        </div>
        <div class="overlay hidden">
            <p class="reg-text overlay-text">Click to continue the game...</p>
        </div>
        <div class="results-container hidden">
            <div class="close-btn">&#x2716;</div>
            <h3 class="results__header">Top 10 Results:</h3>
            <div class="picksize__results">
                <p class="text-reg">Sizes:</p>
                <p class="text-reg frame-size-numbers_link frame-size__active" id="3">3x3</p>
                <p class="text-reg frame-size-numbers_link" id="4">4x4</p>
                <p class="text-reg frame-size-numbers_link" id="5">5x5</p>
                <p class="text-reg frame-size-numbers_link" id="6">6x6</p>
                <p class="text-reg frame-size-numbers_link" id="7">7x7</p>
                <p class="text-reg frame-size-numbers_link" id="8">8x8</p>
            </div>
            <ol class="results__list">
                <li class="results__list-item">Moves: N/A / Time: N/A</li>
                <li class="results__list-item">Moves: N/A / Time: N/A</li>
                <li class="results__list-item">Moves: N/A / Time: N/A</li>
                <li class="results__list-item">Moves: / Time:</li>
                <li class="results__list-item">Moves: / Time:</li>
                <li class="results__list-item">Moves: / Time:</li>
                <li class="results__list-item">Moves: / Time:</li>
                <li class="results__list-item">Moves: / Time:</li>
                <li class="results__list-item">Moves: / Time:</li>
                <li class="results__list-item">Moves: / Time:</li>
            </ol>
        </div>
    `;

    _patentElement.insertAdjacentHTML('afterbegin', markup);
}

function getElemtnsBottom() {
    const markup = `
        <div class="frame-size">
            <p class="text-reg">Frame size:</p>
            <p class="text-reg frame-size-numbers">${state.gameSize}x${state.gameSize}</p>
        </div>
        <div class="picksize">
            <p class="text-reg">Other sizes:</p>
            <p class="text-reg frame-size-numbers_link" id="3">3x3</p>
            <p class="text-reg frame-size-numbers_link" id="4">4x4</p>
            <p class="text-reg frame-size-numbers_link" id="5">5x5</p>
            <p class="text-reg frame-size-numbers_link" id="6">6x6</p>
            <p class="text-reg frame-size-numbers_link" id="7">7x7</p>
            <p class="text-reg frame-size-numbers_link" id="8">8x8</p>
        </div>
    `;

    _patentElement.insertAdjacentHTML('beforeend', markup);
}

function init() {
    const storage = localStorage.getItem('state');
    if(storage) {
        let localState = JSON.parse(storage);
        state.gameSize = localState.gameSize;
        state.results = localState.results;
    } 
    getElemetnsTop();
    getElemtnsBottom();
    
    tileSize = canvas.width / state.gameSize;
    field = getRandomField(state.gameSize);
    // console.log(field, coords, winArr);
    draw(state.gameSize);
}
init();


// CHEATCODE BUTTON
// const winBtn = document.querySelector('.results');

// winBtn.addEventListener('click', function() {
//     gameOver = true;
// }) 

const overlayBlur = document.querySelector('.overlay');
const buttonsParent = document.querySelector('.btn-top');
const closeResBtn = document.querySelector('.close-btn');
const resultsCont = document.querySelector('.results-container');

buttonsParent.addEventListener('click', function(e) {
    if(e.target.id == 'shuffle') {
        gameOver = false;
        moves = 0;
        time = 0;
        curTile = null;
        field = [];
        coords = [];
        winArr = [];
        
        document.querySelector('.moves-number').textContent = 0;
        document.querySelector('.seconds').textContent = '00:00';
        clearInterval(gameTimer);
        gameTimer = undefined;
        field = getRandomField(state.gameSize);
        draw(state.gameSize);
    }
    if(e.target.id == 'stop') {
        if(gameTimer) {
            clearInterval(gameTimer);
        }
        overlayBlur.classList.remove('hidden');
    }
    if(e.target.id == 'save') {
        persistState();
    }
    if(e.target.id == 'results') {
        if(gameTimer) {
            clearInterval(gameTimer);
        }
        resultsCont.classList.remove('hidden');
    }
})

overlayBlur.addEventListener('click', function() {
    overlayBlur.classList.add('hidden');
    if(gameTimer) {
        const secondsEl = document.querySelector('.seconds');
        gameTimer = setInterval(() => {
            time++;
            secondsEl.textContent = formatSeconds(time);
        }, 1000);
    }
})

closeResBtn.addEventListener('click', function() {
    resultsCont.classList.add('hidden');
    if(gameTimer) {
        const secondsEl = document.querySelector('.seconds');
        gameTimer = setInterval(() => {
            time++;
            secondsEl.textContent = formatSeconds(time);
        }, 1000);
    }
})

const changeSizeEl = document.querySelector('.picksize');

changeSizeEl.addEventListener('click', function(e) {
    state.gameSize = +e.target.id;
    persistState();
    tileSize = canvas.width / state.gameSize;
    gameOver = false;
    moves = 0;
    time = 0;
    curTile = null;
    field = [];
    coords = [];
    winArr = [];

    clearInterval(gameTimer);
    gameTimer = undefined;
    document.querySelector('.moves-number').textContent = 0;
    document.querySelector('.seconds').textContent = '00:00';
    document.querySelector('.frame-size-numbers').textContent = `${state.gameSize}x${state.gameSize}`;

    field = getRandomField(state.gameSize);
    draw(state.gameSize);
})