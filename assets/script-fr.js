"use strict";
/*!
 * = Simulateur de Pile ou Face =
 *  Script commenté
 * 
 * Utilise Jquery
 * https://jquery.com/
 * 
 *  Par Hickacou
 *  Juin 2019
 * 
 * (Ce script a été commenté pour un professeur, donc certains points doivent paraître évidents)
 */

// VARIABLES GLOBALES \\

var data = { // Données statistiques
    tails: 0, //Nombre de piles
    heads: 0, //Nombre de faces
    tailsPercent: 0, //Pourcentage de piles
    headsPercent: 0, //Pourcentage de faces
    total: 0, //Total (Piles+Faces)
    fifty: 0, //Nombre d'égalités parfaites (50% piles/50% faces),
    difference: 0 //Différence entre le nombre de piles et de faces. Toujours positive
};

var options = {
    pauseAtFifty: false, //Pause automatique lors d'une égalité parfaite, désactivé de base
    interval: 50 //Interval (minimum*) entre chaque pièce, 50ms de base
}

var throwInterval; //Représente le système de répétition (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) des lancers, permettant ainsi de l'arrêter
var isThrowing = false; //Indique si le système de répétition est en marche, de base il ne l'est pas


// FONCTIONS \\

function getCoin() { // Fonction de jeter de pièce
    let rnd = Math.random(); // Tire un nombre aléatoire entre 0 et 1
    if (rnd > 0.5) return true; // Si le nombre est strictement supérieur à 0.5, on obtient true (Face)
    else if (rnd < 0.5) return false; // Si le nombre est strictement inférieur à 0.5, obtient false (Pile)
    else if (rnd == 0.5) return getCoin(); // Si le nombre est égal à 0.5, on relance la pièce.
}

function reset() { // Fonction de remise à 0 des données du simulateur
    pause(true);
    data.tails = data.heads = data.total = data.fifty = 0; // Remise à 0 de toutes les données statistiques
    $("#history").html(""); // Remise à 0 du contenu de l'historique
    $(".stat").text("0"); // Remise à 0 de toutes les autres stats
}

function pause(forcePause = false) { // Fonction de mise en pause/marche du système de répétition. Si forcePause = true, la fonction ne remettra pas le système en marche même s'il est en pause.
    if (isThrowing || forcePause) { // Si le système de répétition est en marche :
        clearInterval(throwInterval); // Arrêt de la répétition
        $("#results #pause").css("opacity", 1); // Affiche l'indicateur de pause
    }
    else { // Si le système de répétition est en pause : 
        throwInterval = setInterval(throwCoin, options.interval); // Relance le système de répétition
        $("#results #pause").css("opacity", 0); // Cache l'indicateur de pause 
    }
    isThrowing = !isThrowing; //On inverse la valeur de isThrowing car on a inversé le fonctionnement du système de répétition
}

function throwCoin() { // Fonction gèrant chaque nouveau lancer
    var coin = getCoin(); // On lance une nouvelle pièce

    var newHistoryLine = $("<div></div>").addClass("history-line");
    var newResult = $("<div></div>").addClass("result"); // On prépare les éléments à intégrer à la page suite au lancer

    if (coin) { // Si l'on a obtenu face :
        $("#values #heads .count").text(++data.heads); // On incrémente le nombre de faces et l'affiche
        newResult.addClass("head").text("Face");
        newHistoryLine.addClass("head").text(`Pièce n°${(data.total = data.heads + data.tails)} : Face`).attr("id", `h${data.total}`); // On donne les bonnes propriétés aux éléments à intégrer, tout en mettant à jour le compte total

    }
    else {
        $("#values #tails .count").text(++data.tails); // On incrémente le nombre de piles et l'affiche
        newResult.addClass("tail").text("Pile");
        newHistoryLine.addClass("tail").text(`Pièce n°${(data.total = data.heads + data.tails)} : Pile`).attr("id", `h${data.total}`); // On donne les bonnes propriétés aux éléments à intégrer, tout en mettant à jour le compte total
    }

    newResult.appendTo("#results") // On affiche le dernier résultat préparé au préalable
        .delay(500).queue(function () {
            $(this).remove();
        }); // On le supprime de la page à la fin de son animation (CSS) de 500ms, dans un soucis d'optimisation

    $("#history").append(newHistoryLine)  // On ajoute une nouvelle ligne à l'historique

    data.headsPercent = data.heads / data.total * 100;
    data.tailsPercent = data.tails / data.total * 100; // On calcule les pourcentages de piles/faces

    $("#values #heads .percent").text(`${data.headsPercent.toFixed(2)}%`);
    $("#values #tails .percent").text(`${data.tailsPercent.toFixed(2)}%`); // On affiche ces pourcentages, arrondis au centième près (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/toFixed)

    $("#values .percent").css("color", "black"); // On remet la couleur des pourcentages en noir, si jamais il a été rendu en blanc au lancer précédent à cause d'une égalité parfaite

    if (data.heads == data.tails) { // Si une égalité parfaite survient
        data.fifty++; // On incrémente le nombre d'égalités parfaites
        $("<div></div>").addClass("history-line fifty").attr("id", `h${data.total}`).text(`Pièce n°${data.total} : 50%/50%`).appendTo("#history");
        $("#values .percent").css("color", "white"); // On affiche les pourcentages en blanc pour indiquer l'égalité parfaite
        if (options.pauseAtFifty) pause(); // On arrête le système de répétition si l'option de pause automatique lors d'égalité parfaite est activée

    }

    $(`#history #h${data.total - 50}`).remove(); // On maintien le nombre de lignes dans l'historique à 50 (51 lors d'une égalité parfaite) dans un soucis d'optimisation.
    $("#history").scrollTop($("#history").prop("scrollHeight")); // On maintien le défilement de l'historique en bas

    //On affiche les statistiques mises à jour.
    $("#stats #heads .stat").text(data.heads);
    $("#stats #tails .stat").text(data.tails);
    $("#stats #fifty .stat").text(data.fifty);
    $("#stats #total .stat").text(data.total);
    $("#stats #diff .stat").text(`${Math.abs(data.tails - data.heads)} ${(data.tails > data.heads) ? "(Piles)" : (data.tails < data.heads) ? "(Faces)" : ""}`); // La différence indique quel côté de la pièce a l'avantage à l'aide de deux opérateurs ternaires (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Op%C3%A9rateurs/L_op%C3%A9rateur_conditionnel)

}

// EVENEMENTS \\

$(window).keydown(function (e) {
    if (e.keyCode == 32) pause(); //Si la barre espace est pressée, on appelle la fonction pause()
});

$("#options #pause-at-fifty #check-fifty-pause").change(function () {
    options.pauseAtFifty = $(this).is(":checked");
    // On met à jour l'option de pause automatique lors d'une égalité parfaite dès qu'on détecte un changement de valeur sur la checkbox liée
});

$("#options #throw-interval #OK-interval").click(function () {
    options.interval = Math.abs(parseInt($("#interval-input").val()) || 50); // On met à jour l'interval entre chaque lancer en prenant soin de récupérer dans tous les cas un ENTIER POSITIF
    $("#interval-input").val(options.interval); // On affiche ensuite cette nouvelle valeur dans l'input pour informer l'utilisateur
    pause();
    pause(); //On relance le système avec le nouvel interval
    $(this).blur();
});

$("#reset-button").click(function () {
    reset()
    $(this).blur();
});


// LANCEMENT INITIAL \\
$("#check-fifty-pause").prop("checked", options.pauseAtFifty); // On indique si la pause automatique lors d'égalité parfaite est activée
$("#interval-input").val(options.interval); // On affiche l'interval initial dans l'input lié
pause(); // On lance le simulateur
$("html").focus(); // Permet de rendre fonctionnel l'événement d'appui sur la touche espace, qui peut parfois ne pas fonctionner tant que l'on a pas cliqué sur la page 

// * : En fonction des performances de l'ordinateur, chaque lancer peut prendre quelques millisecondes, en plus de l'interval minimum. Donc, on assure un interval minimum entre chaque lancer, mais pas un maximum.