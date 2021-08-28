import { createAction, props } from "@ngrx/store";
import { Card } from "../../models/cards.model";

export const startGame = createAction('[GAME] Start')

export const createDeckStack = createAction(
    '[GAME] Create deck stack', props<{ buyStack: Card[] }>())

export const distributeCardFromBuyStack = createAction(
    '[GAME] Distribute card from buy stack', props<{ playerIndex: number }>())

export const finishedDistributingCards = createAction(
    '[GAME] Finished distribuding cards')

export const playerReady = createAction(
    '[GAME] Player ready')

export const moveCardPositionInPlayerHand = createAction(
    '[GAME] Move card position in player hand ', props<{ playerIndex: number; lastIndex: number; nextIndex: number }>())

export const discardCard = createAction(
    '[GAME] Discard card', props<{ playerIndex: number, card: Card, top: number, left: number, cardOrientation: string }>()
)

export const buyCardFromBuyStack = createAction(
    '[GAME] Buy card from buy stack', props<{ playerIndex: number }>())

export const buyCardFromDiscardPile = createAction(
    '[GAME] Buy card from discard pile', props<{ playerIndex: number }>())

export const startPlayerRound = createAction(
    '[GAME] Started player round', props<{ playerIndex: number }>())