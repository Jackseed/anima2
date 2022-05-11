import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from './homepage/homepage.component';
// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [HomepageComponent],
  imports: [CommonModule, FlexLayoutModule],
})
export class GamesModule {}
