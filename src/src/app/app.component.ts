import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Card } from './shared/models/cards.model';
import { CardsService } from './shared/services/cards.service';
import { CachetaStore } from './shared/state/store/root.store';
import * as gameActions from './shared/state/actions/game.actions';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cacheta-game';

  players$ = this.store.select(s => s.game.players);
  buyStack$ = this.store.select(s => s.game.buyStack);

  constructor(
    public cardsService: CardsService,
    public store: Store<CachetaStore>
  ) { }

  ngOnInit() {
    
  }


  startGame(){
    this.store.dispatch(gameActions.startGame());
  }

}
