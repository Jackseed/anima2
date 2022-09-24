// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// Components
import { BoardViewComponent } from './board-view/board-view.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { AdaptationMenuComponent } from './abilities/adaptation-menu/adaptation-menu.component';
import { SettingsComponent } from './settings/settings.component';
import { ListComponent } from './species/list/list.component';
// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
// Libs
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { AssimilationMenuComponent } from './abilities/assimilation-menu/assimilation-menu.component';
import { ScoreComponent } from './score/score.component';

@NgModule({
  declarations: [
    BoardViewComponent,
    FooterComponent,
    HeaderComponent,
    AdaptationMenuComponent,
    SettingsComponent,
    ListComponent,
    AssimilationMenuComponent,
    ScoreComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    PinchZoomModule,
  ],
})
export class BoardModule {}
