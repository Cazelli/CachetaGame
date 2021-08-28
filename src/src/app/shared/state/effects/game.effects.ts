import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { delay, filter, switchMap, tap, timeout, } from "rxjs/operators";
import { CardsService } from "../../services/cards.service";
import * as fromGameActions from '../actions/game.actions';
import { GameState } from "../reducers/game.reducer";
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


    nextRound$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.discardCard),
            switchMap((a) => {
                let playerIndex = a.playerIndex + 1;
                if (playerIndex == 4)
                    playerIndex = 0;

                return of(fromGameActions.startPlayerRound({ playerIndex }));
            })
        )
    );

    botBuyCard$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.startPlayerRound),
            filter(a => a.playerIndex >= 1 && a.playerIndex <= 3),
            delay(1000),
            concatLatestFrom(a => this.gameState as Observable<CachetaStore>),
            tap(([a, g]) => {
                var playerIndex = g.game.playerRound ?? 0;

                if (g.game.discardPile.length > 0 && Math.random() > 0.5) {
                    this.gameState.dispatch(fromGameActions.buyCardFromDiscardPile({ playerIndex }));
                }
                else {
                    this.gameState.dispatch(fromGameActions.buyCardFromBuyStack({ playerIndex }));
                }

            })
        )
        , { dispatch: false });



}