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
import { ActiveBarComponent } from './abilities/active-bar/active-bar.component';
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
    ActiveBarComponent,
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
    this.matIconRegistry.addSvgIcon(
      'question-mark',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/question-mark.svg'
      )
    );

    // SPECIES LIST
    this.matIconRegistry.addSvgIcon(
      'hex',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/species-hex.svg'
      )
    );
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
      'migration',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'migration-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'migration-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilation-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilation-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferation-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferation-active',
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
      'gluttony',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/gluttony.svg'
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
      'predator',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/species/predator.svg'
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

    /// ABILITIES
    this.matIconRegistry.addSvgIcon(
      'acceleration-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/acceleration.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'gluttony-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/gluttony.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'carnivore-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/carnivore.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'flying-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/flying.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'giantism-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/giantism.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hermaphrodite-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/hermaphrodite.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hounds-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/hounds.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'intimidate-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/intimidate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'nest-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/nest.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'rallying-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/rallying.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'range-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/range.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'spontaneousGeneration-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/spontaneousGeneration.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'predator-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/predator.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'survival-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/survival.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'symbiosis-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/symbiosis.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'tunnel-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/tunnel.svg'
      )
    );
  }
}
