// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Components
import { FormComponent } from './form/form.component';
import { HomepageComponent } from './homepage/homepage.component';

@NgModule({
  declarations: [HomepageComponent, FormComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class GamesModule {}
