var pos = [];
var click = { "startPos": "", "endPos": "" };
var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
               "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

var words = [ { "word": "BUFFALO", "direction": "N" },
              { "word": "LAKERS", "direction": "SE" },
              { "word": "PRECIPITATE", "direction": "NE" },
              { "word": "CALDRON", "direction": "S" },
              { "word": "MISCIBLE", "direction": "NW" },
              { "word": "AEON", "direction": "E" },
              { "word": "SCRUTINY", "direction": "E" },
              { "word": "CLEANERS", "direction": "S" },
              { "word": "SEETHING", "direction": "W" },
              { "word": "MOTH", "direction": "E" },
              { "word": "DOUBLE", "direction": "S" },
              { "word": "CREATURE", "direction": "N" },
              { "word": "GIPSY", "direction": "NW" },
              { "word": "MOBILE", "direction": "W" },
              { "word": "COMPUTER", "direction": "N" },
              { "word": "THEWEB", "direction": "N" },
              { "word": "HORSES", "direction": "E" },
              { "word": "ORANGE", "direction": "NE" },
              { "word": "CHROME", "direction": "NW" },
              { "word": "MULDER", "direction": "S" }
            ];

var totalCorrectWords = 0;
var selectedCount = 0;
var revealedCount = 0;
var cellSize = 40; // Dynamic cell size


var timerInterval;
var startTime;
var elapsedTime = 0;

function startTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(function () {
    elapsedTime = Date.now() - startTime;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  elapsedTime = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  var hours = Math.floor(elapsedTime / 3600000);
  var minutes = Math.floor((elapsedTime % 3600000) / 60000);
  var seconds = Math.floor((elapsedTime % 60000) / 1000);
  $(".timer").text(
    String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
  );
}

// Update scoreboard
function updateScoreboard() {
    $("#selected-count").text(selectedCount);
    $("#revealed-count").text(revealedCount);
    $("#remaining-count").text(totalCorrectWords - (selectedCount + revealedCount));
}

// Update canvas size based on .letters dimensions
function resizeCanvases() {
    var lettersDiv = document.querySelector(".letters");
    var newSize = Math.min(lettersDiv.clientWidth, lettersDiv.clientHeight); // Square aspect
    cellSize = newSize / 20; // 20x20 grid

    var canvases = ["c", "a"];
    canvases.forEach(id => {
        var canvas = document.getElementById(id);
        if (canvas) {
            canvas.width = newSize;
            canvas.height = newSize;
            setCanvas(id); // Re-initialize context
        }
    });
}

// Initialize game logic
function initializeGame() {
    var size = 400; // 20x20 grid
    var grid = new Array(size + 1); // 1-based indexing
    var occupiedPositions = new Set();

    for (var i = 1; i <= size; i++) {
        grid[i] = getRandomLetter();
    }

    for (var i = 0; i < words.length; i++) {
        var placed = false;
        var attempts = 0;
        var maxAttempts = 100;

        while (!placed && attempts < maxAttempts) {
            words[i].start = getRandomStartPosition(words[i].direction, words[i].word.length);
            var currentPos = words[i].start;
            var wordPositions = [];
            var canPlace = true;

            for (var j = 0; j < words[i].word.length; j++) {
                if (occupiedPositions.has(currentPos) && grid[currentPos] !== words[i].word[j]) {
                    canPlace = false;
                    break;
                }
                wordPositions.push(currentPos);
                if (j + 1 !== words[i].word.length) {
                    if (words[i].direction === "N") currentPos -= 20;
                    else if (words[i].direction === "NE") currentPos -= 19;
                    else if (words[i].direction === "E") currentPos += 1;
                    else if (words[i].direction === "SE") currentPos += 21;
                    else if (words[i].direction === "S") currentPos += 20;
                    else if (words[i].direction === "SW") currentPos += 19;
                    else if (words[i].direction === "W") currentPos -= 1;
                    else if (words[i].direction === "NW") currentPos -= 21;
                }
            }

            if (canPlace) {
                currentPos = words[i].start;
                for (var j = 0; j < words[i].word.length; j++) {
                    grid[currentPos] = words[i].word[j];
                    occupiedPositions.add(currentPos);
                    if (j + 1 !== words[i].word.length) {
                        if (words[i].direction === "N") currentPos -= 20;
                        else if (words[i].direction === "NE") currentPos -= 19;
                        else if (words[i].direction === "E") currentPos += 1;
                        else if (words[i].direction === "SE") currentPos += 21;
                        else if (words[i].direction === "S") currentPos += 20;
                        else if (words[i].direction === "SW") currentPos += 19;
                        else if (words[i].direction === "W") currentPos -= 1;
                        else if (words[i].direction === "NW") currentPos -= 21;
                    }
                }
                words[i].end = currentPos;
                words[i].positions = wordPositions;
                pos[i] = { "start": words[i].start, "end": words[i].end };
                placed = true;
            }
            attempts++;
        }

        if (!placed) {
            console.warn(`Could not place ${words[i].word} after ${maxAttempts} attempts`);
        }
    }

    totalCorrectWords = words.filter(w => w.positions !== undefined).length;
    updateScoreboard();

    $(".letters").empty();
    for (var i = 1; i <= size; i++) {
        $(".letters").append("<span class='" + i + "'>" + grid[i] + "</span>");
    }

    for (var i = 0; i < words.length; i++) {
        $(".words").append("<span class='" + i + "'>" + words[i].word + "</span>");
    }

    $("#menu").on("mouseup", function() {
        $(this).css({"display": "none"});
        $("#main").slideDown("slow", function() {});
    });

    resizeCanvases();
}

// Function to reveal unselected correct words with animation
function revealUnselectedWords() {
    setCanvas("a");
    strokeColor = "#eab308";

    for (var i = 0; i < words.length; i++) {
        var wordSpan = $(".words").find("." + i);
        if (!wordSpan.hasClass("strike") && words[i].positions) {
            var startPos = words[i].start;
            var endPos = words[i].end;

            var startRow = Math.floor((startPos - 1) / 20);
            var startCol = (startPos - 1) % 20;
            var endRow = Math.floor((endPos - 1) / 20);
            var endCol = (endPos - 1) % 20;

            sX = startCol * cellSize;
            sY = startRow * cellSize;
            eX = endCol * cellSize;
            eY = endRow * cellSize;

            draw("mousedown", true);
            draw("mouseup", true);

            var positions = words[i].positions;
            for (var j = 0; j < positions.length; j++) {
                var $span = $(".letters").find("." + positions[j]);
                $span.removeClass("correct-word").addClass("revealed-word");
            }
            wordSpan.addClass("strike");
            revealedCount++;
        }
    }

    updateScoreboard();
    strokeColor = "black";
}

// Function to initialize canvases and bind events
function initializeCanvases() {
    // console.log("DOM body:", document.body.innerHTML);

    if (!document.getElementById("c")) {
        // console.log("Adding canvas #c");
        var canvasC = document.createElement("canvas");
        canvasC.id = "c";
        document.querySelector(".letters").appendChild(canvasC);
    }
    if (!document.getElementById("a")) {
        // console.log("Adding canvas #a");
        var canvasA = document.createElement("canvas");
        canvasA.id = "a";
        document.querySelector(".letters").appendChild(canvasA);
    }

    resizeCanvases();
    setCanvas("c");
    setCanvas("a");

    var retries = 0;
    var maxRetries = 50;

    if (!document.getElementById("c") || !document.getElementById("a")) {
        retries++;
        if (retries < maxRetries) {
            console.error(`Canvases not found after ${retries} attempts, retrying...`);
            setTimeout(initializeCanvases, 100);
        } else {
            console.error(`Failed to find canvases after ${maxRetries} attempts. Please check HTML structure.`);
        }
        return;
    }

    // console.log("Canvases initialized successfully");

    $("#c").on("mousedown mouseup mousemove mouseleave", function(e) {
        e.preventDefault();
        if (e.type === "mousedown") {
            setCanvas("c");
            isMouseDown = true;
            sX = e.offsetX || e.clientX - $(e.target).offset().left;
            sY = e.offsetY || e.clientY - $(e.target).offset().top;
            setPos(sX, sY, "start");
            // console.log(`Mouse down: sX=${sX}, sY=${sY}, startPos=${click.startPos}`);
            draw(e.type);
        } else if (e.type === "mousemove") {
            if (isMouseDown) {
                mouseMoved = true;
                eX = e.offsetX || e.clientX - $(e.target).offset().left;
                eY = e.offsetY || e.clientY - $(e.target).offset().top;
                draw(e.type);
            }
        } else if (e.type === "mouseup") {
            isMouseDown = false;
            ctx.clearRect(0, 0, width, height);
            if (mouseMoved) {
                mouseMoved = false;
                eX = e.offsetX || e.clientX - $(e.target).offset().left;
                eY = e.offsetY || e.clientY - $(e.target).offset().top;
                setPos(eX, eY, "end");
                // console.log(`Mouse up: eX=${eX}, eY=${eY}, endPos=${click.endPos}`);
                draw(e.type);
                ctx.clearRect(0, 0, width, height);
                if (checkWord()) {
                    setCanvas("a");
                    draw(e.type);
                    scratchWord();
                    selectedCount++;
                    updateScoreboard();
                    if (isEndOfGame()) {
                        alert("Good job!");
                    }
                }
            }
        } else if (e.type === "mouseleave") {
            isMouseDown = false;
            draw(e.type);
        }
    });

     $("#reveal-btn").on("click", function () {
       if ($(this).text() === "Reveal Positions") {
         // Change button text to "Start Again"
         $(this).text("Start Again");
         revealUnselectedWords(); // Call the reveal function
       } else {
         // Refresh the page when "Start Again" is clicked
         location.reload();
       }
     });

    $(window).on("resize", function() {
        resizeCanvases();
    });
}

$(document).ready(function() {
    // console.log("jQuery ready triggered");
    initializeGame();
    initializeCanvases();
    startTimer();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomStartPosition(direction, length) {
    if (direction === "N") return getRandomInt(20 * (length - 1) + 1, 400);
    if (direction === "S") return getRandomInt(1, 400 - 20 * (length - 1));
    if (direction === "E") {
        var r = getRandomInt(1, 20);
        return getRandomInt((r - 1) * 20 + 1, r * 20 - length + 1);
    }
    if (direction === "W") {
        var r = getRandomInt(1, 20);
        return getRandomInt((r - 1) * 20 + length, r * 20);
    }
    if (direction === "NE") {
        var r = getRandomInt(length, 20);
        var c = getRandomInt(1, 20 - length + 1);
        return (r - 1) * 20 + c;
    }
    if (direction === "SE") {
        var r = getRandomInt(1, 20 - length + 1);
        var c = getRandomInt(1, 20 - length + 1);
        return (r - 1) * 20 + c;
    }
    if (direction === "SW") {
        var r = getRandomInt(1, 20 - length + 1);
        var c = getRandomInt(length, 20);
        return (r - 1) * 20 + c;
    }
    if (direction === "NW") {
        var r = getRandomInt(length, 20);
        var c = getRandomInt(length, 20);
        return (r - 1) * 20 + c;
    }
    throw new Error("Invalid direction: " + direction);
}

function getRandomLetter() {
    return letters[Math.floor(Math.random() * letters.length)];
}

var sX, sY, eX, eY, canvas, ctx, height, width, diff;
var r = 14;
var n = Math.sqrt((r * r) / 2);
var strokeColor = "black";
var isMouseDown = false;
var mouseMoved = false;

function setCanvas(id) {
    canvas = document.getElementById(id);
    if (!canvas) {
        console.error(`Canvas with id="${id}" not found in DOM`);
        return;
    }
    ctx = canvas.getContext("2d");
    width = canvas.width;
    height = canvas.height;
    r = cellSize * 0.35;
    n = Math.sqrt((r * r) / 2);
}

function setPos(x, y, loc) {
    var tX = Math.floor(x / cellSize) + 1;
    var tY = Math.floor(y / cellSize) + 1;
    var position = (tY - 1) * 20 + tX;
    if (position < 1 || position > 400) {
        console.warn(`Invalid position calculated: ${position} from x=${x}, y=${y}`);
        return;
    }
    if (loc === "start") click.startPos = position;
    else click.endPos = position;
}

function draw(f, isReveal = false) {
    function drawArc(xArc, yArc, num1, num2) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        var snappedX = Math.floor(xArc / cellSize) * cellSize + cellSize / 2;
        var snappedY = Math.floor(yArc / cellSize) * cellSize + cellSize / 2;
        ctx.arc(snappedX, snappedY, r, num1 * Math.PI, num2 * Math.PI);
        // console.log(`Drawing arc at: x=${snappedX}, y=${snappedY}`);
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }

    function drawLines(mX1, mY1, lX1, lY1, mX2, mY2, lX2, lY2) {
        ctx.beginPath();
        ctx.moveTo(mX1, mY1);
        ctx.lineTo(lX1, lY1);
        ctx.moveTo(mX2, mY2);
        ctx.lineTo(lX2, lY2);
        // console.log(`Drawing lines from (${mX1}, ${mY1}) to (${lX1}, ${lY1}) and (${mX2}, ${mY2}) to (${lX2}, ${lY2})`);
        ctx.stroke();
    }

    if (!ctx) return;

    if (f === "mousedown") {
        if (!isReveal) ctx.clearRect(0, 0, width, height);
        drawArc(sX, sY, 0, 2);
    } else if (f === "mousemove" || f === "mouseup") {
        var limit = ((sY - eY) * Math.sqrt(6)) / (sX - eX);
        var startX = Math.floor(sX / cellSize) * cellSize;
        var startY = Math.floor(sY / cellSize) * cellSize;
        var endX = Math.floor(eX / cellSize) * cellSize;
        var endY = Math.floor(eY / cellSize) * cellSize;

        if ((limit > 6 || limit < -6) && eY < sY) { // UP
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            drawArc(startX, startY, 0, 1);
            drawArc(startX, endY, 1, 2);
            drawLines(startX + cellSize / 2 + r, startY + cellSize / 2, startX + cellSize / 2 + r, endY + cellSize / 2,
                      startX + cellSize / 2 - r, startY + cellSize / 2, startX + cellSize / 2 - r, endY + cellSize / 2);
        } else if ((limit < -6 || limit > 6) && eY > sY) { // DOWN
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            drawArc(startX, startY, 1, 2);
            drawArc(startX, endY, 0, 1);
            drawLines(startX + cellSize / 2 + r, startY + cellSize / 2, startX + cellSize / 2 + r, endY + cellSize / 2,
                      startX + cellSize / 2 - r, startY + cellSize / 2, startX + cellSize / 2 - r, endY + cellSize / 2);
        } else if ((limit < 1 && limit > -1) && eX < sX) { // LEFT
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            drawArc(startX, startY, 1.5, 0.5);
            drawArc(endX, startY, 0.5, 1.5);
            drawLines(startX + cellSize / 2, startY + cellSize / 2 - r, endX + cellSize / 2, startY + cellSize / 2 - r,
                      startX + cellSize / 2, startY + cellSize / 2 + r, endX + cellSize / 2, startY + cellSize / 2 + r);
        } else if ((limit < 1 && limit > -1) && eX > sX) { // RIGHT
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            drawArc(startX, startY, 0.5, 1.5);
            drawArc(endX, startY, 1.5, 0.5);
            drawLines(startX + cellSize / 2, startY + cellSize / 2 - r, endX + cellSize / 2, startY + cellSize / 2 - r,
                      startX + cellSize / 2, startY + cellSize / 2 + r, endX + cellSize / 2, startY + cellSize / 2 + r);
        } else if ((limit > 1 && limit < 6) && (eX < sX && eY < sY)) { // NW
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            diff = startX - endX;
            drawArc(startX, startY, 1.75, 0.75);
            drawArc(startX - diff, startY - diff, 0.75, 1.75);
            drawLines(startX + cellSize / 2 + n, startY + cellSize / 2 - n, startX + cellSize / 2 + n - diff, startY + cellSize / 2 - n - diff,
                      startX + cellSize / 2 - n, startY + cellSize / 2 + n, startX + cellSize / 2 - n - diff, startY + cellSize / 2 + n - diff);
        } else if ((limit < -1 && limit > -6) && (eX > sX && eY < sY)) { // NE
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            diff = startX - endX;
            drawArc(startX, startY, 0.25, 1.25);
            drawArc(startX - diff, startY + diff, 1.25, 0.25);
            drawLines(startX + cellSize / 2 + n, startY + cellSize / 2 + n, startX + cellSize / 2 + n - diff, startY + cellSize / 2 + n + diff,
                      startX + cellSize / 2 - n, startY + cellSize / 2 - n, startX + cellSize / 2 - n - diff, startY + cellSize / 2 - n + diff);
        } else if ((limit < -1 && limit > -6) && (eX < sX && eY > sY)) { // SW
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            diff = startX - endX;
            drawArc(startX, startY, 1.25, 0.25);
            drawArc(startX - diff, startY + diff, 0.25, 1.25);
            drawLines(startX + cellSize / 2 + n, startY + cellSize / 2 + n, startX + cellSize / 2 + n - diff, startY + cellSize / 2 + n + diff,
                      startX + cellSize / 2 - n, startY + cellSize / 2 - n, startX + cellSize / 2 - n - diff, startY + cellSize / 2 - n + diff);
        } else if ((limit > 1 && limit < 6) && (eX > sX && eY > sY)) { // SE
            if (f === "mousemove" && !isReveal) ctx.clearRect(0, 0, width, height);
            diff = startX - endX;
            drawArc(startX, startY, 0.75, 1.75);
            drawArc(startX - diff, startY - diff, 1.75, 0.75);
            drawLines(startX + cellSize / 2 + n, startY + cellSize / 2 - n, startX + cellSize / 2 + n - diff, startY + cellSize / 2 - n - diff,
                      startX + cellSize / 2 - n, startY + cellSize / 2 + n, startX + cellSize / 2 - n - diff, startY + cellSize / 2 + n - diff);
        }
    } else if (f === "mouseleave") {
        setCanvas("c");
        ctx.clearRect(0, 0, width, height);
    }
}

function checkWord() {
    function clearPos(p) {
        p.start = p.end = 0;
        return true;
    }

    for (var i = 0; i < words.length; i++) {
        if (!words[i].positions) continue;
        var word = words[i].word;
        var direction = words[i].direction;
        var start = pos[i].start;
        var end = pos[i].end;

        var isForwardMatch = (start === click.startPos && end === click.endPos);
        var isBackwardMatch = (start === click.endPos && end === click.startPos);

        if (isForwardMatch || isBackwardMatch) {
            var step;
            if (direction === "N") step = -20;
            else if (direction === "NE") step = -19;
            else if (direction === "E") step = 1;
            else if (direction === "SE") step = 21;
            else if (direction === "S") step = 20;
            else if (direction === "SW") step = 19;
            else if (direction === "W") step = -1;
            else if (direction === "NW") step = -21;

            var selectedStart = isForwardMatch ? click.startPos : click.endPos;
            var selectedEnd = isForwardMatch ? click.endPos : click.startPos;
            var selectedLetters = "";
            var currentPos = selectedStart;
            var steps = Math.abs((selectedEnd - selectedStart) / step) + 1;

            // console.log(`Checking ${word}: start=${selectedStart}, end=${selectedEnd}, steps=${steps}`);
            for (var j = 0; j < steps; j++) {
                var letter = $(".letters").find("." + currentPos).text();
                selectedLetters += letter;
                // console.log(`Pos ${currentPos}: ${letter}`);
                if (j < steps - 1) currentPos += step;
            }
            // console.log(`Selected: ${selectedLetters}, Expected: ${word}`);

            if (selectedLetters === word && clearPos(pos[i])) {
                var positions = words[i].positions;
                for (var j = 0; j < positions.length; j++) {
                    $(".letters").find("." + positions[j]).addClass("correct-word");
                }
                return true;
            }
        }
    }
    return false;
}

function scratchWord() {
    for (var i = 0; i < words.length; i++) {
        if ((click.startPos === words[i].start && click.endPos === words[i].end) ||
            (click.startPos === words[i].end && click.endPos === words[i].start)) {
            $(".words").find("." + i).addClass("strike");
        }
    }
}

function isEndOfGame() {
    if (
      pos.every(function (o) {
        return o.start === 0 && o.end === 0;
      })
    ) {
      stopTimer(); // Stop the timer when all words are found
      return true;
    }
    return false;
}

$("#reveal-btn").on("click", function () {
  revealUnselectedWords();
  stopTimer(); // Stop the timer when the reveal button is clicked
});