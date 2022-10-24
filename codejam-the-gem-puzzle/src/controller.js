import './styles/main.scss';
import audio from './assets/audio/move_sound7.mp3';

const canvas = document.getElementById('gem-puzzle');
const context = canvas.getContext('2d');
const _patentElement  = document.querySelector('.game-body');
const moveAudio = new Audio(audio);

// State
const state = {
    gameSize: 4,
    results: [],
}

let coords = [];
let gameOver = false;
let tileSize;
let field = [];
let winArr = [];
let curTile = null;
let moves = 0, time = 0;
let gameTimer;

let start = 0;

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

        field = getField(state.gameSize);
        suffleField(100);
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
        if(field[colIndex + 1]?.[rowIndex] == 0) {
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

        moveAudio.play();
        gameOver = checkWin();
    }
})

function swap(directionX, directionY, rowIndex, colIndex) {
    const temp = field[rowIndex + directionX][colIndex + directionY];
    field[rowIndex + directionX][colIndex + directionY] = 0;
    field[rowIndex][colIndex] = temp;
}

function suffleField(times) {
    let indexRow, indexCol;
    for(let i = 0; i < times; i++) {
        let swapEl;
        for(let j = 0; j < state.gameSize; j++) {
            if(field[j].indexOf(0) !== -1) {
                indexRow = j;
                indexCol = field[j].indexOf(0);
                let randomMoveDir = Math.floor(Math.random() * (4 - 1 + 1) + 1);
                if(randomMoveDir == 1) {
                    //left
                    if(field[indexRow]?.[indexCol - 1]) {
                        swapEl = field[indexRow][indexCol - 1];
                        swap(0, -1, indexRow, indexCol);
                    }
                }
                if(randomMoveDir == 2) {
                    // top
                    if(field[indexRow - 1]?.[indexCol]) {
                        swapEl = field[indexRow - 1][indexCol];
                        swap(-1, 0, indexRow, indexCol);
                    }
                }
                if(randomMoveDir == 3) {
                    // right
                    if(field[indexRow]?.[indexCol + 1]) {
                        swapEl = field[indexRow][indexCol + 1];
                        swap(0, 1, indexRow, indexCol);
                    }
                }
                if(randomMoveDir == 4) {
                    // bottom
                    if(field[indexRow + 1]?.[indexCol]) {
                        swapEl = field[indexRow + 1][indexCol];
                        swap(1, 0, indexRow, indexCol);
                    }
                }
            }
        }    
    }
}

function getField(size) {
    const resArr = [];
    let counter = 1;
    for(let i = 0; i < size; i++) {
        const row = [];
        const winArrRow = [];
        const coordsRow = [];
        for(let j = 0; j < size; j++) {
            row.push(counter);
            winArrRow.push(counter);
            coordsRow.push({i , j , x: j * tileSize, y: i * tileSize});
            counter++;
        }
        resArr.push(row);
        coords.push(coordsRow);
        winArr.push(winArrRow);
    }
    winArr[winArr.length - 1][state.gameSize - 1] = 0;
    resArr[resArr.length - 1][state.gameSize - 1] = 0;
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
    context.font = '32px Roboto';
    context.fillStyle = '#3c3c48';
    context.textAlign = 'center';
    context.fillText(`Hooray! 🎉🎉🎉`, 200, 80);
    context.fillText(`You solved the puzzle in`, 200, 120);
    context.fillText(`${formatSeconds(winTime)}`, 200, 160);
    context.fillText(`and ${moves} moves!`, 200, 200);
    context.fillText(`Click to continue 🔁`, 200, 290);
}

function tick() {
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

                    context.roundRect(dx, dy, tileSize, tileSize, [10]);
                    context.fillStyle = '#c4a094';
                    context.fill();

                    context.strokeStyle = '#fcf0d8';
                    context.lineWidth = 4;
                    context.stroke();
                    if(state.gameSize == 3) {
                        context.font = '60px Roboto';
                    }if(state.gameSize == 4) {
                        context.font = '50px Roboto';
                    }if(state.gameSize == 5) {
                        context.font = '40px Roboto';
                    }if(state.gameSize == 6) {
                        context.font = '40px Roboto';
                    }if(state.gameSize == 7) {
                        context.font = '35px Roboto';
                    }if(state.gameSize == 8) {
                        context.font = '30px Roboto';
                    }
                    context.fillStyle = '#3c3c48';
                    context.textAlign = 'left';
                    context.textBaseline = 'top';

                    const text = context.measureText(field[i][j]);
                    const offset = tileSize - text.width;

                    context.fillText(field[i][j], dx + offset / 2, dy + tileSize / 4);
                }
            }
        }
    }
}

function draw(timestamp) {
    const elapsed = timestamp - start;
    if(elapsed > 30) {
        start = timestamp; 
        tick();
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
                <p class="text-reg frame-size-numbers_link" id="3">3x3</p>
                <p class="text-reg frame-size-numbers_link" id="4">4x4</p>
                <p class="text-reg frame-size-numbers_link" id="5">5x5</p>
                <p class="text-reg frame-size-numbers_link" id="6">6x6</p>
                <p class="text-reg frame-size-numbers_link" id="7">7x7</p>
                <p class="text-reg frame-size-numbers_link" id="8">8x8</p>
            </div>
            <div class="frame-size">
                <p class="text-reg">Frame size:</p>
                <p class="text-reg frame-size-numbers__res">${state.gameSize}x${state.gameSize}</p>
                <p class="text-reg">&#8226;</p>
                <div class="sorting-filer">
                    <p class="text-reg">Sort:</p>
                    <button class="text-reg sort-btn sort-by-moves">by Moves</button>
                    <button class="text-reg sort-btn sort-btn-active sort-by-time">by Time</button>
                </div>
            </div>
            <div class="results__lists-container">
                <ol class="results__list">
                </ol>
            </div>
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
    field = getField(state.gameSize);

    suffleField(100);
    draw(state.gameSize);
}
init();


const overlayBlur = document.querySelector('.overlay');
const buttonsParent = document.querySelector('.btn-top');
const closeResBtn = document.querySelector('.close-btn');
const resultsCont = document.querySelector('.results-container');
const resultsListCont = document.querySelector('.results__list');

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

        field = getField(state.gameSize);
        suffleField(100);
        draw(state.gameSize);
    }
    if(e.target.id == 'stop') {
        if(gameTimer) {
            clearInterval(gameTimer);
        }
        overlayBlur.classList.remove('hidden');
    }
    if(e.target.id == 'results') {
        if(gameTimer) {
            clearInterval(gameTimer);
        }
        
        resultsListCont.innerHTML = '';
        if(!getResultsByTime(state.gameSize)) {
            resultsListCont.insertAdjacentHTML('afterbegin', noResMes());
        }
        resultsListCont.insertAdjacentHTML('afterbegin', getResultsByTime(state.gameSize));
        document.querySelector('.frame-size-numbers__res').textContent = `${state.gameSize}x${state.gameSize}`;
        resultsCont.classList.remove('hidden');
    }
})

function getResultsByTime(size) {
    return state.results.filter(resobj => resobj.size == size).sort((a, b) => a.time - b.time).slice(0,10).map(resObj => generateResult(resObj)).join('');
}

function getResultsByMoves(size) {
    return state.results.filter(resobj => resobj.size == size).sort((a, b) => a.moves - b.moves).slice(0,10).map(resObj => generateResult(resObj)).join('');
}

function generateResult(obj) {
    return `
        <li class="results__list-item">Moves: ${obj.moves} / Time: ${formatSeconds(obj.time)}</li>
    `;
}

function noResMes() {
    return `
        <p class="reg-text nores-message">You have no results on this frame size yet ^^</p>
    `;
}

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
    if(e.target.classList.contains('frame-size-numbers_link')) {
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
        document.querySelector('.frame-size-numbers__res').textContent = `${state.gameSize}x${state.gameSize}`;
    
        field = getField(state.gameSize);
        suffleField(1000);
        draw(state.gameSize);
    }
})

const changeResultsSizeEl = document.querySelector('.picksize__results');

changeResultsSizeEl.addEventListener('click', function(e) {
    if(e.target.classList.contains('frame-size-numbers_link')) {

        let curResSize = e.target.id;
        resultsListCont.innerHTML = '';
        document.querySelector('.frame-size-numbers__res').textContent = `${curResSize}x${curResSize}`;
        if(!getResultsByTime(curResSize)) {
            resultsListCont.insertAdjacentHTML('afterbegin', noResMes());
        }
        resultsListCont.insertAdjacentHTML('afterbegin', getResultsByTime(curResSize));
    }
})

const sortEl = document.querySelector('.sorting-filer');

sortEl.addEventListener('click', function(e) {
    if(e.target.classList.contains('sort-by-moves')) {
        e.target.classList.add('sort-btn-active');
        document.querySelector('.sort-by-time').classList.remove('sort-btn-active');
        let curResSizeSort = +document.querySelector('.frame-size-numbers__res').textContent.slice(-1);
        if(getResultsByMoves(curResSizeSort)) {
            resultsListCont.innerHTML = '';
            resultsListCont.insertAdjacentHTML('afterbegin', getResultsByMoves(curResSizeSort));
        }
    }
    if(e.target.classList.contains('sort-by-time')) {
        e.target.classList.add('sort-btn-active');
        document.querySelector('.sort-by-moves').classList.remove('sort-btn-active');
        let curResSizeSort = +document.querySelector('.frame-size-numbers__res').textContent.slice(-1);
        if(getResultsByTime(curResSizeSort)) {
            resultsListCont.innerHTML = '';
            resultsListCont.insertAdjacentHTML('afterbegin', getResultsByTime(curResSizeSort));
        }
    }
})