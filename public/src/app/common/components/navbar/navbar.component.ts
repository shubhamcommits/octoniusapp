import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private _auth: AuthService, private router: Router) { }

  ngOnInit() {
  }
  onSignOut() {
    localStorage.removeItem('token');
    this.router.navigate(['']);
  }

}
