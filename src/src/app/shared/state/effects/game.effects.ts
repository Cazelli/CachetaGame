import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { of } from "rxjs";
import { filter, map, switchMap, take, tap, timeout } from "rxjs/operators";
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
            tap(() => {

                this.gameState.select(s => s.game)
                    .pipe(take(1))
                    .subscribe(g => {


                        let currentCardIndex = g.buyStack.length - 1;
                        for (let cardIndex = 0; cardIndex < 9; cardIndex++) {
                            for (let playerIndex = 0; playerIndex < g.players.length; playerIndex++) {
                                setTimeout(() => {

                                    const cardToGive = g.buyStack[currentCardIndex];
                                    currentCardIndex--;
                                    this.gameState.dispatch(fromGameActions.givePlayerCardFromBuyStack({ playerIndex, card: cardToGive }))

                                }, cardIndex * 1000 + playerIndex * 250);
                            }
                        }

                    });
            })
        ), { dispatch: false });


    finishedDistributingCards$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.givePlayerCardFromBuyStack),
            tap(a =>
                this.
                    gameState.select(s => s.game.players)
                    .pipe(take(1))
                    .subscribe(p => {
                        const numberOfCardsDistributed = p.map(p => p.cards.filter(c => c != null).length).reduce((a, b) => a + b);
                        if (numberOfCardsDistributed == 36) {
                            this.gameState.dispatch(fromGameActions.finishedDistributingCards())
                        }
                    })

            )
        ), { dispatch: false });

}