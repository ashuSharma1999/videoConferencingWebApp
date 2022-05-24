let socket = io();

const canvas = document.getElementById("whiteboard");

const resolution = RESOLUTION_HD;
const height = window.innerHeight * 0.99;
const width = window.innerWidth * 0.93;
const windowUrl = window.location.href;
// const game_index = window_url.indexOf('game/') + 4;
const boardSocket = io.connect(windowUrl);

let whiteboard = new Whiteboard(canvas, width, height, resolution);
whiteboard.setColor(COLOR_WHITE);
whiteboard.setBackground(COLOR_BLACK);
whiteboard.setWidth(3);
whiteboard.setCursor(CURSOR_CROSSHAIR);
whiteboard.setMode(MODE_DRAW);

// whiteboard.attachSocket(boardSocket, 'draw', FUNCTION_DRAW);
// whiteboard.attachSocket(boardSocket, 'penup', FUNCTION_PENUP);
// whiteboard.attachSocket(boardSocket, 'pendown', FUNCTION_PENDOWN);
whiteboard.startEventLoop();

let pen = document.getElementById('pen');
let color = document.getElementById('color');
let plus = document.getElementById('plus');
let minus = document.getElementById('minus');
let eraser = document.getElementById('eraser');
let line = document.getElementById('line');
let mic = document.getElementById('audio');
let trash = document.getElementById('delete');
let highlightedCell;
let whiteboardWidth = whiteboard.getWidth();

color.addEventListener('click', getColorPicker);
pen.addEventListener('click', function(event){
    unhighlightCell();
    whiteboard.setMode(MODE_DRAW);
    highlightCell(event);
});
plus.addEventListener('click', function(){
    whiteboard.setWidth(++whiteboardWidth);    ;
});
minus.addEventListener('click', function(){
    whiteboard.setWidth(--whiteboardWidth);
});
eraser.addEventListener('click', function(event){
    unhighlightCell();
    whiteboard.setMode(MODE_ERASE);
    highlightCell(event);
});
line.addEventListener('click', function(event){
    unhighlightCell();
    whiteboard.setMode(MODE_LINE);
    highlightCell(event);
});
mic.addEventListener('click', function(event){
    unhighlightCell();
    highlightCell(event);
});
trash.addEventListener('click', function(event) {
    whiteboard.resetBoard();
});

function unhighlightCell() {
    let target = document.getElementById(highlightedCell);
    if (target) { target.style.background = COLOR_BLACK; }
}

function highlightCell(event) {
    let target = event.target;
    highlightedCell = target.id;
    target.style.background = COLOR_FIERY_RED;
}

function getColorPicker(event) {
    let newDiv = document.getElementById('color-panel');
    let created = false;
    if (newDiv === null || newDiv === undefined) {
        newDiv = document.createElement('div'); created = true;
    }
    newDiv.innerHTML = "";
    newDiv.id = 'color-panel';
    newDiv.style.position = 'absolute';
    newDiv.style.left = `${event.pageX+35}px`;
    newDiv.style.top = `${event.pageY-10}px`;
    newDiv.style.backgroundColor = 'white';
    const colors = [
        COLOR_FIERY_RED,COLOR_BLAZING_YELLOW,COLOR_ISLAND_GREEN,COLOR_WHITE,COLOR_INCA_GOLD,COLOR_ATOLL_BLUE,COLOR_PURPLE
    ];
    newDiv.style.height = '32px';
    newDiv.style.width = `${colors.length*32}px`;
    newDiv.style.display = 'flex';
    newDiv.style.zIndex = '100';
    for (let i=0; i<colors.length; i++) {
        const colorGrid = document.createElement('div');
        colorGrid.id = `${colors[i].slice(1)}`;
        colorGrid.classList.add('color-icons');
        colorGrid.style.backgroundColor = `${colors[i]}`;
        colorGrid.addEventListener('click', dismissColorPicker);
        newDiv.appendChild(colorGrid);
    }
    if (created) { document.body.appendChild(newDiv); }
}

function dismissColorPicker(event) {
    let div = document.getElementById('color-panel');
    whiteboard.setColor(`#${event.target.id}`);
    div.innerHTML = "";
    div.style = "";
}