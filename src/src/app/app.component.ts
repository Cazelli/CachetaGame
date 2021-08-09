import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Card } from './shared/models/cards.model';
import { CardsService } from './shared/services/cards.service';
import { CachetaStore } from './shared/state/store/root.store';
import * as gameActions from './shared/state/actions/game.actions';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cacheta-game';

  deck?: Card[];

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>
  ) { }

  ngOnInit() {
    this.deck = this.cardsService.getDeck();
  }

  startGame(){
    this.store.dispatch(gameActions.startGame());
  }

}
