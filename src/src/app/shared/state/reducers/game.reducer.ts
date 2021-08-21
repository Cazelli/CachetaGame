import { Action, createReducer, on } from '@ngrx/store';
import { Card } from '../../models/cards.model';
import { Player } from '../../models/player.model';
import { cardsAreEqual } from '../../services/cards.service';
import * as fromGameActions from '../actions/game.actions';

export interface State {
  buyStack: Card[];
  discardPile: Card[];
  playerRound: number;
  players: Player[];
}

export const initialState: State = {
  buyStack: [],
  discardPile: [],
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
      

      //remove card drom buy stack
      let buyStack = [...state.buyStack];
      const index = buyStack.findIndex((d) => cardsAreEqual(d, card));
      buyStack.splice(index, 1);

      //place card in the last position
      let currentPlayer = getCopyOfPlayerFromState(playerIndex, state);
      const cardIndex = currentPlayer.cards.findIndex((c) => c == null);
      currentPlayer.cards[cardIndex] = card;

      return {
        ...state,
        buyStack,
        players: getCopOfPayersReplacingPlayer(playerIndex, currentPlayer, state),
      };
    }
  ),

  on(
    fromGameActions.moveCardPositionInPlayerHand,
    (state, { playerIndex, lastIndex, nextIndex }) => {

      let currentPlayer = getCopyOfPlayerFromState(playerIndex, state);

      currentPlayer.cards.splice(
        nextIndex,
        0,
        currentPlayer.cards.splice(lastIndex, 1)[0]
      );

      return {
        ...state,
        players: getCopOfPayersReplacingPlayer(playerIndex, currentPlayer, state),
      };
    }
  ),

  on(
    fromGameActions.discardCard,
    (state, { playerIndex, card, top, left }) => {

      const currentPlayer = getCopyOfPlayerFromState(playerIndex, state);

      const cardIndex = currentPlayer.cards.findIndex((c, i) => cardsAreEqual(c, card));

      currentPlayer.cards.splice(cardIndex, 1);

      return {
        ...state,
        discardPile: [...state.discardPile, card],
        players: getCopOfPayersReplacingPlayer(playerIndex, currentPlayer, state),
      };
    }
  )

);

function getCopyOfPlayerFromState(playerIndex: number, state: State) {
  return {
    ...state.players[playerIndex],
    cards: [...state.players[playerIndex].cards],
  };
}

function getCopOfPayersReplacingPlayer(playerIndex: number, playerToReplace: Player, state: State) {
  return [
    ...state.players.slice(0, playerIndex),
    playerToReplace,
    ...state.players.slice(playerIndex + 1),
  ];
}

export function reducer(state: State | undefined, action: Action) {
  return gameReducer(state, action);
}
