// Angular
import { Component, Inject, OnInit } from '@angular/core';
// Material
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// States
import { SpeciesListData } from '../../species/_state';

@Component({
  selector: 'app-assimilation-menu',
  templateUrl: './assimilation-menu.component.html',
  styleUrls: ['./assimilation-menu.component.scss'],
})
export class AssimilationMenuComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: SpeciesListData) {}

  ngOnInit(): void {}
}
