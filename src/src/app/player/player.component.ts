import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { concatLatestFrom, ofType } from '@ngrx/effects';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { delay, filter, map, mergeMap, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { CardsService } from '../shared/services/cards.service';
import { CachetaStore } from '../shared/state/store/root.store';
import * as fromGameActions from '../shared/state/actions/game.actions';
import { getOffsetElement } from '../shared/getOffsetElement';
import { Observable, pipe } from 'rxjs';
import { Card } from '../shared/models/cards.model';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  animations: [
    trigger('reciveCardFronDeck', [
      state('startAnimation',
        style({ transform: 'translateX(0px) translateY(0px)' })
      ),
      transition('void => startAnimation', [animate('240ms')])
    ]),
  ]
})
export class PlayerComponent implements OnInit {

  @Input()
  buyStackPosition = { top: 0, left: 0 }

  @Input()
  playerIndex?: number;

  @ViewChildren('divCard')
  divCards: QueryList<ElementRef> = {} as QueryList<ElementRef>;

  player$?: Observable<{ index: number; cards: Card[] }>;

  startCardAnimations: string[] = Array(9).fill('');
  transformCardStartPositions: string[] = Array(9).fill('');

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>,
    private actions$: ActionsSubject
  ) { }

  ngOnInit(): void {

    if (this.playerIndex != null) {
      this.player$ = this.store.select(s => s.game.players[Number(this.playerIndex)]);
    }

    this.setupCardAnimations();
  }


  onDropMovingCard(event: any) {
    this.store.dispatch(fromGameActions.moveCardPositionInPlayerHand(
      {
        playerIndex: this.playerIndex ?? -1,
        lastIndex: event.previousIndex,
        nextIndex: event.currentIndex
      })
    )
  }

  setupCardAnimations() {
    this.actions$.pipe(
      ofType(fromGameActions.givePlayerCardFromBuyStack),
      filter(action => action.playerIndex == this.playerIndex),
      concatLatestFrom(action => this.store.select(s => s.game.players[action.playerIndex])),
      map(([action, player]) => player.cards.findIndex(c => c == null) - 1), //get index of the last card that is null, the card before is the current card
      map(lastNullCard => lastNullCard < 0 ? 8 : lastNullCard), // calculate the index of the current card      
      tap((cardIndex: number) => {

        const divCard = this.divCards.find((divCard, i) => cardIndex == i);

        //calculates the startposition of the current card
        const cardPosition = getOffsetElement(divCard?.nativeElement);
        const startCardPositionX = this.buyStackPosition.left - cardPosition.left;
        const startCardPositionY = this.buyStackPosition.top - cardPosition.top;
        this.transformCardStartPositions[cardIndex] = `translateX(${startCardPositionX}px) translateY(${startCardPositionY}px)`;

        this.startCardAnimations[cardIndex] = 'startAnimation';
        this.playCardFlip();
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(fromGameActions.finishedDistributingCards),
      delay(0),
      tap(() => {
        this.startCardAnimations = Array(9).fill('');
        this.transformCardStartPositions = Array(9).fill('');
      })
    ).subscribe();

  }

  playCardFlip() {
    let audio = new Audio();
    if (this.playerIndex == 0) {
      audio.volume = 0.5;
    } else if (this.playerIndex == 2) {
      audio.volume = 0.1;
    } else {
      audio.volume = 0.3;
    }
    audio.src = `../../assets/sounds/card_flip1.wav`;
    audio.load();
    audio.play();
  }


}
