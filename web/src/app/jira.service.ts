import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { environment } from '../environments/environment'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class JiraService {

  constructor(private http : Http) { }

  authenticate(auth: JiraAuth):Promise<JiraSession>{
    return  this.http.post(environment.apiHost + "/jira/authenticate",auth).toPromise()
    .then(res=>{
      let a = res.json();
      return new JiraSession(a.name,a.value,auth.host);
    });
  }
  list(auth: JiraSession, session: string ,query: string):Promise<any>{
    let headers = new Headers()
    headers.append("content-type","application/json");
    headers.append("x-jira-auth",auth.value);
    let options = new RequestOptions({ headers: headers });
    let body = {"query":query,"host":auth.host}
    return this.http.post(environment.apiHost + "/jira/" + session + "/items",body,options).toPromise()
    .then(res=>{
      return res.json();
    });
  }

}

export class JiraAuth{
  user: string
  pass: string
  host: string
}

export class JiraSession{
  

  constructor(public name:string,public value:string, public host:string){

  }

  save():Promise<any>{
    return new Promise((res,rej)=>{
      if (window["localStorage"]){
        console.log(JSON.stringify(this));
        window.localStorage.setItem("jiraSession",JSON.stringify(this));
        return res();
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });
    
  }
  del(){
     if (window["localStorage"]){
       window.localStorage.removeItem("jiraSession");
     }
  }
  load():Promise<JiraSession>{
    return new Promise((res,rej)=>{
      if (window["localStorage"]){
        let value = window.localStorage.getItem("jiraSession");
        console.log("got value",value);
        if (value && ""!== value){
          let j = JSON.parse(value);
          let s = new JiraSession(j.name,j.value,j.host);
          return res(s);
        }
        return res()
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });
  }
}
