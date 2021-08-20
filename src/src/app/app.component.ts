import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Card } from './shared/models/cards.model';
import { CardsService } from './shared/services/cards.service';
import { CachetaStore } from './shared/state/store/root.store';
import * as fromGameActions from './shared/state/actions/game.actions';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Actions, ofType } from '@ngrx/effects';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('reciveCardFronDeck', [
      state('startAnimation',
        style({ transform: 'translateX(0px) translateY(0px)' })
      ),
      transition('void => startAnimation', [animate('1s')])
    ]),
  ]
})
export class AppComponent implements OnInit {
  title = 'cacheta-game';

  @ViewChild('divBuyStack')
  divBuyStack: ElementRef = {} as ElementRef;

  @ViewChildren('divCard')
  divCards: QueryList<ElementRef> = {} as QueryList<ElementRef>;

  startCardAnimations: string[] = Array(9).fill('');

  transformCardStartPositions: string[] = Array(9).fill('');

  players$ = this.store.select(s => s.game.players);
  player0$ = this.store.select(s => s.game.players[0]);
  player1$ = this.store.select(s => s.game.players[1]);
  player2$ = this.store.select(s => s.game.players[2]);
  player3$ = this.store.select(s => s.game.players[3]);
  topCardBuyStack$ = this.store.select(s => s.game.buyStack[s.game.buyStack.length - 1]);

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>,
    private actions$: ActionsSubject
  ) { }

  ngOnInit() {


  }


  startGame() {

    this.actions$.pipe(
      ofType(fromGameActions.givePlayerCardFromBuyStack),
      filter(action => action.playerIndex == 0),
      switchMap(action => this.store.select(s => s.game.players[action.playerIndex])),
      map(player => player.cards.findIndex(c => c == null) - 1),
    ).subscribe(cardIndex => {

      this.divCards.forEach((divCard, i) => {

        if (cardIndex == i) {
          const buyStackPosition = this.getOffsetElement(this.divBuyStack.nativeElement);

          const cardPosition = this.getOffsetElement(divCard.nativeElement);

          const startCardPositionX = buyStackPosition.left - cardPosition.left;
          const startCardPositionY = buyStackPosition.top - cardPosition.top;

          this.transformCardStartPositions[cardIndex] = `translateX(${startCardPositionX}px) translateY(${startCardPositionY}px)`;
        }

      });

      this.startCardAnimations[cardIndex < 0 ? 8 : cardIndex] = 'startAnimation'

    });


    this.store.dispatch(fromGameActions.startGame());
  }



  getOffsetElement(el: any) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: _y, left: _x };
  }

  get buyStackPosition() {
    return this.getOffsetElement(this.divBuyStack.nativeElement);
  }

}
