export default class Poker {
  
  // [0] setup
  constructor() {
    this.auto = { shuffle: true, evaluation: true }
    this.drawn = 0
    this.last = []
    this.score = 0
    this.hands = []
    this.deck = false
    this.baseAPI = `https://deckofcardsapi.com/api/deck`
    this.controls = {
      newDeck: document.body.querySelector('button.controls-fresh'),
      drawCard: document.body.querySelector('button.controls-draw'),
    }
  }

  /**
   * // [1] return the new deck id from api
   * @returns {Object} new deck context
   */
  async fresh () {
    try {

      // [1.1] obtain new deck info from endpoint
      const response = await fetch(`${this.baseAPI}/new/shuffle?count=1?jokers_enabled=false`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      // [1.2] error on bad response
      if (!response.ok) {
        throw new Error(`Network Error`)
      }

      // [1.3] new deck as object
      const body = await response.json()

      // [1.4] if api says things are bad
      if (!body.success) {
        throw new Error(`API Error`)
      }

      // [1.5] assign to parent via context
      this.deck = body
      this.hands = 0

      // [1.6] return the response body
      return body
    } catch (error) {
      
      // [1.7] 'log' then return errors
      console.error(`poker.fresh()`, error)
      return error
    }
  }
  /**/

  /**
   * [2] return a new hand of random cards from api
   * @param {Number} amount of cards you wish to draw, int [0 - 52]
   * @returns
   */
  async draw (amount) {
    try {
      
      // [2.1] do we deck?
      if (!this.deck) {
        throw new Error('No Deck')
      }

      // [2.2] not not a number and is out of range (0-52)
      if ((!isNaN(amount) && amount > 52) || amount < 0) {
        throw new Error(`Excuse me? Draw ${amount} cards? Are you mad?!`)
      }

      // [2.3] no amount? no problem!
      !amount ? amount = 5 : amount

      // [2.4] obtain hopfully object with "amount" of cards
      const response = await fetch(`${this.baseAPI}/${this.deck.deck_id}/draw?count=${amount}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      // [2.5] no good, throw
      if (!response.ok) {
        throw new Error('Network Error')
      }

      // [2.6] expects json
      const body = await response.json()
      
      // [2.7] ...
      if (!body.success) {
        throw new Error('API Error')
      }

      // [2.8] increment drawn counter set last and return
      this.drawn++
      if (this.last.length > 0) { console.log('removing previous') }
      this.last = body

      // ...
      console.log(`Poker.draw(${amount})`, body)

      return body
    } catch (error) {
      []
      return error
    }
  }

  // [3] check for best hand
  async evaluate (cards) {
    // let hand = []
    
    // const rankCount = {}
    // const suitCount = {}
    
    // for (let card of cards) {
    //   rankCount[card.value] = (rankCount[card.value] || 0) + 1
    //   suitCount[card.suit] = (suitCount[card.suit] || 0) + 1
    // }

    // const counts = Object.values(rankCount).sort((a,b) => b-a); // sorted descending
    // const uniqueRanks = Object.keys(rankCount).map(Number).sort((a,b)=>a-b);

    // // console.log({suitCount, rankCount, counts, uniqueRanks})

    // return hand
  }

  // // [4] print to screen
  // async print (cards, selector) {
  //   let sel = document.querySelector(selector)
  //   let cardContainer = document.createElement('div')
  //   cardContainer.classList.add('card-container')

  //   // loop over each creating element along the way.
  //   for (let [idx, card] of Object.entries(cards)) {
  //     cardContainer.innerHTML += `<img src="${card.image}" alt="${card.value} of ${card.suit}">`
  //   }

  //   sel.append(cardContainer)
  // }
}
