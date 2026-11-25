/*
  Name: Jordan Gevedon
  File Name: script.js
  Date: 11/24/2026
*/

$(function () {

  // Dice roller on the home page
  $(document).off("click.dice").on("click.dice", ".dice", function () {
    var sides = Number($(this).data("sides"));
    var roll = Math.floor(Math.random() * sides) + 1;
    var message = "You rolled a " + roll + " on a d" + sides + "!";

    if (sides === 20 && roll === 20) {
      message += " Critical hit!";
    } else if (sides === 20 && roll === 1) {
      message += " Critical fail...";
    }

    $("#result").text(message);
  });

  // Ability scores on the sheet page
  function clampScore(value) {
    var n = parseInt(value, 10);
    if (isNaN(n)) {
      n = 10;
    }
    return Math.max(1, Math.min(30, n));
  }

  function formatMod(score) {
    var mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? "+" + mod : String(mod);
  }

  function updateRow($row) {
    var score = clampScore($row.find(".score").val());
    $row.find(".score").val(score);
    $row.find(".mod").text(formatMod(score));
  }

  // Typing a score updates its modifier
  $(document).off("input.score change.score").on("input.score change.score", ".score", function () {
    updateRow($(this).closest("tr"));
  });

  // Plus and minus buttons raise or lower a score by one
  $(document).off("click.step").on("click.step", ".step", function () {
    var $row = $(this).closest("tr");
    var change = $(this).hasClass("plus") ? 1 : -1;
    var score = clampScore($row.find(".score").val()) + change;
    $row.find(".score").val(clampScore(score));
    updateRow($row);
  });

  // Roll four dice for each ability and drop the lowest
  $(document).off("click.roll").on("click.roll", "#roll-stats", function () {
    $("#ability-table tbody tr").each(function () {
      var dice = [];
      for (var i = 0; i < 4; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1);
      }
      dice.sort(function (a, b) { return a - b; });
      $(this).find(".score").val(dice[1] + dice[2] + dice[3]);
      updateRow($(this));
    });
  });

  // Inventory on the sheet page
  function updateWeight() {
    var total = 0;
    $("#inventory-body tr").each(function () {
      var qty = parseFloat($(this).find(".item-qty").val()) || 0;
      var weight = parseFloat($(this).find(".item-weight").val()) || 0;
      total += qty * weight;
    });
    $("#total-weight").text("Total weight: " + total.toFixed(1) + " lb");
  }

  function newItemRow() {
    return '<tr>' +
      '<td><input type="text" class="item-name" placeholder="Item name" aria-label="Item name"></td>' +
      '<td><input type="number" class="item-qty" min="0" value="1" aria-label="Quantity"></td>' +
      '<td><input type="number" class="item-weight" min="0" step="0.1" value="0" aria-label="Weight in pounds"></td>' +
      '<td><button class="remove-btn" aria-label="Remove item">&#10005;</button></td>' +
      '</tr>';
  }

  $(document).off("click.add").on("click.add", "#add-item", function () {
    $("#inventory-body").append(newItemRow());
    updateWeight();
  });

  $(document).off("click.remove").on("click.remove", ".remove-btn", function () {
    $(this).closest("tr").remove();
    updateWeight();
  });

  $(document).off("input.weight").on("input.weight", ".item-qty, .item-weight", updateWeight);

  // Set the starting modifiers and weight when the sheet loads
  $("#ability-table tbody tr").each(function () {
    updateRow($(this));
  });
  updateWeight();

  // Initiative tracker on the home page
  var turn = 0;

  function highlightTurn() {
    var $items = $("#initiative-list li");
    $items.removeClass("current");
    if ($items.length === 0) {
      $("#turn-message").text("No combatants yet. Add someone to begin.");
      return;
    }
    var $current = $items.eq(turn % $items.length).addClass("current");
    $("#turn-message").text("It is " + $current.find(".init-name").text() + "'s turn.");
  }

  function sortInitiative() {
    var items = $("#initiative-list li").get();
    items.sort(function (a, b) {
      return Number($(b).attr("data-init")) - Number($(a).attr("data-init"));
    });
    $("#initiative-list").append(items);
    turn = 0;
    highlightTurn();
  }

  function rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  // Add a combatant, rolling a d20 if no initiative was typed
  $(document).off("click.addcombatant").on("click.addcombatant", "#add-combatant", function () {
    var name = $.trim($("#init-name").val());
    var value = parseInt($("#init-value").val(), 10);
    if (name === "") {
      return;
    }
    if (isNaN(value)) {
      value = rollD20();
    }
    var $li = $("<li></li>").attr("data-init", value);
    $li.append($('<span class="init-name"></span>').text(name));
    $li.append(" ");
    $li.append($('<span class="init-score"></span>').text(value));
    $li.append(" ");
    $li.append('<button class="remove-init" aria-label="Remove combatant">&#10005;</button>');
    $("#initiative-list").append($li);
    $("#init-name").val("");
    $("#init-value").val("");
    sortInitiative();
  });

  // Roll a new d20 for everyone
  $(document).off("click.rollinit").on("click.rollinit", "#roll-initiative", function () {
    $("#initiative-list li").each(function () {
      var value = rollD20();
      $(this).attr("data-init", value);
      $(this).find(".init-score").text(value);
    });
    sortInitiative();
  });

  // Move to the next turn
  $(document).off("click.nextturn").on("click.nextturn", "#next-turn", function () {
    turn++;
    highlightTurn();
  });

  // Remove a combatant
  $(document).off("click.removeinit").on("click.removeinit", ".remove-init", function () {
    $(this).closest("li").remove();
    highlightTurn();
  });

  if ($("#initiative-list").length) {
    highlightTurn();
  }
});