import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<FormComponent>) {}

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }
}
