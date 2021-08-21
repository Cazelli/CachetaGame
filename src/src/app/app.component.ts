import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Card } from './shared/models/cards.model';
import { CardsService } from './shared/services/cards.service';
import { CachetaStore } from './shared/state/store/root.store';
import * as fromGameActions from './shared/state/actions/game.actions';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { act, Actions, ofType } from '@ngrx/effects';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { getOffsetElement } from './shared/getOffsetElement';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('discardCardPlayer', [
      state('vertical',
        style({ transform: '{{ transformParam }}' }), { params: { transformParam: 'translateX(0px) translateY(0px)' } }
      ),
      state('horizontal',
        style({ transform: '{{ transformParam }}' }), { params: { transformParam: 'translateX(0px) translateY(0px) rotate(90deg)' } }
      ),
      transition('void => vertical', [animate('240ms')]),
      transition('void => horizontal', [animate('240ms')])
    ]),
  ]
})
export class AppComponent implements OnInit {
  title = 'cacheta-game';

  @ViewChild('divBuyStack')
  divBuyStack: ElementRef = {} as ElementRef;

  @ViewChild('divDiscardPile')
  divDiscardPile: ElementRef = {} as ElementRef;

  discardPile$ = this.store.select(s => s.game.discardPile);

  topCardBuyStack$ = this.store.select(s => s.game.buyStack[s.game.buyStack.length - 1]);

  stateDiscardCardAnimation: string[] = [];
  transformCardStartPosition: string[] = [];
  transformCardEndPosition: string[] = [];

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>,
    private actions$: ActionsSubject
  ) { }

  ngOnInit() {

    this.actions$.pipe(
      ofType(fromGameActions.startGame),
      tap(() => {
        this.stateDiscardCardAnimation = [];
        this.transformCardStartPosition = [];
        this.transformCardEndPosition = [];
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(fromGameActions.discardCard),
      tap(action => {

        const cardPosition = getOffsetElement(this.divDiscardPile.nativeElement);
        const startCardPositionX = action.left - cardPosition.left;
        const startCardPositionY = action.top - cardPosition.top;

        let endRotation = 0;
        if (action.cardOrientation == 'vertical') {
          endRotation = (Math.random() * 20) * (Math.random() < 0.5 ? -1 : 1);
        } else {
          endRotation = ((Math.random() * 20) * (Math.random() < 0.5 ? -1 : 1)) + 90;
        }

        const endX = (Math.random() * 10) * (Math.random() < 0.5 ? -1 : 1);
        const endY = (Math.random() * 10) * (Math.random() < 0.5 ? -1 : 1);

        this.transformCardEndPosition.push(`translateX(${endX}vh) translateY(${endY}vh) rotate(${endRotation}deg) `);
        this.transformCardStartPosition.push(`translateX(${startCardPositionX}px) translateY(${startCardPositionY}px)`);
        this.stateDiscardCardAnimation.push(action.cardOrientation);
      })
    ).subscribe();
  }


  startGame() {
    this.store.dispatch(fromGameActions.startGame());
  }

  get buyStackPosition() {
    return getOffsetElement(this.divBuyStack.nativeElement);
  }


  onClickBuyStack() {
    this.topCardBuyStack$.subscribe((card) =>{
      this.store.dispatch(fromGameActions.givePlayerCardFromBuyStack({ playerIndex: 0, card }));
    });
  }

}
