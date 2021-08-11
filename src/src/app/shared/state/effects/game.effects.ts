import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { of } from "rxjs";
import { switchMap, take, tap, timeout } from "rxjs/operators";
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
                var cards = this.cardService.getDeck();
                return of(fromGameActions.createDeckStack({ buyStack: cards }));
            })
        )
    );

    givePlayerCards$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.createDeckStack),
            tap(() => {

                this.gameState.select(s => s.game)
                    .pipe(take(1))
                    .subscribe(g => {

                        var cardsGiven: Card[] = [];

                        for (let cardIndex = 0; cardIndex < 9; cardIndex++) {
                            for (let playerIndex = 0; playerIndex < g.players.length; playerIndex++) {

                                let cardAlreadyGiven = false;
                                let cardToGive: Card;
                                do {

                                    cardToGive = g.buyStack[Math.floor(Math.random() * g.buyStack.length)]

                                    if (cardsGiven.findIndex(c => c.number === cardToGive.number && c.suit === cardToGive.suit)) {
                                        cardAlreadyGiven = true;
                                    }

                                } while (!cardAlreadyGiven);

                                cardsGiven.push(cardToGive);

                                setTimeout(() => {
                                    this.gameState.dispatch(fromGameActions.givePlayerCardFromBuyStack({ playerIndex, card: cardToGive }))
                                }, cardIndex * 1000 + playerIndex * 250);
                            }
                        }

                    });
            })
        ), { dispatch: false });

}