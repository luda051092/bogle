

class BoggleGame {
    constructor(container, playTime) {

        this.$form = $(container).find(".form-guess");
        this.$word = $(container).find(".word");
        this.$seconds = $(container).find(".seconds");
        this.$score = $(container).find(".score");
        this.$words = $(container).find(".words");
        this.$message = $(container).find(".message");

        this.playTime = playTime;
        this.timeLeft = playTime;
        this.totalScore = 0;
        this.wordList = [];

        this.init();
    }

    init() {
      const timerInterval = setInterval(() => {
        this.timeLeft -= 1;
        this.$seconds.text(this.timeLeft);

        if (this.timeLeft <= 0) {
            //end game

            clearInterval(timerInterval);

            this.$form.find(":input").prop("disabled", true);

            this.endGame();
        }
      }, 1000);

      this.$word.on("invalid", function () {
        this.setCustomValidity("Please enter valid letters.");
      });

      this.$form.on("submit", async (e) => {
        e.preventDefault();

        await this.checkWord(this.$word.val().toLowerCase());

        this.$form.trigger("reset");

        this.showScore();
      });

      this.showScore();

    }

    async checkWord(w) {
      try {
        const response = await axios
        .get("/find", {
            params: { word: w },
        })
        .then((response) => {
          if (response.status === 200) {
            console.log(response.data);

            let result = response.data;

            if (result.result === "ok") {
              this.addWord(w);  
            } else if (result.result === "not-word") {
              this.showMessage("This is not a valid word. Please enter a valid word");  
            } else if (result.result === "not-on-board") {
              this.showMessage("This word is not on the board, please try again.");  
            }
          } 
        });
      } catch (e) {
        console.log(e);
      }
    }

    showScore() {
      this.$score.text(this.totalScore);
      this.$word.trigger("focus"); 
    }

    addWord(w) {
      if (!this.wordList.includes(w)) {
        this.wordList.push(w);
        this.$words.append(`<span>${w.toUpperCase()}</span>`);

        this.totalScore += w.length;
        this.showScore();
     } else{
       this.showMessage("The same word can only be used once.") 
     }  
    }

    async endGame() {
        try {
          this.showMessage("Time up. Game over.");
          const response = await axios
            .post("/end", { score: this.totalScore })
            .then((response) => {
              if (response.status === 200) {
                // console.log(response.data);
              }  
            });  
        } catch (e) {
          console.log(e);  
        }
    }

    showMessage(txt){
       this.$message.text(txt);  
       this.$message.shoe();

       setTimeout(()=>{
         this.hideMessage();
       } , 2000);
    }
    
    hideMessage(){
        this.$message.hide();
    }

}

const boggle = new BoggleGame($("#content") , 60);