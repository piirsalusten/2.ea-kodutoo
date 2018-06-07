//Globaalsed muutujad
let guessedWords = 0
let score = 0
let mistakes = 0
const MAXMISTAKES = 10
let playerName
let streak = 0
let localStorageString = "localStorages"
let localStorages = 1

/* ONE PAGE APPLICATION */
const MainApp = function () {
    if (MainApp.instance) {
        return MainApp.instance
    }
    MainApp.instance = this

    this.routes = MainApp.routes
    this.currentRoute = null

    this.init()
}

/* TYPER */
const TYPER = function () {
    if (TYPER.instance_) {
        return TYPER.instance_
    }
    TYPER.instance_ = this

    this.WIDTH = window.innerWidth
    this.HEIGHT = window.innerHeight
    this.canvas = null
    this.ctx = null

    this.words = []
    this.word = null
    this.wordMinLength = 5
    this.guessedWords = 0

    this.score = 0
    this.mistakes = 0
    this.streak = 0

    this.init()
}

window.TYPER = TYPER

MainApp.routes = {
    'home': {
        'render': function () {
            console.log('>>>> Home')
        }
    },
    'game': {
        'render': function () {
            console.log('>>>> App')
            document.getElementById("nameUndefined").innerHTML = ""
            document.getElementById("startGame")
                .addEventListener('click', startGame)
            document.getElementById("endGame")
                .addEventListener('click', endGame)
        }
    },
    'scores': {
        'render': function () {
            console.log('>>>> scores')
        }
    }
}

MainApp.prototype = {
    init: function () {
        console.log('Rakendus läks tööle')

        window.addEventListener('hashchange', this.routeChange.bind(this))

        if (!window.location.hash) {
            window.location.hash = 'home'
        } else {
            this.routeChange()
        }
    },

    routeChange: function (event) {
        this.currentRoute = location.hash.slice(1)
        if (this.routes[this.currentRoute]) {
            this.updateMenu()

            this.routes[this.currentRoute].render()
        } else {
            /// 404 - ei olnud
        }
    },

    updateMenu: function () {
        // http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
        document.querySelector('.active').className = document.querySelector('.active').className.replace('active', '')
        document.querySelector('.' + this.currentRoute).className += ' active'
    }

}// Main

TYPER.prototype = {
    init: function () {
        this.canvas = document.getElementsByTagName('canvas')[0]
        this.ctx = this.canvas.getContext('2d')

        this.canvas.style.width = this.WIDTH + 'px'
        this.canvas.style.height = this.HEIGHT + 'px'

        this.canvas.width = this.WIDTH * 2
        this.canvas.height = this.HEIGHT * 2

        this.loadWords()
    },

    //Toob failist sõnad
    loadWords: function () {
        const xmlhttp = new XMLHttpRequest()

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 0)) {
                const response = xmlhttp.responseText
                const wordsFromFile = response.split('\n')

                typer.words = structureArrayByWordLength(wordsFromFile)

                typer.start()
            }
        }

        xmlhttp.open('GET', './lemmad2013.txt', true)
        xmlhttp.send()
    },

    start: function () {
        this.generateWord()
        this.word.Draw()

        window.addEventListener('keypress', this.keyPressed.bind(this))
    },

    generateWord: function () {
        const generatedWordLength = this.wordMinLength + parseInt(this.guessedWords / 5)
        const randomIndex = (Math.random() * (this.words[generatedWordLength].length - 1)).toFixed()
        const wordFromArray = this.words[generatedWordLength][randomIndex]

        this.word = new Word(wordFromArray, this.canvas, this.ctx)
        score = this.score
        mistakes = this.mistakes
        guessedWords = this.guessedWords
        streak = this.streak
    },

    keyPressed: function (event) {
        const letter = String.fromCharCode(event.which)

        if (letter === this.word.left.charAt(0)) {
            this.streak += 1
            this.word.removeFirstLetter()
            if (this.streak < 10) {
                this.score += 5
            }
            if (this.streak > 10 && this.streak < 20) {
                this.score += 10
            }
            if (this.streak > 20 && this.streak < 50) {
                this.score += 25
            }
            if (this.streak > 500) {
                this.score += 100
            }
            console.log(this.score)


            if (this.word.left.length === 0) {
                this.guessedWords += 1

                this.generateWord()
            }

            this.word.Draw()
            this.word.Result()
        } else {
            this.streak = 0
            if (this.mistakes < 5) {
                this.mistakes += 1
                if (this.score = 0) {
                    this.score = 0
                }
                if (this.score > 0) {
                    this.score = this.score * 0.7
                }
            } else {
                this.word.Gameover()
                endGame()
            }
        }
    }
}

/* WORD */
const Word = function (word, canvas, ctx) {
    this.word = word
    this.left = this.word
    this.canvas = canvas
    this.ctx = ctx
}

Word.prototype = {
    Draw: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.ctx.textAlign = 'center'
        this.ctx.font = '140px Courier'
        this.ctx.fillText(this.left, this.canvas.width / 2, this.canvas.height / 2)
    },

    Result: function () {
        this.ctx.textAlign = 'left'
        this.ctx.font = '50px Courier'
        this.ctx.fillText("Guessed words: ", 30, 70)
        this.ctx.fillText(guessedWords, 450, 70)
        this.ctx.fillText("Score: ", 30, 105)
        this.ctx.fillText(score, 200, 105)
        this.ctx.fillText("mistakes: ", 30, 140)
        this.ctx.fillText(mistakes, 290, 140)
    },

    Gameover: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.textAlign = 'center'
        this.ctx.font = '280px courier'
        this.ctx.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 2)
    },

    removeFirstLetter: function () {
        this.left = this.left.slice(1)
    }
}

/* HELPERS */

// võtab sõna pikkuse
function structureArrayByWordLength(words) {
    let tempArray = []

    for (let i = 0; i < words.length; i++) {
        const wordLength = words[i].length
        if (tempArray[wordLength] === undefined) tempArray[wordLength] = []

        tempArray[wordLength].push(words[i])
    }

    return tempArray
}

function startGame() {
    if (playerName == undefined) {
        document.getElementById("nameUndefined").innerHTML = "Go to the first page and enter your name to play the game!"
    } else {
        //document.getElementById("nameUndefined").innerHTML = ""
        const typer = new TYPER()
        window.typer = typer
    }
}


//https://medium.com/codingthesmartway-com-blog/pure-javascript-building-a-real-world-application-from-scratch-5213591cfcd6
function endGame() {
    console.log("Game Over!")
    playerScore = score

    let result = {
        name: playerName,
        score: playerScore
    }

    /*if (localStorage.getItem(localStorageString) !== null){*

    }*/

    if (localStorage.getItem(localStorageString) !== undefined) {
        console.log("ei olnud null")
        localStorages = JSON.parse(localStorage.getItem(localStorageString))
        localStorages += 1
        localStorage.setItem(JSON.stringify(localStorages), JSON.stringify(result))
    }
    if (localStorage.getItem(localStorageString) === undefined) {
        console.log("oli null")
        localStorage.setItem(JSON.stringify(localStorageString), JSON.stringify(localStorages))
        localStorage.setItem(JSON.stringify(localStorages), JSON.stringify(result))
    }

    /*let emptyValueFound = true
    let storageNr = 1

    while (emptyValueFound === true){
      emptyValueFound = false
      let valueLookedFor = "result" + storageNr
      storageNr += 1
      if (localStorage.getItem(valueLookedFor) !== null){
        emptyValueFound = true
      }
      if (localStorage.getItem(valueLookedFor) === null){
        localStorage.setItem(JSON.stringify("result" + storageNr), JSON.stringify(result))
        emptyValueFound = false
      }
  }*/
}

function saveName() {
    playerName = document.getElementById('playerName').value
    console.log(playerName)
}

window.onload = function () {
    const mainapp = new MainApp()
    window.mainapp = mainapp

    document.getElementById("submit")
        .addEventListener('click', saveName)
}