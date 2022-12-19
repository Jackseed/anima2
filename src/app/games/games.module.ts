// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';

// Components
import { FormComponent } from './form/form.component';
import { HomepageComponent } from './homepage/homepage.component';

@NgModule({
  declarations: [HomepageComponent, FormComponent],
  imports: [CommonModule, FlexLayoutModule, MatIconModule],
})
export class GamesModule {}
