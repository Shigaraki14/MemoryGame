(function(){
  var Memory = {
    init: function(cards){
      this.$game = $(".game");
      this.$modal = $(".modal");
      this.$overlay = $(".modal-overlay");
      this.$restartButton = $("button.restart"); // This is the 'Play Again?' button inside the modal
      this.$modalTitle = $("#modal-title");

      // New elements for the message feature
      this.$yesNoContainer = $("#yes-no-container");
      this.$yesButton = $("#yes-button");
      this.$noButton = $("#no-button");
      this.$secretCodeContainer = $("#secret-code-container");
      this.$secretCodeInput = $("#secret-code-input");
      this.$submitCodeButton = $("#submit-code-button");
      this.$secretCodeError = $("#secret-code-error");
      this.$finalBirthdayModal = $("#final-birthday-modal");
      this.$closeBirthdayModalButton = $("#close-birthday-modal");
      this.$closeMainModalButton = $("#close-main-modal");
      this.$startGameButton = $("#start-game-button"); // The initial start button
      this.$playAgainOuterButton = $("#play-again-button"); // The new 'Play Again' button outside the modal


      this.cardsArray = $.merge(cards, cards); // 9 cards * 2 = 18
      this.gameStartedOnce = false; // Flag to track if the game has been launched at least once
      this.binding();
      this.initialSetup();
    },

    initialSetup: function() {
        this.$game.addClass('game-hidden'); // Hide the game initially
        this.$startGameButton.show(); // Show the initial start button
        this.$playAgainOuterButton.hide(); // Hide the outer play again button
    },

    startGame: function() {
        this.$startGameButton.hide(); // Hide the start button
        this.$playAgainOuterButton.hide(); // Hide the outer play again button (if visible)
        this.$game.removeClass('game-hidden'); // Ensure game is visible by removing the class
        this.$game.css({ 'display': 'grid', 'opacity': 1 }); // Explicitly set display and opacity

        // Set flag to true after the first launch
        this.gameStartedOnce = true;

        // Create a fresh copy of the original cards and shuffle for a new game
        // We use a deep copy here to ensure the original 'cards' array is not modified
        this.cardsArray = $.merge([], [
          { name: "card_1", img: "./ProjectDirectory/resources/card_1.png", id: 1 },
          { name: "card_2", img: "./ProjectDirectory/resources/card_2.png", id: 2 },
          { name: "card_3", img: "./ProjectDirectory/resources/card_3.png", id: 3 },
          { name: "card_4", img: "./ProjectDirectory/resources/card_4.png", id: 4 },
          { name: "card_5", img: "./ProjectDirectory/resources/card_5.png", id: 5 },
          { name: "card_6", img: "./ProjectDirectory/resources/card_6.png", id: 6 },
          { name: "card_7", img: "./ProjectDirectory/resources/card_7.png", id: 7 },
          { name: "card_8", img: "./ProjectDirectory/resources/card_8.png", id: 8 },
          { name: "card_9", img: "./ProjectDirectory/resources/card_9.png", id: 9 }
        ]);
        this.cardsArray = $.merge(this.cardsArray, this.cardsArray); // Duplicate for pairs
        this.shuffleCards(this.cardsArray); // Shuffle this fresh copy
        this.setup(); // Build HTML and reset game variables
    },

    shuffleCards: function(cardsArray){
      this.$cards = $(this.shuffle(cardsArray));
    },

    setup: function(){
      this.html = this.buildHTML();
      this.$game.html(this.html);
      this.$memoryCards = $(".card");
      this.paused = false;
      this.guess = null;
      this.$memoryCards.off("click").on("click", this.cardClicked);
    },

    binding: function(){
      this.$startGameButton.on("click", $.proxy(this.startGame, this));
      this.$playAgainOuterButton.on("click", $.proxy(this.startGame, this)); // Bind outer play again button to startGame
      this.$restartButton.on("click", $.proxy(this.reset, this)); // This is the 'Play Again?' button inside the modal
      this.$yesButton.on("click", $.proxy(this.handleYesNo, this, true));
      this.$noButton.on("click", $.proxy(this.handleYesNo, this, false));
      this.$submitCodeButton.on("click", $.proxy(this.checkSecretCode, this));
      this.$closeBirthdayModalButton.on("click", $.proxy(this.closeFinalBirthdayModalAndReset, this));
      this.$closeMainModalButton.on("click", $.proxy(this.reset, this));
    },

    cardClicked: function(){
      var _ = Memory;
      var $card = $(this);
      if(!_.paused && !$card.find(".inside").hasClass("matched") && !$card.find(".inside").hasClass("picked")){
        $card.find(".inside").addClass("picked");
        if(!_.guess){
          _.guess = $(this).attr("data-id");
        } else if(_.guess == $(this).attr("data-id") && !$(this).hasClass("picked")){
          $(".picked").addClass("matched");
          _.guess = null;
        } else {
          _.guess = null;
          _.paused = true;
          setTimeout(function(){
            $(".picked").removeClass("picked");
            Memory.paused = false;
          }, 600);
        }
        if($(".matched").length == $(".card").length){
          _.win();
        }
      }
    },

    win: function(){
      this.paused = true;
      setTimeout(function(){
        Memory.showModal();
        Memory.$modalTitle.text("You Rock!");
        Memory.$restartButton.hide(); // Hide the 'Play Again?' button inside the modal initially
        Memory.$yesNoContainer.show(); // Show the message prompt and Yes/No buttons
        Memory.$secretCodeContainer.hide();
        Memory.$secretCodeInput.val('');
        Memory.$secretCodeError.hide();
        Memory.$finalBirthdayModal.hide();
        Memory.$game.fadeOut(); // Fade out the game board
      }, 1000);
    },

    showModal: function(){
      this.$overlay.show();
      this.$modal.fadeIn("slow");
    },

    hideModal: function(){
      this.$overlay.hide();
      this.$modal.hide();
      this.$finalBirthdayModal.hide();
    },

    closeFinalBirthdayModalAndReset: function() {
        this.hideModal();
        this.reset();
    },

    reset: function(){
      this.hideModal();
      this.$game.addClass('game-hidden'); // Hide game when resetting
      this.$game.empty(); // Clear existing cards HTML to ensure a fresh start
      this.paused = false; // Reset game state
      this.guess = null; // Reset guess

      // Show the appropriate button based on if a game has been played before
      if (this.gameStartedOnce) {
          this.$startGameButton.hide();
          this.$playAgainOuterButton.show();
      } else {
          this.$startGameButton.show();
          this.$playAgainOuterButton.hide();
      }
    },

    handleYesNo: function(wantsMessage) {
        if (wantsMessage) {
            this.$yesNoContainer.hide();
            this.$secretCodeContainer.show();
            this.$secretCodeInput.val('');
            this.$secretCodeError.hide();
        } else {
            this.reset(); // If 'No', reset the game
        }
    },

    checkSecretCode: function() {
        const secretCode = this.$secretCodeInput.val().trim();
        const correctCode = "1234";

        if (secretCode === correctCode) {
            this.$secretCodeContainer.hide();
            this.$modal.hide();
            this.$overlay.hide();
            this.$finalBirthdayModal.show();
        } else {
            this.$secretCodeError.text("Incorrect code. Please try again.").show();
        }
    },

    shuffle: function(array){
      var counter = array.length, temp, index;
      while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
      }
      return array;
    },

    buildHTML: function(){
      var frag = '';
      this.$cards.each(function(k, v){
        frag += '<div class="card" data-id="'+ v.id +'"><div class="inside">\
        <div class="front"></div>\
        <div class="back"><img src="'+ v.img +'" alt="'+ v.name +'" /></div></div>\
        </div>';
      });
      return frag;
    }
  };

  var cards = [
    { name: "card_1", img: "./ProjectDirectory/resources/card_1.png", id: 1 },
    { name: "card_2", img: "./ProjectDirectory/resources/card_2.png", id: 2 },
    { name: "card_3", img: "./ProjectDirectory/resources/card_3.png", id: 3 },
    { name: "card_4", img: "./ProjectDirectory/resources/card_4.png", id: 4 },
    { name: "card_5", img: "./ProjectDirectory/resources/card_5.png", id: 5 },
    { name: "card_6", img: "./ProjectDirectory/resources/card_6.png", id: 6 },
    { name: "card_7", img: "./ProjectDirectory/resources/card_7.png", id: 7 },
    { name: "card_8", img: "./ProjectDirectory/resources/card_8.png", id: 8 },
    { name: "card_9", img: "./ProjectDirectory/resources/card_9.png", id: 9 }
  ];

  Memory.init(cards);
})();
