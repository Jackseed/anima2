import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  abilities = [
    {
      name: 'Intimidation',
      img: '/assets/vol.png',
      definition:
        'À la fin une colonisation, peut déplacer 1 pion adverse se trouvant sur sa case d’1 case.',
      isActive: false,
    },
    {
      name: 'Gigantisme',
      img: '/assets/vol.png',
      definition: 'yi',
      isActive: false,
    },
    {
      name: 'Vol',
      img: '/assets/vol.png',
      definition: 'yu',
      isActive: false,
    },
  ];
  constructor() {}

  ngOnInit(): void {}

  public activate(i: number) {
    for (let j = 0; j < 3; j++) {
      j === i
        ? (this.abilities[i].isActive = true)
        : (this.abilities[j].isActive = false);
    }
  }
}
