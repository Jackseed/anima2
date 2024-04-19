import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { User, UserQuery } from '../_state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
})
export class UserViewComponent implements OnInit {
  public activeUser$: Observable<User> = this.userQuery.selectActive();
  constructor(
    private userQuery: UserQuery,
    public dialogRef: MatDialogRef<UserViewComponent>
  ) {}

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }
}
