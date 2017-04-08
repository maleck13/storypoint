import { Component, OnInit } from '@angular/core';
import { SessionService, Pointer, Session } from '../session.service';
import { ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs/Subject';
@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
  providers: []
})
export class SessionComponent implements OnInit {

  constructor(private sessionService: SessionService, private activeRoute: ActivatedRoute) { }

  private sessionID: string
  private pointer: Pointer = new Pointer();
  private session: Session = new Session();
  private socket: Subject<any>;
  private average: number = 0

  ngOnInit() {
    this.pointer.load()
      .then(name => {
        if (name && name != "") {
          this.pointer.name = name;
          this.connect(name);
        }
      }).catch(err => {
        console.error(err);
      })

  }

  setName() {
    let name = (<HTMLInputElement>document.getElementById("pointerName")).value;
    this.connect(name);
  }
  setScore(score) {
    this.socket.next({ "event": "score", "score": score });
  }

  averagePoints(){
    let total = 0;
    let validScores = this.session.Pointers.length;
    for( let i=0; i < this.session.Pointers.length; i++){
      let p = this.session.Pointers[i];
      if(p.score != "-" && p.score != "?"){
        total+=parseInt(p.score)
        if (isNaN(total)){
          total = 0;
        }
      }else{
        validScores = validScores -1;
      }
    }
    this.average = total / validScores;
    this.average = parseFloat(this.average.toFixed(2));
    
  }

  connect(name) {
    this.sessionID = this.activeRoute.snapshot.params["id"];
    this.session.ID = this.sessionID;
    this.socket = this.sessionService
      .connect(this.sessionID, name)

    this.socket.forEach((response: MessageEvent): any => {
      this.handleMessageEvent(response.data)
    });
    console.log("saving pointer");
    this.pointer.name = name;
    this.pointer.score = "-";
    this.session.Pointers.push(this.pointer)
    this.pointer.save();
  }

  handleMessageEvent(event: any) {
    let e = JSON.parse(event);
    if (e.event === "pointers") {
        this.session.Pointers = []
        for (let i = 0; i < e.points.length; i++) {
          let p = new Pointer();
          let ip = e.points[i];
          p.name = ip.name;
          p.score = ip.score || "-";
          this.session.Pointers.push(p);
        }
        return;
    }else if (e.event === "score"){
        for (let i = 0; i < this.session.Pointers.length; i++) {
          let p = this.session.Pointers[i];
          if (p.name == e.name) {
            p.score = e.score;
          }
        }
        this.averagePoints();
        return;
    }else if (e.event === "show"){
        this.session.Show = true;
        this.averagePoints();
        return;
    }else if (e.event === "clear"){
       return this.clearPoints(false);
    }
  }

  showPoints() {
    this.session.Show = true;
    this.socket.next({ "event": "show" });
  }

  clearPoints(send) {
    this.session.Show = false;
    for (let i = 0; i < this.session.Pointers.length; i++) {
      let p = this.session.Pointers[i];
      p.score = "-";
    }
    if (send == true){
     this.socket.next({ "event": "clear" });
    }

  }

}
