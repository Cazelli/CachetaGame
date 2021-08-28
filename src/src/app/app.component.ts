import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CachetaStore } from './shared/state/store/root.store';
import * as fromGameActions from './shared/state/actions/game.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent implements OnInit {
  title = 'cacheta-game';

  buyStackPosition = { top: 0, left: 0 };

  constructor(
    public store: Store<CachetaStore>,
  ) { }

  ngOnInit() {

  }
  
  startGame() {
    this.store.dispatch(fromGameActions.startGame());
  }

  onChangedBuyStackPosition(position: any){
    this.buyStackPosition = position;
  }

}
