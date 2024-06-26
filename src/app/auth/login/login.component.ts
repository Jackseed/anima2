import { Component, OnInit } from '@angular/core';
import { UserService } from '../_state/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private service: UserService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  public async logIn() {
    if (this.loginForm.valid) {
      const name = this.loginForm.get('name').value;
      await this.service.anonymousLogin(name);
    }
  }
}
