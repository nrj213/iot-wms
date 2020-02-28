import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  constructor(private router: Router) {}

  username: string = "";
  password: string = "";

  ngOnInit() {}

  login() {
    if (this.username.length && this.password.length) {
      this.router.navigateByUrl("/wms");
    } else {
      alert("Enter username and password!");
    }
  }
}