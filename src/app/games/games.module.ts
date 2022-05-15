import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from './homepage/homepage.component';
// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
// Angular Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [HomepageComponent],
  imports: [CommonModule, FlexLayoutModule, MatIconModule],
})
export class GamesModule {}
