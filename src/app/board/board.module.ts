// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
// Components
import { BoardViewComponent } from './board-view/board-view.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { AdaptationMenuComponent } from './abilities/adaptation-menu/adaptation-menu.component';
import { SettingsComponent } from './settings/settings.component';
import { ListComponent } from './species/list/list.component';
import { AssimilationMenuComponent } from './abilities/assimilation-menu/assimilation-menu.component';
import { ScoreComponent } from './score/score.component';
// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
// Libs
import { PinchZoomModule } from 'ngx-pinch-zoom';

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
export class BoardModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    // Registrating all board icons

    // VALIDATION BUTTONS
    this.matIconRegistry.addSvgIcon(
      'blank',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/blank-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'validate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/validate-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-button.svg'
      )
    );

    // HEADER BUTTONS
    this.matIconRegistry.addSvgIcon(
      'species-circle',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/species-circle.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'score-button',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/score-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'menu-button',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-button.svg'
      )
    );

    // SPECIES LIST
    this.matIconRegistry.addSvgIcon(
      'specie1',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie1.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie2',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie2.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie3',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie3.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie4',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie4.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'ability-1',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability1.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-2',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability2.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-3',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability3.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-4',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability4.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'ability-1-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability1-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-2-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability2-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-3-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability3-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-4-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability4-active.svg'
      )
    );

    /// ACTION BUTTONS
    this.matIconRegistry.addSvgIcon(
      'migrate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'migrate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'migrate-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation-active.svg'
      )
    );

    /// SPECIES
    this.matIconRegistry.addSvgIcon(
      'acceleration',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/acceleration.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'agility',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/agility.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'carnivore',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/carnivore.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'flying',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/flying.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'giantism',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/giantism.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hermaphrodite',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/hermaphrodite.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hounds',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/hounds.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'intimidate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/intimidate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'nest',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/nest.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'rallying',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/rallying.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'range',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/range.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'spontaneousGeneration',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/spontaneousGeneration.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'submersible',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/submersible.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'survival',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/survival.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'symbiosis',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/symbiosis.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'tunnel',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/tunnel.svg'
      )
    );

    /// NEUTRALS
    this.matIconRegistry.addSvgIcon(
      'forests',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/forests.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'islands',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/islands.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'mountains',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/mountains.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'plains',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/plains.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'rockies',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/rockies.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'swamps',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/swamps.svg'
      )
    );
  }
}
