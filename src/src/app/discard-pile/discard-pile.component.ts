import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { take, tap } from 'rxjs/operators';
import { areCardsEqual, CardsService } from '../shared/services/cards.service';
import { CachetaStore } from '../shared/state/store/root.store';
import * as fromGameActions from '../shared/state/actions/game.actions';
import { getOffsetElement } from '../shared/getOffsetElement';
import { Card } from '../shared/models/cards.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-discard-pile',
  templateUrl: './discard-pile.component.html',
  styleUrls: ['./discard-pile.component.css'],
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
export class DiscardPileComponent implements OnInit, AfterViewInit {

  @ViewChild('divDiscardPile')
  divDiscardPile: ElementRef = {} as ElementRef;

  @Output()
  changedDiscardPilePosition = new Subject<{ top: number, left: number }>();

  discardPile$ = this.store.select(s => s.game.discardPile);

  stateDiscardCardAnimation: string[] = [];
  transformCardStartPosition: string[] = [];
  transformCardEndPosition: string[] = [];

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>,
    private actions$: ActionsSubject
  ) { }

  ngOnInit(): void {

  

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

    this.actions$.pipe(
      ofType(fromGameActions.buyCardFromDiscardPile),
      tap(() => {
        this.stateDiscardCardAnimation.splice(this.stateDiscardCardAnimation.length - 1, 1);
        this.transformCardStartPosition.splice(this.transformCardStartPosition.length - 1, 1);
        this.transformCardEndPosition.splice(this.transformCardEndPosition.length - 1, 1);
      })
    ).subscribe();

  }

  ngAfterViewInit(){
    this.onChangedDiscardPilePosition();
  }


  onClickDiscardPile(cardCliked: Card) {

    this.store.select(s => s.game).pipe(take(1)).subscribe(g => {

      const lastCard = g.discardPile[g.discardPile.length - 1];

      //if the card clicked is the top one
      if (areCardsEqual(cardCliked, lastCard)) {

        if (this.cardsService.canPlayerBuyCard(g)) {
          this.store.dispatch(fromGameActions.buyCardFromDiscardPile({ playerIndex: 0 }));
        }

      }

    });

  }

  @HostListener('window:resize')
  onChangedDiscardPilePosition() {
    this.changedDiscardPilePosition.next(getOffsetElement(this.divDiscardPile.nativeElement));
  }

}
