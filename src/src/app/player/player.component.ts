import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, map, switchMap } from 'rxjs/operators';
import { CardsService } from '../shared/services/cards.service';
import { CachetaStore } from '../shared/state/store/root.store';
import * as fromGameActions from '../shared/state/actions/game.actions';
import { getOffsetElement } from '../shared/getOffsetElement';
import { Observable } from 'rxjs';
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
  indexPlayer?: number;

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

    if (this.indexPlayer != null) {
      this.player$ = this.store.select(s => s.game.players[Number(this.indexPlayer)]);
    }

    this.setupCardAnimations();
  }


  setupCardAnimations() {
    this.actions$.pipe(
      ofType(fromGameActions.givePlayerCardFromBuyStack),
      filter(action => action.playerIndex == this.indexPlayer),
      switchMap(action => this.store.select(s => s.game.players[action.playerIndex])),
      map(player => player.cards.findIndex(c => c == null) - 1), //get index of the last card that is null, the card before is the current card
      map(lastNullCard => lastNullCard < 0 ? 8 : lastNullCard) // calculate the index of the current card
    ).subscribe(cardIndex => {

      this.divCards.forEach((divCard, i) => {

        if (cardIndex == i) {

          //calculates the startposition of the current card
          const cardPosition = getOffsetElement(divCard.nativeElement);
          const startCardPositionX = this.buyStackPosition.left - cardPosition.left;
          const startCardPositionY = this.buyStackPosition.top - cardPosition.top;
          this.transformCardStartPositions[cardIndex] = `translateX(${startCardPositionX}px) translateY(${startCardPositionY}px)`;
        }

      });

      this.startCardAnimations[cardIndex] = 'startAnimation';
      this.playCardFlip();

    });
  }

  playCardFlip() {
    let audio = new Audio();
    if (this.indexPlayer == 0) {
      audio.volume = 0.5;
    } else if (this.indexPlayer == 2) {
      audio.volume = 0.1;
    } else {
      audio.volume = 0.3;
    }
    audio.src = `../../assets/sounds/card_flip1.wav`;
    audio.load();
    audio.play();
  }


}
