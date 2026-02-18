export default class Poker {
  /**
   * [0] setup
   */
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
      queryButton: document.body.querySelector('button.controls-query'),
    }
    // the lower in the array the better it is.
    this.ranking = ["royalflush","straightflush","fourofakind","fullhouse","flush","straight","threeofakind","twopair","pair","highcard"];

    this.test = {
      royalflush: `https://prog2700.onrender.com/pokerhandtest/royalflush`,
      straightflush: `https://prog2700.onrender.com/pokerhandtest/straightflush`,
      four: `https://prog2700.onrender.com/pokerhandtest/fourofakind`,
      fullhouse: `https://prog2700.onrender.com/pokerhandtest/fullhouse`,
      flush: `https://prog2700.onrender.com/pokerhandtest/flush`, 
      straight: `https://prog2700.onrender.com/pokerhandtest/straight`, 
      three: `https://prog2700.onrender.com/pokerhandtest/threeofakind`,
      twopair: `https://prog2700.onrender.com/pokerhandtest/twopair`,
      pair: `https://prog2700.onrender.com/pokerhandtest/onepair`,
      highcard: `https://prog2700.onrender.com/pokerhandtest/highcard`,
      random: `https://prog2700.onrender.com/pokerhandtest/random`
    }
  }

  /**
   * [1] return the new deck id from api
   * @returns {*} new deck context
   */
  async fresh() {
    try {
      // [1.1] obtain new deck info from endpoint
      let address = `${this.baseAPI}/new/shuffle?count=1?jokers_enabled=false`
      const response = await fetch(address, {
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
   * @param {*} amount of cards you wish to draw, int [0 - 52]
   * @returns {*} current deck draw context
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
      // `${this.baseAPI}/${this.deck.deck_id}/draw?count=${amount}`

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
      
      return body
    } catch (error) {
      return error
    }
  }
  /** */

  /**
   *
   * [3] check for possible hands
   * @param {*} cards array
   * @returns {*} boolean notation of possible hands { hand_name: 1 | 0 }
   */
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

      // [3.4] counts is a sorted array, allowing easy pair notation
      const counts = Object.values(rankCount).sort((a, b) => b - a) // sorted descending

      // [3.5] ranks, convert o Number before sorting.
      const uniqueRanks = Object.keys(rankCount)
        .map(Number)
        .sort((a, b) => a - b)
      const flush = Object.keys(suitCount).length === 1 ? 1 : 0

      // [3.6] steve bool - for ya' truths
      const possibles = {
        flush,
        straight: uniqueRanks.length === 5 ? (uniqueRanks[4] - uniqueRanks[0] === 4 ? 1 : 0) : 0,
        royalflush: flush && JSON.stringify(uniqueRanks) === JSON.stringify([10, 11, 12, 13, 14]) ? 1 : 0,
        three: counts[0] === 3 && counts[1] < 2 ? 1 : 0,
        four: counts[0] === 4 ? 1 : 0,
        fullhouse: counts[0] === 3 && counts[1] === 2 ? 1 : 0,
        twopair: counts[0] === 2 && counts[1] === 2 ? 1 : 0,
        pair: counts[0] === 2 ? 1 : 0
      }

      // [3.7] id and sort based on ranking position in array
      const pool = []
      for (let [handName, bool] of Object.entries(possibles)) {
        if (bool === 1) {
          console.log(handName)
          for (let [rank, rankName] of Object.entries(this.ranking)) {
            if (handName == rankName) {
              pool.push(rank)
            }
          }
        }
        if (pool.length === 0) {
          pool.push(this.ranking.length - 1)
        }
      }
      pool.sort((a,b) => a - b)

      console.log('pool is', pool)

      // [3.*] done
      return this.ranking[pool[0]]
    } catch (error) {
      console.error('poker.evaluate()', error)
    }
  }

  /**
   * [4] print to screen
   * @param {*} cards api card context
   * @param {*} hands winning hands
   * @param {*} selector dom entry
   */
  async print(cards, hand, selector) {

    console.log(`your winning hand is ${hand}`)

    try {
      // [4.1]
      parent = document.querySelector(selector)
      let cardContainer = document.createElement('div')
      cardContainer.classList.add('card-container')

      // [4.2] loop over each creating element along the way.
      for (let [idx, card] of Object.entries(cards)) {
        cardContainer.innerHTML += `<img src="${card.image}" alt="${card.value} of ${card.suit}">`
      }

      cardContainer.innerHTML += `<div class="winning-hand">${hand}</div>`
      
      // [4.3] place into DOM
      parent.insertBefore(cardContainer, parent.children[1])
    } catch (error) {
      console.error(error)
    }
  }
}
