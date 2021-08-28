import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { take, tap } from 'rxjs/operators';
import { getOffsetElement } from '../shared/getOffsetElement';
import { CardsService } from '../shared/services/cards.service';
import { CachetaStore } from '../shared/state/store/root.store';
import * as fromGameActions from '../shared/state/actions/game.actions';

import { Subject } from 'rxjs';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'app-buy-stack',
  templateUrl: './buy-stack.component.html',
  styleUrls: ['./buy-stack.component.css']
})
export class BuyStackComponent implements OnInit {

  @ViewChild('divBuyStack')
  divBuyStack: ElementRef = {} as ElementRef;

  @Output()
  changedBuyStackPosition = new Subject<{ top: number, left: number }>();

  topCardBuyStack$ = this.store.select(s => s.game.buyStack[s.game.buyStack.length - 1]);

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>,
    private actions$: ActionsSubject
  ) { }

  ngOnInit(): void {
    this.actions$.pipe(
      ofType(fromGameActions.createDeckStack),
      tap(() => {
        this.onChangedBuyStackPosition();
      })
    ).subscribe();
  }


  @HostListener('window:resize')
  onChangedBuyStackPosition() {
    this.changedBuyStackPosition.next(getOffsetElement(this.divBuyStack.nativeElement));
  }

  onClickBuyStack() {
    this.store.select(s => s.game)
      .pipe(take(1))
      .subscribe(g => {

        if (this.cardsService.canPlayerBuyCard(g)) {
          this.store.dispatch(fromGameActions.buyCardFromBuyStack({ playerIndex: 0 }));
        }

      });
  }

}
