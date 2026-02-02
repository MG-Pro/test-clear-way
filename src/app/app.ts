import { TuiRoot, TuiTitle } from '@taiga-ui/core';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiHeader, TuiTitle],
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class App implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Не делаем список документов и сразу переходим на документ 1
    this.router.navigate(['/1']);
  }
}
