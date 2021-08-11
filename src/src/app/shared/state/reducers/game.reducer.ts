import { Action, createReducer, on } from '@ngrx/store';
import { Card } from '../../models/cards.model';
import * as fromGameActions from '../actions/game.actions';

export interface State {
    buyStack: Card[],
    discartPile: Card[],
    playerRound: number,
    players: {
        cards: Card[];
    }[]
}


export const initialState: State = {
    buyStack: [],
    discartPile: [],
    playerRound: 0,
    players: [{ cards: [] }, { cards: [] }, { cards: [] }, { cards: [] }]
}


const gameReducer = createReducer(
    initialState,

    on(fromGameActions.startGame, state => ({ ...state })),

    on(fromGameActions.createDeckStack, (state, { buyStack }) => ({
        ...state, buyStack
    })),

    on(fromGameActions.givePlayerCardFromBuyStack, (state, { playerIndex, card }) => {

        let deck = [...state.buyStack];

        const index = deck.findIndex(d => d.number === card.number && d.suit === card.suit);

        deck.splice(index, 1);

        let cardsPlayer = { ...state.players[playerIndex], cards: [...state.players[playerIndex].cards] };
        
        cardsPlayer.cards.push(card);
       
        return {
            ...state,
            buyStack: deck,
            players: [
                ...state.players.slice(0, playerIndex),
                cardsPlayer,
                ...state.players.slice(playerIndex + 1),
            ]
        };
    }),
)


export function reducer(state: State | undefined, action: Action) {
    return gameReducer(state, action);
}