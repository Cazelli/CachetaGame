import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LogEffects {
    constructor(private actions$: Actions) { }

    logActions$ = createEffect(() =>
        this.actions$.pipe(
            catchError(err => {
                console.log(err);
                return throwError(err);
            })
        ), { dispatch: false });
}

