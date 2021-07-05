const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatched: 'CardsMatched',
  CardsMatchFailed: 'CardsMatchFailed',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
    <p>${number}</p>
    <img src="${symbol}" >
    <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  transformNumber (number) {
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
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    // Array.from 可利用 Array().keys()生成的「類似陣列」來建立陣列。
    // map() 迭代陣列
    // join('') 把陣列合併成一個大字串
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    card.classList.add('back')
    card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
    
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Secore: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event =>
        event.target.classList.remove('wrong'), {
          once: true
        })
    })
  },

  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for(let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照遊戲狀態，做不同行為。
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealCards.push(card)

        if (model.isRevealedCardsMatched()){
          // 配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealCards)
          model.revealCards = []
          if (model.score === 10) { // 遊戲結束
            this.currentState = GAME_STATE.GameFinished // 狀態
            view.showGameFinished() // 呼叫結束介面
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000) // 停頓1秒
        }
        break
    }
  },

  resetCards() {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const model = {
  revealCards: [],

  isRevealedCardsMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0,
}

controller.generateCards()

// Node List (array-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    
    controller.dispatchCardAction(card)
  })
})