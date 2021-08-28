import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { of } from "rxjs";
import { delay, filter, map, switchMap, take, tap, timeout } from "rxjs/operators";
import { Card } from "../../models/cards.model";
import { CardsService } from "../../services/cards.service";
import * as fromGameActions from '../actions/game.actions';
import { CachetaStore } from "../store/root.store";

@Injectable({ providedIn: 'root' })
export class GameEffects {

    constructor(
        private actions$: Actions,
        private gameState: Store<CachetaStore>,
        private cardService: CardsService,
    ) { }


    createDeckStack$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.startGame),
            switchMap(() => {
                const cards = this.cardService.getDeck();
                return of(fromGameActions.createDeckStack({ buyStack: cards }));
            })
        )
    );

    distributeCards$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.createDeckStack),
            delay(1000), //delay so the first animations does not bug on mobile
            concatLatestFrom(action => this.gameState.select(s => s.game)),
            tap(([action, gameData]) => {

                for (let cardIndex = 0; cardIndex < 9; cardIndex++) {
                    for (let playerIndex = 0; playerIndex < gameData.players.length; playerIndex++) {
                        setTimeout(() => {

                            this.gameState.dispatch(fromGameActions.distributeCardFromBuyStack({ playerIndex }))

                        }, cardIndex * 1000 + playerIndex * 250);
                    }
                }

            })
        ), { dispatch: false });


    finishedDistributingCards$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.distributeCardFromBuyStack),
            concatLatestFrom(action => this.gameState.select(s => s.game)),
            tap(([action, gameData]) => {
                const numberOfCardsDistributed = gameData.players.map(p => p.cards.filter(c => c != null).length).reduce((a, b) => a + b);
                if (numberOfCardsDistributed == 36) {
                    this.gameState.dispatch(fromGameActions.finishedDistributingCards())
                }
            })
        ), { dispatch: false });

}