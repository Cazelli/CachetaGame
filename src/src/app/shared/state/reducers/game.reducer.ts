import { Action, createReducer, on } from '@ngrx/store';
import { Card } from '../../models/cards.model';
import { Player } from '../../models/player.model';
import { cardsAreEqual } from '../../services/cards.service';
import * as fromGameActions from '../actions/game.actions';

export interface State {
  buyStack: Card[];
  discartPile: Card[];
  playerRound: number;
  players: Player[];
}

export const initialState: State = {
  buyStack: [],
  discartPile: [],
  playerRound: 0,
  players: [
    { index: 0, cards: new Array(9).fill(null) },
    { index: 1, cards: new Array(9).fill(null) },
    { index: 2, cards: new Array(9).fill(null) },
    { index: 3, cards: new Array(9).fill(null) },
  ],
};

const gameReducer = createReducer(
  initialState,

  on(fromGameActions.startGame, (state) => ({ ...initialState })),

  on(fromGameActions.createDeckStack, (state, { buyStack }) => ({
    ...state,
    buyStack,
  })),

  on(
    fromGameActions.givePlayerCardFromBuyStack,
    (state, { playerIndex, card }) => {
      let deck = [...state.buyStack];

      const index = deck.findIndex((d) => cardsAreEqual(d, card));

      deck.splice(index, 1);

      let cardsPlayer = {
        ...state.players[playerIndex],
        cards: [...state.players[playerIndex].cards],
      };

      const cardIndex = cardsPlayer.cards.findIndex((c) => c == null);

      cardsPlayer.cards[cardIndex] = card;

      return {
        ...state,
        buyStack: deck,
        players: [
          ...state.players.slice(0, playerIndex),
          cardsPlayer,
          ...state.players.slice(playerIndex + 1),
        ],
      };
    }
  ),

  on(
    fromGameActions.moveCardPositionInPlayerHand,
    (state, { playerIndex, lastIndex, nextIndex }) => {
      let currentPlayer = {
        ...state.players[playerIndex],
        cards: [...state.players[playerIndex].cards],
      };

      let card = currentPlayer.cards[lastIndex];

      currentPlayer.cards.splice(
        nextIndex,
        0,
        currentPlayer.cards.splice(lastIndex, 1)[0]
      );

      return {
        ...state,
        players: [
          ...state.players.slice(0, playerIndex),
          currentPlayer,
          ...state.players.slice(playerIndex + 1),
        ],
      };
    }
  )
);

export function reducer(state: State | undefined, action: Action) {
  return gameReducer(state, action);
}
