import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from 'src/environments/environment';

/* ngrx*/
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import * as gameState from '../app/shared/state/reducers/game.reducer';
import { LogEffects } from './shared/state/effects/log.effects';
import { GameEffects } from './shared/state/effects/game.effects';
import { PlayerComponent } from './player/player.component';
import { DiscardPileComponent } from './discard-pile/discard-pile.component';
import { BuyStackComponent } from './buy-stack/buy-stack.component';


@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    DiscardPileComponent,
    BuyStackComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DragDropModule,

    /* ngrx */
    StoreModule.forRoot({ game: gameState.reducer }),
    EffectsModule.forRoot([LogEffects, GameEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 100, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
