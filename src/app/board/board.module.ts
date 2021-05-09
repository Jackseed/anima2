// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Components
import { BoardViewComponent } from './board-view/board-view.component';
import { FooterComponent } from './footer/footer.component';
// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [BoardViewComponent, FooterComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class BoardModule {}
