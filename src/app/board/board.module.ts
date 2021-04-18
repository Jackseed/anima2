// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Components
import { BoardViewComponent } from './board-view/board-view.component';
// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [BoardViewComponent],
  imports: [CommonModule, FlexLayoutModule, MatSnackBarModule],
})
export class BoardModule {}
