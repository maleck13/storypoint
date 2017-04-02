import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { environment } from '../environments/environment'
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Observer } from "rxjs/Observer";


@Injectable()
export class SessionService {

  private urlSession :string = environment.wsHost+"/session"

  private subject: Subject<any>;

  private ws :WebSocket

  constructor(private http: Http) { }

  public id():Promise<any>{
    return this.http.get(environment.apiHost + "/session").toPromise()
    .then((res)=>{
      return res.json()
    })
  }

  public disconnect(){
    if(this.ws){
      console.log("disconnect")
      this.ws.close();
    }
  }

  public connect(sessionID :string,pointerName :string): Subject<MessageEvent> {
    //get a session id if there isn't one passed
    if (!this.subject) {
      this.subject = this.create(sessionID,pointerName);
    }
    return this.subject;
  }
  private create(sessionID: string, pointerName: string): Subject<MessageEvent> {
    let url = this.urlSession + "/" + sessionID+"?name="+pointerName
    if (this.ws){
      this.ws.close();
    }
    this.ws = new WebSocket(url);

    let observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        this.ws.onmessage = obs.next.bind(obs);
        this.ws.onerror = obs.error.bind(obs);
        this.ws.onclose = obs.complete.bind(obs);

        return this.ws.close.bind(this.ws);
      });

    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable);
  }

}

export class Session {
  constructor(){
    this.Pointers = [];
  }
  ID :string 
  Pointers : Pointer[]
  Show : boolean
}

export class Pointer{
  name :string
  score: string 
  constructor(){
    this.score = "0"
  }
  save():Promise<any>{
    return new Promise((res,rej)=>{
      if (window["localStorage"]){
        window.localStorage.setItem("pointerName",this.name);
        return res();
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });
    
  }
  load():Promise<string>{
    return new Promise((res,rej)=>{
      if (window["localStorage"]){
        let name = window.localStorage.getItem("pointerName");
        return res(name);
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });
  }
}
