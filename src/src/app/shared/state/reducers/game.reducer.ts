import { Action, createReducer, on } from '@ngrx/store';
import * as gameActions from '../actions/game.actions';

export interface State {

}


export const initialState: State = {

}


const gameReducer = createReducer(
    initialState,
    on(gameActions.startGame, state => ({
        ...state
    }))
)


export function reducer(state: State | undefined, action: Action){
    return gameReducer(state, action);
}