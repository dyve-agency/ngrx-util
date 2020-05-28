import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppStateSlice, todosActions, todosSelector} from '../../reducers';

@Component({
  selector: 'app-load-data',
  template: `
    <div class="container">
      <div class="row mt4">
        <div class="col-md-12">
          <div class="content-wrapper" *ngIf="todos$ | async as todos">
            <div class="loader-wrapper" *ngIf="todos.loading">
              <div class="loader">
              </div>
            </div>
            <mat-card>
              <mat-card-actions>
                <button (click)="reload()"
                        mat-stroked-button>Reload
                </button>
              </mat-card-actions>
              <mat-card-content>
                <mat-selection-list>
                  <mat-list-option *ngFor="let todo of todos.results">
                    {{todo.title}}
                  </mat-list-option>
                </mat-selection-list>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
      `
      :host {
        padding-top: 24px;
        display: block;
      }
      
      .content-wrapper {
        position: relative;
        min-height: 300px;
        height: calc(100vh - 300px);
      }
      
      mat-card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      mat-card-content {
        overflow: auto;
        height: 100%;
      }

      .loader-wrapper {
        background-color: rgba(169, 169, 169, 0.1);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
      }
    `,
  ],
})
export class LoadDataComponent implements OnInit {

  readonly todos$ = this._store$.select(todosSelector);

  constructor(private readonly _store$: Store<AppStateSlice>) {
  }

  ngOnInit(): void {
    this._store$.dispatch(todosActions.load({params: undefined}));
  }

  reload() {
    this._store$.dispatch(todosActions.load({params: undefined}));
  }
}
