window.addEventListener('load', function() {
    sizeWindow(window.innerWidth, window.innerHeight);
    initialize();
    sizeofButtons(window.innerHeight);
    loadFiles();
    loadMenuButton();
    changeRules();

    var slider1 = document.getElementById("heightY");
	var output1 = document.getElementById("valuesY");
	output1.innerHTML = slider1.value;

	slider1.oninput = function() {
		output1.innerHTML = this.value;
	}
						
	var slider2 = document.getElementById("widthX");
	var output2 = document.getElementById("valuesX");
	output2.innerHTML = slider2.value;

	slider2.oninput = function() {
		output2.innerHTML = this.value;
    }
}, true);

/* ******************************************** MODUŁY ODPOWIEDZIALNE ZA WYGLĄD I FUNKCJONALNOŚĆ ******************************************** */

function sizeofButtons(par){
    var prametr = par;
    /*console.log(Math.floor(prametr/4)+'px');*/
    document.getElementById("startMenu").setAttribute("style","height:"+Math.floor(prametr/4)+'px');
    document.getElementById("instructionMenu").setAttribute("style","height:"+Math.floor(prametr/4)+'px');
}

function startButton(){
    document.getElementById('MainGame').style.display = 'inline';
    document.getElementById('MainInstruction').style.display = 'none';
    document.getElementById('MainMenu').style.display= 'none';
}

function optionsButton(){
    document.getElementById('MainOptions').style.display = 'inline';
    document.getElementById('MainGame').style.display = 'none';
    document.getElementById('MainInstruction').style.display = 'none';
}

function instructionButton(){
    document.getElementById('MainInstruction').style.display = 'inline';
    document.getElementById('MainGame').style.display = 'none';
}

function loadButton(){
    document.getElementById('MainLoad').style.display = 'inline';
    document.getElementById('MainGame').style.display = 'none';
    document.getElementById('MainInstruction').style.display = 'none';
}

function quitButton(){
    document.getElementById('MainGame').style.display = 'none';
	document.getElementById('MainMenu').style.display = 'inline';
	document.getElementById('menuToggle').style.display = 'none';
}

function saveButton(table){
    var data = [];
    for (var i=0; i<table.rows.length; i++) {
        var rawData = {}
        for (var j=0; j<table.rows[i].cells.length; j++) {
            let id = table.rows[i].cells[j].id;
            let state = table.rows[i].cells[j].className;
            let color = table.rows[i].cells[j].color;
            rawData[j] =
            {
                "id":id,
                "stan":state,
                "kolor":color
            };
            
        }
        data.push(rawData);
    }
    AddToServer(data,rows,cols)
    /*console.log(JSON.stringify(data));*/
    /*console.log("zapisano");*/
}

function AddToServer(text,row,col) {
    var request = new XMLHttpRequest();

    request.open("POST", "../PHP/server.php", true);
    request.send(JSON.stringify({
        polecenie: 2,
        dane : text,
        row : row,
        col : col
    }));
    loadMenuButton();
}

function loadTable(){
    if(document.getElementById('pliki').value){
        var request = new XMLHttpRequest();
        var plik = document.getElementById('pliki').value;
        /*console.log("1:"+plik);*/
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                LoadGridAndPopulate(response);
            }
        }
        request.open("POST", "../PHP/server.php", true);
        request.send(JSON.stringify({
            polecenie: 1,
            plik: plik+".data"
        }));
    }
}

function loadFiles(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            /*console.log(this.responseText);*/
            document.getElementById("pliki").innerHTML = this.responseText;
        }
    };

    request.open("POST", "../PHP/server.php", true);
    request.send(JSON.stringify({
        polecenie: 3
    })); }, 3000);
    
}

function loadMenuButton(){
 setTimeout(function(){if(document.getElementById("pliki").value != '')
    {
        document.getElementById("loadMenuButton").style.display = 'inline';
    }else{
        document.getElementById("loadMenuButton").style.display = 'none';
    }}, 3000);
    
}

/* ******************************************** MODUŁY ODPOWIEDZIALNE ZA DZIAŁANIE GAME OF LIFE ******************************************** */
var rows = 15;
var cols = 15;

function sizeWindow(x,y){
    /*console.log("y:"+(Math.floor(y/19)-7)+" x:"+Math.floor(x/19));*/
    document.getElementById('heightY').max = Math.floor(y/19)-9;
    document.getElementById('widthX').max = Math.floor(x/19);
    document.getElementById('heightY').value = rows;
    document.getElementById('widthX').value = cols;
}

function rc() {
    xyz();
    rows = document.getElementById('heightY').value;
    cols = document.getElementById('widthX').value;
    initialize();
}

function xyz() {
    var x = document.getElementById("table");
    x.remove();
}

var playing = false;
var grid = new Array(rows);
var color = new Array(rows);
var nextGrid = new Array(rows);
var reproductionTime;
var timer;

function rt(value) {
    reproductionTime = document.getElementById('interval').value;
}

function initialize(){
    createTable();
    initializeGrids();
    resetGrids();
    setupControlButtons();
}

function initializeGrids() {
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
        color[i] = new Array(cols);
    }
}

function resetGrids() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
}

function copyAndResetGrid() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

function createTable() {
    var gridContainer = document.getElementById('gridContainer');
    if (!gridContainer) {
        console.error("Problem: Brak div'a dla tabeli siatki!");
    }
    var table = document.createElement("table");
    table.setAttribute("id", "table");

    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < cols; j++) {
            var cell = document.createElement("td");
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead red");
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
}

function cellClickHandler() {
    var rowcol = this.id.split("_");
    var row = rowcol[0];
    var col = rowcol[1];

    var classes = this.getAttribute("class");
    if (classes.indexOf("live") > -1) {
        this.setAttribute("class", "dead red");
        grid[row][col] = 0;
    } else {
        this.setAttribute("class", "live green");
        grid[row][col] = 1;
    }

}

function updateView() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "_" + j);
            if (grid[i][j] == 0) {
                cell.setAttribute("class", "dead red");
            } else {
                cell.setAttribute("class", "live "+color[i][j]);
            }
        }
    }
}

function setupControlButtons() {
    document.getElementById('start').onclick = startButtonHandler;
    document.getElementById('clear').onclick = clearButtonHandler;
    document.getElementById('random').onclick = randomButtonHandler;
}

function randomButtonHandler() {
    if (playing) return;
    clearButtonHandler();
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var isLive = Math.round(Math.random());
            if (isLive == 1) {
                var cell = document.getElementById(i + "_" + j);
                cell.setAttribute("class", "live green");
                grid[i][j] = 1;
            }
        }
    }
}
function LoadGridAndPopulate(value) {
    xyz();
    cols = value.col;
    rows = value.row;
    initializeGrids();
    resetGrids();
    var gridContainer = document.getElementById('gridContainer');
    if (!gridContainer) {
        console.error("Problem: Brak div'a dla tabeli siatki!");
    }
    var table = document.createElement("table");
    table.setAttribute("id", "table");

    for (var i = 0; i < value.row; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < value.col; j++) { 
            var cell = document.createElement("td");
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead red");
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
    if (playing) return;
    clearButtonHandler();
    for (var i = 0; i < value.row; i++) {
        for (var j = 0; j < value.col; j++) {
                var cell = document.getElementById(i + "_" + j);
                cell.setAttribute("class", value.dane[i][j].stan);
                if(value.dane[i][j].stan.includes("live"))
                grid[i][j] = 1;
                else
                grid[i][j] = 0;
        }
    }
}

function clearButtonHandler() {
    /*console.log("Clear the game: stop playing, clear the grid");*/
    playing = false;
    var startButton = document.getElementById('start');
    startButton.innerHTML = "Start";
    clearTimeout(timer);

    var cellsList = document.getElementsByClassName("live");
    var cells = [];
    for (var i = 0; i < cellsList.length; i++) {
        cells.push(cellsList[i]);
    }

    for (var i = 0; i < cells.length; i++) {
        cells[i].setAttribute("class", "dead red");
    }

    resetGrids();
}

function stepButton(val) {
    for (var i = 0; i < val; i++) {
        computeNextGen();
    }
}

function startButtonHandler() {
    if (playing) {
        /*console.log("Pause the game");*/
        playing = false;
        this.value = "Continue";
        clearTimeout(timer);
    } else {
       /* console.log("Continue the game");*/
        playing = true;
        this.value = "Pause";
        play();
    }
}

function play() {
    computeNextGen();
    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            applyRules(i, j);
        }
    }
    copyAndResetGrid();
    updateView();
}
var rule = "standard";

function changeRules(){
    if(document.getElementById("rules").value == "standard"){
        rule = "standard";
    }
    else if(document.getElementById("rules").value == "maze"){
        rule = "maze";
    }
    else if(document.getElementById("rules").value == "highLife"){
        rule = "highLife";
    }
    else if(document.getElementById("rules").value == "ameba"){
        rule = "ameba";
    }
    else{
        rule="koral";
    }
}

function applyRules(row, col) {
        if(rule === "standard"){
            var numNeighbors = countNeighbors(row, col);
            if (grid[row][col] == 1) {
                if (numNeighbors < 2) {
                    nextGrid[row][col] = 0;
                } else if (numNeighbors == 2 || numNeighbors == 3) {
                    nextGrid[row][col] = 1;

                    if(numNeighbors == 2) {
                        color[row][col] = "blue";
                    }
                    else {
                        color[row][col] = "cyan";
                    }
                } else if (numNeighbors > 3) {
                    nextGrid[row][col] = 0;
                }
            } else if (grid[row][col] == 0) {
                if (numNeighbors == 3) {
                    nextGrid[row][col] = 1;
                    color[row][col] = "yellow";
                }
            }
        }
    
        if(rule === "maze"){
            var numNeighbors = countNeighbors(row, col);
            if (grid[row][col] == 1) {
                if (numNeighbors < 1) {
                    nextGrid[row][col] = 0;
                } else if (numNeighbors == 1 || numNeighbors == 2 || numNeighbors == 3 || numNeighbors == 4 || numNeighbors == 5) {
                    nextGrid[row][col] = 1;
                    if(numNeighbors == 1) {
                        color[row][col] = "blue";
                    }
                    else if(numNeighbors == 2){
                        color[row][col] = "cyan";
                    }
                    else if(numNeighbors == 3){
                        color[row][col] = "yellow";
                    }
                    else if(numNeighbors == 4){
                        color[row][col] = "white";
                    }
                    else{
                        color[row][col] = "pink";
                    }
                } else if (numNeighbors > 5) {
                    nextGrid[row][col] = 0;
                }
            } else if (grid[row][col] == 0) {
                if (numNeighbors == 3) {
                    nextGrid[row][col] = 1;
                    color[row][col] = "black";
                }
            }
        }

        if(rule === "highLife"){
            var numNeighbors = countNeighbors(row, col);
            if (grid[row][col] == 1) {
                if (numNeighbors < 2) {
                    nextGrid[row][col] = 0;
                } else if (numNeighbors == 2 || numNeighbors == 3) {
                    nextGrid[row][col] = 1;
                    if(numNeighbors == 2){
                        color[row][col] = "cyan";
                    }
                    else{
                        color[row][col] = "pink";
                    }
                } else if (numNeighbors > 3) {
                    nextGrid[row][col] = 0;
                }
            } else if (grid[row][col] == 0) {
                if (numNeighbors == 3 || numNeighbors == 6) {
                    nextGrid[row][col] = 1;
                    color[row][col] = "black";
                }
            }
        }

        if(rule === "ameba"){
            var numNeighbors = countNeighbors(row, col);
            if (grid[row][col] == 1) {
                if (numNeighbors < 1) {
                    nextGrid[row][col] = 0;
                } else if (numNeighbors == 1 ||  numNeighbors == 3 || numNeighbors == 5 || numNeighbors == 8) {
                    nextGrid[row][col] = 1;
                    if(numNeighbors == 1) {
                        color[row][col] = "blue";
                    }
                    else if(numNeighbors == 3){
                        color[row][col] = "cyan";
                    }
                    else if(numNeighbors == 5){
                        color[row][col] = "yellow";
                    }
                    else {
                        color[row][col] = "pink";
                    }
                } else if (numNeighbors > 8) {
                    nextGrid[row][col] = 0;
                }
            } else if (grid[row][col] == 0) {
                if (numNeighbors == 3 || numNeighbors == 5|| numNeighbors == 7) {
                    nextGrid[row][col] = 1;
                    color[row][col] = "black";
                }
            }
        }

        if(rule === "koral"){
            var numNeighbors = countNeighbors(row, col);
            if (grid[row][col] == 1) {
                if (numNeighbors < 4) {
                    nextGrid[row][col] = 0;
                } else if (numNeighbors == 4 ||  numNeighbors == 5 || numNeighbors == 6 || numNeighbors == 7 || numNeighbors == 8) {
                    nextGrid[row][col] = 1;
                    if(numNeighbors == 4) {
                        color[row][col] = "blue";
                    }
                    else if(numNeighbors == 5){
                        color[row][col] = "cyan";
                    }
                    else if(numNeighbors == 6){
                        color[row][col] = "yellow";
                    }
                    else if(numNeighbors == 7){
                        color[row][col] = "white";
                    }
                    else{
                        color[row][col] = "pink";
                    }
                } else if (numNeighbors > 8) {
                    nextGrid[row][col] = 0;
                }
            } else if (grid[row][col] == 0) {
                if (numNeighbors == 3) {
                    nextGrid[row][col] = 1;
                    color[row][col] = "black";
                }
            }
        }
    }



function countNeighbors(row, col) {
    var count = 0;
    if (row - 1 >= 0) {
        if (grid[row - 1][col] == 1) count++;
    }
    if (row - 1 >= 0 && col - 1 >= 0) {
        if (grid[row - 1][col - 1] == 1) count++;
    }
    if (row - 1 >= 0 && col + 1 < cols) {
        if (grid[row - 1][col + 1] == 1) count++;
    }
    if (col - 1 >= 0) {
        if (grid[row][col - 1] == 1) count++;
    }
    if (col + 1 < cols) {
        if (grid[row][col + 1] == 1) count++;
    }
    if (row + 1 < rows) {
        if (grid[row + 1][col] == 1) count++;
    }
    if (row + 1 < rows && col - 1 >= 0) {
        if (grid[row + 1][col - 1] == 1) count++;
    }
    if (row + 1 < rows && col + 1 < cols) {
        if (grid[row + 1][col + 1] == 1) count++;
    }
    return count;
}