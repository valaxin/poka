export default class Poker {
  // [0] setup
  constructor() {
    this.auto = { shuffle: true, evaluation: true }
    this.drawn = 0
    this.last = []
    this.score = 0
    this.hands = []
    this.current = []
    this.deck = false
    this.baseAPI = `https://deckofcardsapi.com/api/deck`
    this.controls = {
      newDeck: document.body.querySelector('button.controls-fresh'),
      drawCard: document.body.querySelector('button.controls-draw'),
      queryButton: document.body.querySelector('button.controls-query')
    }
  }

  /**
   * [1] return the new deck id from api
   * @returns {Object} new deck context
   */
  async fresh() {
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

      // [1.4] if api says things are bad, exit.
      if (!body.success) {
        throw new Error(`API Error`)
      }

      // [1.5] assign to parent via context
      this.deck = body
      this.drawn = 0

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
   * @param Number amount of cards you wish to draw, int [0 - 52]
   * @returns
   */
  async draw(amount) {
    try {
      // [2.1] do we deck?
      if (!this.deck || this.last.remaining < 5) {
        await this.fresh()
        // throw new Error('No Deck')
      }

      // [2.2] not not a number and is out of range (0-52)
      if ((!isNaN(amount) && amount > 52) || amount < 0) {
        throw new Error(`Excuse me? Draw ${amount} cards? Are you mad?!`)
      }

      // [2.3] no amount? no problem!
      !amount ? (amount = 5) : amount

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
      if (this.last.length > 0) {
        console.log('removing previous')
      }
      this.last = body

      // ...
      console.log(`Poker.draw(${amount})`, body)

      return body
    } catch (error) {
      return error
    }
  }

  /**
   *
   * @param {*} cards array
   * @returns
   */
  // [3] check for best hand
  async evaluate(cards) {
    try {
      // [3.1] establish local hand and count objects
      const rankCount = {}
      const suitCount = {}

      // [3.2] normalizing facecards
      const facecards = { JACK: 11, QUEEN: 12, KING: 13, ACE: 14 }

      // [3.3] iterate over cards
      // normalizing facecards and count the goods
      // value ? value or 0 plus 1
      for (let card of cards) {
        for (let [s, n] of Object.entries(facecards)) {
          if (s == card.value) {
            card.value = n
          }
        }
        rankCount[card.value] = (rankCount[card.value] || 0) + 1
        suitCount[card.suit] = (suitCount[card.suit] || 0) + 1
      }

      // [3.3] counts is a sorted array, allowing easy pair notation
      const counts = Object.values(rankCount).sort((a, b) => b - a) // sorted descending
      
      // [3.4] ranks, convert to Number before sorting.
      const uniqueRanks = Object.keys(rankCount).map(Number).sort((a, b) => a - b)
      const flush = Object.keys(suitCount).length === 1 ? 1 : 0

      // [3.5] steve bool - for ya' truths
      const checks = {
        flush,
        straight: uniqueRanks.length === 5 ? (uniqueRanks[4] - uniqueRanks[0] === 4 ? 1 : 0) : 0,
        royalflush: flush && JSON.stringify(uniqueRanks) === JSON.stringify([10, 11, 12, 13, 14]),
        three: counts[0] === 3 && counts[1] < 2 ? 1 : 0,
        four: counts[0] === 4 ? 1 : 0,
        fullhouse: counts[0] === 3 && counts[1] === 2 ? 1 : 0,
        twopair: counts[0] === 2 && counts[1] === 2 ? 1 : 0,
        pair: counts[0] === 2 ? 1 : 0,
      }

      for (let [handName, handValue] of Object.entries(checks)) {

        if (handValue === 1) {
          console.log(handName)
        }

      }

      // [3.6] done
      return checks
    } catch (error) {
      console.log(error)
    }
  }

  // [4] print to screen
  async print(cards, hands, selector) {
    try {
      // [4.1]
      parent = document.querySelector(selector)
      let cardContainer = document.createElement('div')
      cardContainer.classList.add('card-container')

      // [4.2] loop over each creating element along the way.
      for (let [idx, card] of Object.entries(cards)) {
        cardContainer.innerHTML += `<img src="${card.image}" alt="${card.value} of ${card.suit}">`
      }

      for (let [name, result] of Object.entries(hands)) {
        
        if (result === 1) {
          console.log(name)
        }

      }

      parent.insertBefore(cardContainer, parent.children[1])
    } catch (error) {
      console.error(error)
    }
  }

  async hand(hands) {
    for (let [key, value] of Object.entries(hands)) {
      console.log(key, value)
    }
  }
}
