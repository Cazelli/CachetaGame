import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";

import { of } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { CardsService } from "../../services/cards.service";
import * as fromGameActions from '../actions/game.actions';

@Injectable({ providedIn: 'root' })
export class GameEffects {

    constructor(
        private actions$: Actions,
        private cardService: CardsService
    ) { }


    startGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromGameActions.startGame),
            switchMap(() => {
                var cards = this.cardService.getDeck();

                

                return of(fromGameActions.distributeCards({ buyStack: cards }));
            })
        )
    );

}