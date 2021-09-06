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
import { Player } from '../shared/models/player.model';
import { EnumGameStatus } from '../shared/models/game.model';

enum EnumCardOrientation {
  vertical = 'vertical',
  horizontal = 'horizontal',
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  animations: [
    trigger('reciveCardFromDeck', [
      state('vertical',
        style({ transform: 'translateX(0px) translateY(0px)' })
      ),
      state('horizontal',
        style({ transform: 'translateX(0px) translateY(0px) rotate(90deg)' })
      ),
      transition('void => vertical', [animate('240ms')]),
      transition('void => horizontal', [animate('240ms')])
    ]),
  ]
})
export class PlayerComponent implements OnInit {

  @Input()
  buyStackPosition = { top: 0, left: 0 }

  @Input()
  discardPilePosition = { top: 0, left: 0 }

  @Input()
  playerIndex?: number;

  @ViewChildren('divCard')
  divCards: QueryList<ElementRef> = {} as QueryList<ElementRef>;

  playerRound$: Observable<number | undefined> = this.store.select(s => s.game.playerRound);
  gameStatus$: Observable<EnumGameStatus> = this.store.select(s => s.game.status);
  player$: Observable<Player> = this.store.select(s => s.game.players[Number(this.playerIndex)]);

  startCardAnimations: string[] = Array(10).fill('');
  transformCardStartPositions: string[] = Array(10).fill('');

  cardsOrientation?: EnumCardOrientation | null = null;

  dragAndDropCardEnabled = false;

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>,
    private actions$: ActionsSubject
  ) { }

  ngOnInit(): void {

    this.player$.subscribe(p => {
      this.cardsOrientation = p.index == 0 || p.index == 2 ? EnumCardOrientation.vertical : EnumCardOrientation.horizontal;
    });

    this.setupDistributeCardFromStackAnimation();
    this.setupDragAndDropCards();
    this.setupBuyCardFromDiscardPileAnimation();

    /*
    * Temporary bot discard card functionality after buying it
    */
    this.actions$.pipe(
      ofType(fromGameActions.buyCardFromBuyStack, fromGameActions.buyCardFromDiscardPile),
      filter(a => a.playerIndex >= 1 && a.playerIndex <= 3 && a.playerIndex == this.playerIndex),
      delay(1000),
      concatLatestFrom(a => this.player$ as Observable<Player>)
    ).subscribe(([a, p]) => {
        this.onClickCard(9, p.cards[9]);
    })

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

  /*
  * Calculates the start positions of each card to animate the movement from the buy stack to player hand
  */
  setupDistributeCardFromStackAnimation() {

    this.actions$.pipe(
      ofType(fromGameActions.distributeCardFromBuyStack, fromGameActions.buyCardFromBuyStack),
      filter(action => action.playerIndex == this.playerIndex),
      concatLatestFrom(action => this.player$ as Observable<Player>),
      map(([action, player]) => player.cards.filter(c => c != null).length - 1),
      tap((cardIndex: number) => {

        //calculates the startposition of the current card
        const cardPosition = this.getOffsetCard(cardIndex);
        const startCardPositionX = this.buyStackPosition.left - cardPosition.left;
        const startCardPositionY = this.buyStackPosition.top - cardPosition.top;
        this.transformCardStartPositions[cardIndex] = `translateX(${startCardPositionX}px) translateY(${startCardPositionY}px)`;
        this.startCardAnimations[cardIndex] = this.cardsOrientation?.toString() ?? '';
        this.playCardFlip();
      })
    ).subscribe();
  }

  setupBuyCardFromDiscardPileAnimation(){
    this.actions$.pipe(
      ofType(fromGameActions.buyCardFromDiscardPile),
      filter(action => action.playerIndex == this.playerIndex),
      concatLatestFrom(action => this.player$ as Observable<Player>),
      tap(([action, player]) =>{

        //calculates the startposition of the current card
        const cardPosition = this.getOffsetCard(9);
        const startCardPositionX = this.discardPilePosition.left - cardPosition.left;
        const startCardPositionY = this.discardPilePosition.top - cardPosition.top;
        this.transformCardStartPositions[9] = `translateX(${startCardPositionX}px) translateY(${startCardPositionY}px)`;
        this.startCardAnimations[9] = this.cardsOrientation?.toString() ?? '';
        this.playCardFlip();

      })).subscribe();
  }

  /*
  * When finished distributing cards from buy stack enables drag and drop
  */
  setupDragAndDropCards() {
    this.actions$.pipe(
      ofType(fromGameActions.finishedDistributingCards),
      delay(0),
      concatLatestFrom(action => this.player$ as Observable<Player>),
      tap(([action, player]) => {
        this.dragAndDropCardEnabled = player.index == 0;
        this.transformCardStartPositions = this.cardsOrientation == EnumCardOrientation.horizontal ? Array(10).fill('rotate(90deg)') : Array(10).fill('');
      })
    ).subscribe();
  }

  getOffsetCard(cardIndex: number) {
    const divCard = this.divCards.find((divCard, i) => cardIndex == i);

    //calculates the startposition of the current card
    const cardPosition = getOffsetElement(divCard?.nativeElement);

    return cardPosition;
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

  public get getEnumCardOrientation() {
    return EnumCardOrientation;
  }

  public get getEnumGameStatus() {
    return EnumGameStatus;
  }

  onClickCard(cardIndex: number, card: Card) {

    this.store.select(g => g.game)
      .pipe(
        take(1),
        filter(g =>
          g.status == EnumGameStatus.playerboughtCard
          &&
          this.playerIndex == g.playerRound)
      )
      .subscribe(() => {

        const cardOffset = this.getOffsetCard(cardIndex);

        this.player$.pipe(take(1)).subscribe((player) => {
          this.store.dispatch(
            fromGameActions.discardCard({
              card,
              playerIndex: player.index,
              cardOrientation: this.cardsOrientation?.toString() ?? '',
              ...cardOffset
            })
          )
        });

      });



  }

  onClickReady() {
    this.store.dispatch(fromGameActions.playerReady());
  }

  finishedAnimationCard(i: number) {
    this.transformCardStartPositions[i] = '';
    this.startCardAnimations[i] = '';
  }


}
