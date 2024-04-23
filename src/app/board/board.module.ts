// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Pinch Zoom
import { PinchZoomModule } from 'ngx-pinch-zoom';

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
import { TextOverlayComponent } from './text-overlay/text-overlay.component';

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
    TextOverlayComponent,
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

    // HOURGLASS
    this.matIconRegistry.addSvgIcon(
      'hourglass',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/hourglass.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hourglass-clean',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/hourglass-clean.svg'
      )
    );

    // VALIDATION BUTTONS
    this.matIconRegistry.addSvgIcon(
      'validate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/validate-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'validate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/validate-disable-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'close-blur',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-blur-button.svg'
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
      'action',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/action.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'menu-button',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/menu-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'question-mark',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/question-mark.svg'
      )
    );

    // VICTORY
    this.matIconRegistry.addSvgIcon(
      'anima-blur',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/others/anima-blur.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'anima-empty',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/others/anima-empty.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'star',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/others/star.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'baby',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/others/baby.svg'
      )
    );

    // SPECIES LIST
    this.matIconRegistry.addSvgIcon(
      'hex',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/species-hex.svg'
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
      'gluttony-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/gluttony.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'gluttony-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/gluttony-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'carnivore-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/carnivore.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'carnivore-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/carnivore-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'flying-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/flying.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'flying-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/flying-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'giantism-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/giantism.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'giantism-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/giantism-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hermaphrodite-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/hermaphrodite.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hermaphrodite-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/hermaphrodite-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hounds-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/hounds.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'hounds-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/hounds-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'intimidate-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/intimidate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'intimidate-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/intimidate-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'nest-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/nest.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'nest-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/nest-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'rallying-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/rallying.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'rallying-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/rallying-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'range-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/range.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'range-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/range-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'spontaneousGeneration-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/spontaneousGeneration.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'spontaneousGeneration-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/spontaneousGeneration-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'predator-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/predator.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'predator-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/predator-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'survival-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/survival.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'survival-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/survival-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'symbiosis-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/symbiosis.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'symbiosis-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/symbiosis-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'tunnel-ability',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/tunnel.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'tunnel-ability-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/abilities/tunnel-active.svg'
      )
    );
  }
}
