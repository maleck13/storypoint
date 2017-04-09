import { Component, OnInit } from '@angular/core';
import { SessionService, Pointer, Session } from '../session.service';
import { ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs/Subject';
import {JiraService, JiraAuth, JiraSession} from '../jira.service'
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
  private jira = false;
  private jiraLinked = false;
  private jiraAuth = new JiraAuth();
  private jiraSession = new JiraSession("","","");
  private jiraQl : string
  private jiraIssues : any[] = new Array();
  private jiraIssuesOn = false;
  private activeLink : string = "pointing";
  private currentJira :any  = {"fields":{}};

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
      this.jiraSession.load()
      .then(auth=>{
        console.log("loaded jira auth ", auth);
        if (auth){
          this.jiraSession = auth;
          this.jiraLinked = true;
        }
      })
      .catch(err=>{
        console.log(err);
      });
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
        let s =parseInt(p.score)
        if (isNaN(s)){
          total+= 0;
          return;
        }
        total+=s;
      }else{
        validScores = validScores -1;
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

  showJiraLinkForm(){
    this.jira = true;
    this.jiraIssuesOn = false;
    this.activeLink = "jira";
  }

  pointJiraIssue(id){
    console.log("index",id);
    if(this.jiraIssues[id]){
      this.currentJira = this.jiraIssues[id];
      this.socket.next({"event":"jira","issue":{"description":this.currentJira.fields.description,"summary":this.currentJira.fields.summary}});
    }
    this.jiraLinkCancel();
  }

  jiraLinkCancel(){
    this.jira = false;
    this.jiraIssuesOn=false;
    this.jiraLinked = false;
    this.activeLink = "pointing";
  }

  listJiraIssues(){
    this.jiraIssuesOn = true;
    this.activeLink = "issues";

  }

  jiraQuery(){
    console.log("this jql ",this.jiraQl);
    this.jiraSession.load()
    .then(auth=>{
       this.jiraService.list(auth,this.sessionID,this.jiraQl)
       .then(resp=>{
          this.jiraIssues = resp.issues;
       })
    })
    .catch(err=>{
      console.log("error listing",err);
      this.jiraSession.del();
      this.jiraLinked = false;
    })
  }

  jiraLink(){
    console.log("jiraLink")
    this.jiraService.authenticate(this.jiraAuth)
    .then((auth)=>{
      auth.save()
      .then(()=>{
        this.jira = false;
        this.jiraLinked = true;
        this.jiraIssuesOn = true;
        this.activeLink = "issues";
      });      
    })
    .catch(err=>{
      console.log(err);
    })
  }

  jiraSave(){
    console.log(this.average);
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
    }else if (e.event === "jira"){
        this.currentJira.fields["description"] = e.issue.description;
        this.currentJira.fields["summary"] = e.issue.summary;
        this.jiraLinkCancel();
    }else{
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
    if (send == true){
     this.socket.next({ "event": "clear" });
    }

  }

}
