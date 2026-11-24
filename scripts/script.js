/*
  Name: Jordan Gevedon
  File Name: script.js
  Date: 11/23/2026
*/

$(document).ready(function () {
  $(".dice").on("click", function () {
    var sides = $(this).data("sides");
    var roll = Math.floor(Math.random() * sides) + 1;
    var message = "You rolled a " + roll + " on a d" + sides + "!";

    if (sides === 20 && roll === 20) {
      message += " Critical hit!";
    } else if (sides === 20 && roll === 1) {
      message += " Critical fail...";
    }

    $("#result").text(message);
  });
});