import { Component, OnInit } from '@angular/core';
import { UserService } from '../_state/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private service: UserService) {}

  ngOnInit(): void {}
  public async logIn() {
    await this.service.anonymousLogin();
  }
}
