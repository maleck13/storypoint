import { Component, OnInit } from '@angular/core';
import { SessionService, Session, Pointer } from '../session.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: []
})
export class HomeComponent implements OnInit {

  private session: Session = new Session();
  public pointer: Pointer = new Pointer();

  constructor(private sessionService: SessionService, private router: Router) {

  }

  ngOnInit() {
    this.sessionService.disconnect();
  }

  startSession($event) {
    this.sessionService.id()
      .then((res) => {
        console.log(this.pointer);
        console.log(res);
        this.session.ID = res.id;
        return this.pointer.save();
      })
      .then(() => {
        this.router.navigateByUrl("/session/" + this.session.ID)

      })
      .catch(err => {
        console.log("error starting session ", err);
      })

    console.log("starting pointing session ", this.session)
  }

  handleMessageEvent(message: any) {

  }

}
