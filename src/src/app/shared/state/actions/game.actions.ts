import { createAction, props } from "@ngrx/store";
import { Card } from "../../models/cards.model";

export const startGame = createAction('[GAME] Start')

export const createDeckStack = createAction(
    '[GAME] Create deck stack', props<{ buyStack: Card[] }>())

export const givePlayerCardFromBuyStack = createAction(
    '[GAME] Give player card from buy stack', props<{ playerIndex: number; card: Card }>())

export const finishedDistributingCards = createAction(
    '[GAME] Finished distribuding cards')

export const moveCardPositionInPlayerHand = createAction(
    '[GAME] Move card position in player hand ', props<{ playerIndex: number; lastIndex: number; nextIndex: number }>())

export const discardCard = createAction(
    '[GAME] Discard card', props<{ playerIndex: number, card: Card, top: number, left: number, cardOrientation: string }>()
)