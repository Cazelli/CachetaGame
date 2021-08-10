import { createAction, props } from "@ngrx/store";
import { Card } from "../../models/cards.model";

export const startGame = createAction('[GAME] Start')

export const distributeCards = createAction(
    '[GAME] Distribute cards', props<{ buyStack: Card[] }>())
