const GAME_STATUS = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",

}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


const view = {

  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards-table')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(parseInt(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerText = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`

  },
  renderTriedTimes(tried) {
    document.querySelector('.tried').textContent = `You have tried: ${tried} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      }, {
        once: true
      })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <h3>You made it!</h3>
    <p>(After trying ${model.triedTimes} times 🤣 🎉)</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}



const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}



const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}




const controller = {
  currentState: GAME_STATUS.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATUS.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATUS.SecondCardAwaits
        break
      case GAME_STATUS.SecondCardAwaits:
        view.renderTriedTimes(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATUS.CardsMatched
          setTimeout(() => {
            view.pairCards(...model.revealedCards)
            this.resetCards()
          }, 300)
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATUS.GameFinished
            view.showGameFinished()
            return
          }
        } else {
          //配對失敗
          this.currentState = GAME_STATUS.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(() => {
            view.flipCards(...model.revealedCards)
            this.resetCards()
          }, 1000)
        }
        break
    }
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    model.revealedCards = []
    controller.currentState = GAME_STATUS.FirstCardAwaits
  }
}




////////////////////////

controller.generateCards()


document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
    // console.log(card.dataset.index)
  })
})


