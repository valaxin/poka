import Poker from './Poker.js'

// fetch deck

// DECK URL
// https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=<NUM_OF_DECKS>

// DRAW URL
// https://deckofcardsapi.com/api/deck/<DECK_ID>/draw/?count=<NUM_OF_CARDS>

// CARD BACK
// https://deckofcardsapi.com/static/img/back.png

// [*] create base poker object
const poker = new Poker()

//  INTERACTION INNVOCATION 

// ...
// [1] set draw button as disabled until we have deck
poker.controls.drawCard.disabled = true

// ...
// [2] define event handler for obtaining a new deck
poker.controls.newDeck.addEventListener('click', async (event) => {
  try {
    // [2.1] shiny new deck pls
    const deck = await poker.fresh()

    // [2.2] new button content changed and interaction disabled
    event.target.disabled = true
    event.target.innerText = `[${deck.deck_id}] ${deck.remaining} Cards Remaining`

    // [2.3] enable draw card button
    poker.controls.drawCard.disabled = false
  } catch (error) {
    // [2.4] 'log' and return
    console.error(`newDeck:click()`, event, error)
    return error
  }
})

// ...
// [3] handle card draw from card draw button
poker.controls.drawCard.addEventListener('click', async (event) => {
  try {

    // [3.1] draw cards and update new button.
    let cards = await poker.draw() // defaults to five
    
    // [3.2] update the new card button with remaing.
    poker.controls.newDeck.innerText = `[${cards.deck_id}] ${cards.remaining} Cards Remaining`
    
    // [todo... maybe?]
    if (!poker.auto.evaluation) {}

    // [3.3] whatcha got there buddy.
    let hands = await poker.evaluate(cards.cards)
    
    console.log(hands)

    // [3.4] 
    await poker.print(cards.cards, hands, '#app')
    
  } catch (error) {
    // [3.*] ya'know... errors.
    console.error(`drawCard:click()`, event, error)
    return error
  }
})

// [4] dev tools
poker.controls.queryButton.addEventListener('click', async (event) => {
  console.log(`poker()`, poker)
})