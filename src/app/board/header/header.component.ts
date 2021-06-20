import { Component, OnInit } from '@angular/core';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'strategic-view',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/strategic-view.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'menu-button',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-button.svg'
      )
    );
  }

  ngOnInit(): void {}
}
