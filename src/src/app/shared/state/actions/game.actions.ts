import { createAction, props } from "@ngrx/store";
import { Card } from "../../models/cards.model";

export const startGame = createAction('[GAME] Start')

export const createDeckStack = createAction(
    '[GAME] Create deck stack', props<{ buyStack: Card[] }>())

export const givePlayerCardFromBuyStack = createAction(
    '[GAME] Give player card from buy stack', props<{ playerIndex: number; card: Card }>())