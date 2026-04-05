import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './store/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('clinical_his_frontend');
  private readonly authStore = inject(AuthStore);

  ngOnInit() {
    this.authStore.checkAuth();
  }
}

