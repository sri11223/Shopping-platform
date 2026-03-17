import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <app-header />
    <main class="main-wrapper">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast />
  `,
  styles: [`
    .main-wrapper {
      min-height: calc(100vh - 72px);
    }
  `]
})
export class AppComponent {
  title = 'LuxeStore';
}
