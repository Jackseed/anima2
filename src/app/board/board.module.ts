import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardViewComponent } from './board-view/board-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [BoardViewComponent],
  imports: [CommonModule, FlexLayoutModule],
})
export class BoardModule {}
