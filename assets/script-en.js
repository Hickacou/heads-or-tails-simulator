"use strict";
/*!
 * = Simulateur de Pile ou Face =
 *  Documented script
 * 
 * Requires Jquery
 * https://jquery.com/
 * 
 *  By Hickacou
 *  June 2019
 * 
 * This documented script was made for a teacher, in French. Many points are obvious and surely badly translated, but I did as I could :D
 */

// GLOBAL VARIABLES \\

var data = { // Statistic data
    tails: 0, //Tails count
    heads: 0, //Heads count
    tailsPercent: 0, //Tails percentage
    headsPercent: 0, //Heads percentage
    total: 0, //Total (Tails+Heads)
    fifty: 0, //Perfect equality count (50% tails/50% heads),
    difference: 0 //Difference between heads count and tails count. Always positive
};

var options = {
    pauseAtFifty: false, //Automatic pause at perfect equality, False by default
    interval: 50 //(minimum*) Interval between each throw, 50ms by default
}

var throwInterval; // Variable containing the interval (setInterval) of the throws
var isThrowing = false;


// Functions \\

function getCoin() { // Throwing a random coin
    let rnd = Math.random(); // Draw a random number between 0 and 1
    if (rnd > 0.5) return true; // If it's > 0.5, we get true (Head)
    else if (rnd < 0.5) return false; // if it's < 0.5, we get false (Tail)
    else if (rnd == 0.5) return getCoin(); //If it's = 0.5, we throw it again.
}

function reset() {
    pause(true);
    data.tails = data.heads = data.total = data.fifty = 0; // Resetting all statistic data
    $("#history").html(""); // Resetting history content
    $(".stat").text("0"); // Resetting displayed statistics
}

function pause(forcePause = false) {
    if (isThrowing || forcePause) { // If the inverval is on or if we want to pause is all cases
        clearInterval(throwInterval); // We stop the interval;
        $("#results #pause").css("opacity", 1); // We display the pause indicator
    }
    else { // If the interval is already paused and 
        throwInterval = setInterval(throwCoin, options.interval); // Restarts the interval
        $("#results #pause").css("opacity", 0); // Hides the pause indicator
    }
    isThrowing = !isThrowing;
}

function throwCoin() { // Function handling each new throw
    var coin = getCoin(); // We store a throw

    var newHistoryLine = $("<div></div>").addClass("history-line");
    var newResult = $("<div></div>").addClass("result"); //We prepare the new elements to put in the page

    if (coin) { // If we got head :
        $("#values #heads .count").text(++data.heads); // We increment the head count and display it
        newResult.addClass("head").text("Face");
        newHistoryLine.addClass("head").text(`Pièce n°${(data.total = data.heads + data.tails)} : Face`).attr("id", `h${data.total}`); // 

    }
    else {
        $("#values #tails .count").text(++data.tails); // We increment the head count and display it
        newResult.addClass("tail").text("Pile");
        newHistoryLine.addClass("tail").text(`Pièce n°${(data.total = data.heads + data.tails)} : Pile`).attr("id", `h${data.total}`); // We give right properties to the elements to display, while updating the total
    }

    newResult.appendTo("#results") // We display the last result prepared before
        .delay(500).queue(function () {
            $(this).remove();
        }); // We delete it after its 500ms long CSS animation, for optimization

    $("#history").append(newHistoryLine)  // We add a new line in the history

    data.headsPercent = data.heads / data.total * 100;
    data.tailsPercent = data.tails / data.total * 100; // We calculate the new percentages

    $("#values #heads .percent").text(`${data.headsPercent.toFixed(2)}%`);
    $("#values #tails .percent").text(`${data.tailsPercent.toFixed(2)}%`); // We display them, rounded to 2 decimals (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/toFixed)

    $("#values .percent").css("color", "black"); // We put the percentages color in black back, if it got white in the last throw.

    if (data.heads == data.tails) { // In the case of a perfect equality
        data.fifty++; // We increment its count
        $("<div></div>").addClass("history-line fifty").attr("id", `h${data.total}`).text(`Pièce n°${data.total} : 50%/50%`).appendTo("#history");
        $("#values .percent").css("color", "white"); // We display the percentages in white
        if (options.pauseAtFifty) pause(); // We stop the throwing interval if the pause a fifty/fifty option was enabled

    }

    $(`#history #h${data.total - 50}`).remove(); // We keep the length of the history at 50 elements (51 if perfect equality), for the optimization
    $("#history").scrollTop($("#history").prop("scrollHeight")); // We automatically scroll it down

    // We display the updated statistics
    $("#stats #heads .stat").text(data.heads);
    $("#stats #tails .stat").text(data.tails);
    $("#stats #fifty .stat").text(data.fifty);
    $("#stats #total .stat").text(data.total);
    $("#stats #diff .stat").text(`${Math.abs(data.tails - data.heads)} ${(data.tails > data.heads) ? "(Piles)" : (data.tails < data.heads) ? "(Faces)" : ""}`); // The difference displays wich of heads or tails has the advantage, using the ternary operation (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Op%C3%A9rateurs/L_op%C3%A9rateur_conditionnel)

}

// EVENTS \\

$(window).keydown(function (e) {
    if (e.keyCode == 32) pause(); // If space bar is pressed, we call pause() function
});

$("#options #pause-at-fifty #check-fifty-pause").change(function () {
    options.pauseAtFifty = $(this).is(":checked");
    // We update the pauseAtFifty option if we detect a change on the button
});

$("#options #throw-interval #OK-interval").click(function () {
    options.interval = Math.abs(parseInt($("#interval-input").val()) || 50); // We update the throwingInterval, which has to always be a positive integer (n>0)
    $("#interval-input").val(options.interval); // We display the new value in the input
    pause();
    pause(); //We restart the interval
    $(this).blur();
});

$("#reset-button").click(function () {
    reset()
    $(this).blur();
});


// STARTING \\
$("#check-fifty-pause").prop("checked", options.pauseAtFifty); // We indicate if the pauseAtFifty setting is enabled
$("#interval-input").val(options.interval); // We display the inital interval
pause(); // We start the program
$("html").focus(); // Make that the keydown event fires


// * : Depending on the performances, a throw can take some extra time, in addition to the throwingInterval. So, we ensure a minimum interval between each coin, but not a maximum