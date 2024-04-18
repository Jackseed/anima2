import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
})
export class AuthModule {}
