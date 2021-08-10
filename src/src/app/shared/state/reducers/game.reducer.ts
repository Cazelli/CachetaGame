import { Action, createReducer, on } from '@ngrx/store';
import { Card } from '../../models/cards.model';
import * as fromGameActions from '../actions/game.actions';

export interface State {
    buyStack: Card[],
    discartPile: Card[],
    playerRound: number,
    players: {
        order: number;
        cards: Card[];
    }[]
}


export const initialState: State = {
    buyStack: [],
    discartPile: [],
    playerRound: 0,
    players: [{order: 0, cards: []}, {order: 1, cards: []}, {order: 2, cards: []}, {order: 3, cards: []}]
}


const gameReducer = createReducer(
    initialState,

    on(fromGameActions.startGame, state => ({ ...state })),
    
    on(fromGameActions.distributeCards, (state, { buyStack }) => ({
        ...state, buyStack
    }))
)


export function reducer(state: State | undefined, action: Action) {
    return gameReducer(state, action);
}