import { Action, createReducer, on } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { Card } from '../../models/cards.model';
import { EnumGameStatus } from '../../models/game.model';
import { Player } from '../../models/player.model';
import { areCardsEqual } from '../../services/cards.service';
import * as fromGameActions from '../actions/game.actions';

export interface GameState {
  status: EnumGameStatus;
  playerRound?: number;
  buyStack: Card[];
  discardPile: Card[];
  players: Player[];
}

export const initialState: GameState = {
  status: EnumGameStatus.beforeGameStart,
  buyStack: [],
  discardPile: [],
  playerRound: undefined,
  players: [
    { index: 0, cards: new Array(10).fill(null) },
    { index: 1, cards: new Array(10).fill(null) },
    { index: 2, cards: new Array(10).fill(null) },
    { index: 3, cards: new Array(10).fill(null) },
  ],
};

const gameReducer = createReducer(
  initialState,

  on(fromGameActions.startGame, (state) => ({ ...initialState })),

  on(fromGameActions.createDeckStack, (state, { buyStack }) => ({
    ...state,
    status: EnumGameStatus.shuffledCards,
    buyStack,
  })),

  on(
    fromGameActions.distributeCardFromBuyStack,
    (state, { playerIndex }) => {

      //remove card from buy stack
      let buyStack = [...state.buyStack];
      const card = buyStack[buyStack.length - 1];
      buyStack = buyStack.slice(0, buyStack.length - 1)


      //place card in the last position
      let currentPlayer = getCopyOfPlayerFromState(playerIndex, state);
      const cardIndex = currentPlayer.cards.findIndex((c) => c == null);
      currentPlayer.cards[cardIndex] = card;

      return {
        ...state,
        buyStack,
        status: EnumGameStatus.distributingCards,
        players: getCopOfPayersReplacingPlayer(playerIndex, currentPlayer, state),
      };
    }
  ),

  on(
    fromGameActions.buyCardFromBuyStack,
    (state) => {

      if (state.playerRound == null)
        return { ...state };

      //remove card from buy stack
      let buyStack = [...state.buyStack];
      const card = buyStack[buyStack.length - 1];
      buyStack = buyStack.slice(0, buyStack.length - 1)

      //place card in the last position
      let currentPlayer = getCopyOfPlayerFromState(state.playerRound, state);
      const cardIndex = currentPlayer.cards.findIndex((c) => c == null);
      currentPlayer.cards[cardIndex] = card;

      return {
        ...state,
        buyStack,
        status: EnumGameStatus.playerboughtCard,
        players: getCopOfPayersReplacingPlayer(state.playerRound, currentPlayer, state),
      };
    }
  ),

  on(
    fromGameActions.buyCardFromDiscardPile,
    (state) => {

      if (state.playerRound == null)
        return { ...state };

      //remove card from buy stack
      let discardPile = [...state.discardPile];
      const card = discardPile[discardPile.length - 1];
      discardPile = discardPile.slice(0, discardPile.length - 1)

      //place card in the last position
      let currentPlayer = getCopyOfPlayerFromState(state.playerRound, state);
      const cardIndex = currentPlayer.cards.findIndex((c) => c == null);
      currentPlayer.cards[cardIndex] = card;

      return {
        ...state,
        discardPile,
        status: EnumGameStatus.playerboughtCard,
        players: getCopOfPayersReplacingPlayer(state.playerRound, currentPlayer, state),
      };
    }
  ),

  on(fromGameActions.finishedDistributingCards, (state) => ({
    ...state,
    status: EnumGameStatus.watingForPlayersToGetReady
  })),

  on(fromGameActions.playerReady, (state) => ({
    ...state,
    status: EnumGameStatus.newPlayerRound,
    playerRound: 0
  })),

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

      const cardIndex = currentPlayer.cards.findIndex((c, i) => areCardsEqual(c, card));

      currentPlayer.cards.splice(cardIndex, 1);

      let cards = new Array(10).fill(null)

      currentPlayer.cards.forEach((c, i) => cards[i] = c);

      currentPlayer.cards = cards;

      return {
        ...state,
        discardPile: [...state.discardPile, card],
        players: getCopOfPayersReplacingPlayer(playerIndex, currentPlayer, state),
      };
    }
  )

);


function getCopyOfPlayerFromState(playerIndex: number, state: GameState) {
  return {
    ...state.players[playerIndex],
    cards: [...state.players[playerIndex].cards],
  };
}

function getCopOfPayersReplacingPlayer(playerIndex: number, playerToReplace: Player, state: GameState) {
  return [
    ...state.players.slice(0, playerIndex),
    playerToReplace,
    ...state.players.slice(playerIndex + 1),
  ];
}

export function reducer(state: GameState | undefined, action: Action) {
  return gameReducer(state, action);
}
