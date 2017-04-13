/**
 * Note this is currently handling too much. The jira stuff should be split out into
 * its own component and prob use some observabales to manage state
 */
import { Component, OnInit } from '@angular/core';
import { SessionService, Pointer, Session } from '../session.service';
import { ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs/Subject';
import { JiraService, JiraAuth, JiraSession } from '../jira.service'
@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
  providers: []
})
export class SessionComponent implements OnInit {

  constructor(private sessionService: SessionService, private activeRoute: ActivatedRoute, private jiraService: JiraService) { }

  private sessionID: string
  private pointer: Pointer = new Pointer();
  private session: Session = new Session();
  private socket: Subject<any>;
  private average: number = 0;
  private choice: number = 0;
  private jira = false;
  private jiraLinked = false;
  private jiraAuth = new JiraAuth();
  private jiraSession = new JiraSession("", "", "");
  private jiraQl: string
  private jiraIssues: any[] = new Array();
  private jiraIssuesOn = false;
  private activeLink: string = "pointing";
  private currentJira: any = { "index": 0, "fields": {} };
  private error: string
  private recentQueries :string[] = new Array()

  ngOnInit() {
    this.error = undefined;
    this.pointer.load()
      .then(name => {
        if (name && name != "") {
          this.pointer.name = name;
          this.connect(name);
        }
      }).catch(err => {
        if(err){
          this.error = "failed to connect by websocket " + err.message 
        }
      })
    this.jiraService.loadQueries()
    .then((q)=>{
      this.recentQueries = q;
    })  
    this.jiraAuth.load()
      .then(jauth => {
        if (jauth) {
          this.jiraAuth = jauth;
        }
      })
      .catch(err => {
        console.error("error loading jiraAuth", err);
      });
    this.jiraSession.load()
      .then(sess => {
        if (sess) {
          this.jiraSession = sess;
          this.jiraLinked = true;
          this.jiraIssuesOn = true;
        }
      })
      .catch(err => {
        console.error("error loading jiraSession ",err);
      });
  }

  setName() {
    let name = (<HTMLInputElement>document.getElementById("pointerName")).value;
    this.connect(name);
  }
  setScore(score) {
    this.socket.next({ "event": "score", "score": score });
  }

  averagePoints() {
    let total = 0;
    let validScores = this.session.Pointers.length;
    for (let i = 0; i < this.session.Pointers.length; i++) {
      let p = this.session.Pointers[i];
      if (p.score != "-" && p.score != "?") {
        let s = parseInt(p.score)
        if (isNaN(s)) {
          total += 0;
          return;
        }
        total += s;
      } else {
        validScores = validScores - 1;
      }
    }
    this.average = total / validScores;
    this.average = Math.round(parseFloat(this.average.toFixed(2)));

  }

  connect(name) {
    this.sessionID = this.activeRoute.snapshot.params["id"];
    this.session.ID = this.sessionID;
    this.socket = this.sessionService
      .connect(this.sessionID, name)

    this.socket.forEach((response: MessageEvent): any => {
      this.handleMessageEvent(response.data)
    });
    this.pointer.name = name;
    this.pointer.score = "-";
    this.session.Pointers.push(this.pointer)
    this.pointer.save();
  }

  clearLoadedJiras(){
    this.jiraIssues = new Array();
    this.jiraIssuesOn = true;
    this.jiraService.loadQueries()
    .then((res)=>{
      if(res){
        this.recentQueries = res;
      }
    })
  }

  showJiraLinkForm() {
    this.jira = true;
    this.jiraIssuesOn = false;
    this.activeLink = "jira";
  }

  pointJiraIssue(id) {
    if (this.jiraIssues[id]) {
      this.currentJira = this.jiraIssues[id];
      this.currentJira.index = id;
      this.socket.next({ "event": "jira", "issue": { "description": this.currentJira.fields.description, "summary": this.currentJira.fields.summary } });
    }else{
      this.error = "failed to find a jira issue at index " + id
      return;
    }
    this.jiraLinkCancel();
  }

  jiraLinkCancel() {
    this.jira = false;
    this.jiraIssuesOn = false;
    this.jiraLinked = false;
    this.activeLink = "pointing";
  }

  listJiraIssues() {
    this.jiraIssuesOn = true;
    this.activeLink = "issues";

  }

  clearPointer($event:any){
    console.log("clear");
    $event.stopPropagation();
    this.pointer.name = undefined;
    this.jira = false;
    this.jiraIssuesOn = false;
    this.jiraLinked = false;
    return false;
  }

  jiraQuery() {
    console.log("this jql ", this.jiraQl);
    this.jiraSession.load()
      .then(auth => {
        this.jiraService.list(auth, this.sessionID, this.jiraQl)
          .then(resp => {
            this.jiraIssues = resp.issues;
            this.jiraService.saveQuery(this.jiraQl);
            this.jiraService.loadQueries()
            .then((q)=>{
              this.recentQueries = q;
            })
          })
      })
      .catch(err => {
        console.log("error listing", err);
        this.jiraSession.del();
        this.jiraLinked = false;
      })
  }

  populateQuery(index ){
    if(this.recentQueries[index]){
      this.jiraQl = this.recentQueries[index];
    }
  }

  jiraLink() {
    this.error = null;
    this.jiraService.authenticate(this.jiraAuth)
      .then((auth) => {
        this.jiraAuth.save();
        auth.save()
          .then(() => {
            this.jira = false;
            this.jiraLinked = true;
            this.jiraIssuesOn = true;
            this.activeLink = "issues";
          });
      })
      .catch(err => {
        this.error = err.message;
        this.jiraSession.del();
        this.jiraLinked = false;
      })
  }

  jiraSave() {
    console.log(this.choice);
    this.jiraSession.load()
      .then(auth => {
        this.jiraService.updateSP(auth, this.sessionID, this.currentJira.key, this.choice)
          .then(resp => {
            if (resp.status != 204) {
              //error
            }
            this.jiraIssues.splice(this.currentJira.index, 1);

          })
      })
      .catch(err => {
        console.log("error updating", err);
        this.jiraSession.del();
        this.jiraLinked = false;
      })
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
    } else if (e.event === "score") {
      for (let i = 0; i < this.session.Pointers.length; i++) {
        let p = this.session.Pointers[i];
        if (p.name == e.name) {
          p.score = e.score;
        }
      }
      this.averagePoints();
      return;
    } else if (e.event === "show") {
      this.session.Show = true;
      this.averagePoints();
      return;
    } else if (e.event === "clear") {
      return this.clearPoints(false);
    } else if (e.event === "jira") {
      this.currentJira.fields["description"] = e.issue.description;
      this.currentJira.fields["summary"] = e.issue.summary;
      this.jiraLinkCancel();
    } else {
      console.log("missed event ", e);
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
    if (send == true) {
      this.socket.next({ "event": "clear" });
    }

  }

}
