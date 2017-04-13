import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { environment } from '../environments/environment'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class JiraService {

  constructor(private http: Http) { }

  authenticate(auth: JiraAuth): Promise<JiraSession> {
    return this.http.post(environment.apiHost + "/jira/authenticate", auth).toPromise()
      .then(res => {
        console.log("authenticate", res.status);
        if (res.status != 200) {
          throw new Error(res.statusText + res.text);
        }
        let a = res.json();
        return new JiraSession(a.name, a.value, auth.host);
      })
      .catch(err => {
        console.log("authenticate error", err);
        throw new Error(err.statusText)
      });
  }
  list(auth: JiraSession, session: string, query: string): Promise<any> {
    let headers = new Headers()
    headers.append("content-type", "application/json");
    headers.append("x-jira-auth", auth.value);
    let options = new RequestOptions({ headers: headers });
    let body = { "query": query, "host": auth.host }
    return this.http.post(environment.apiHost + "/jira/" + session + "/items", body, options).toPromise()
      .then(res => {
        return res.json();
      });
  }

  updateSP(auth: JiraSession, session: string, jiraID: string, sp: number): Promise<Response> {
    let headers = new Headers()
    headers.append("content-type", "application/json");
    headers.append("x-jira-auth", auth.value);
    let options = new RequestOptions({ headers: headers });
    let body = { "jiraID": jiraID, "points": sp, "host": auth.host }
    return this.http.post(environment.apiHost + "/jira/" + session + "/item/" + jiraID, body, options).toPromise()
  }

  saveQuery(query: string) {
    if (window["localStorage"]) {
      this.loadQueries().
        then((qs) => {
          for(let i =0; i < qs.length; i++){
            let q = qs[i];
            if (query === q){
              return;
            }
          }
          if (qs.length == 5) {
            qs[qs.length - 1] = query;
          } else {
            qs.push(query);
          }
          localStorage.setItem("queries", JSON.stringify(qs));
        });

    }
  }

  loadQueries(): Promise<string[]> {
    return new Promise((res, rej) => {
      if (window["localStorage"]) {
        let qs = localStorage.getItem("queries");
        if (qs) {
          let qArr = JSON.parse(qs);
          return res(qArr);
        }
        return res(new Array());
      }
    });
  }

}

export class JiraAuth {
  user: string
  pass: string
  host: string
  save(): Promise<any> {
    return new Promise((res, rej) => {
      if (window["localStorage"]) {
        this.pass = undefined;
        window.localStorage.setItem("jira", JSON.stringify(this));
        return res();
      }
    });
  }
  del() {
    if (window["localStorage"]) {
      window.localStorage.removeItem("jira");
    }
  }
  load(): Promise<JiraAuth> {
    return new Promise((res, rej) => {
      if (window["localStorage"]) {
        let value = window.localStorage.getItem("jira");
        console.log("got value", value);
        if (value && "" !== value) {
          let j = JSON.parse(value);
          let s = new JiraAuth();
          s.host = j.host;
          s.user = j.user;
          return res(s);
        }
        return res()
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });
  }
}

export class JiraSession {


  constructor(public name: string, public value: string, public host: string) {

  }

  save(): Promise<any> {
    return new Promise((res, rej) => {
      if (window["localStorage"]) {
        console.log(JSON.stringify(this));
        window.localStorage.setItem("jiraSession", JSON.stringify(this));
        return res();
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });

  }
  del() {
    if (window["localStorage"]) {
      window.localStorage.removeItem("jiraSession");
    }
  }
  load(): Promise<JiraSession> {
    return new Promise((res, rej) => {
      if (window["localStorage"]) {
        let value = window.localStorage.getItem("jiraSession");
        console.log("got value", value);
        if (value && "" !== value) {
          let j = JSON.parse(value);
          let s = new JiraSession(j.name, j.value, j.host);
          return res(s);
        }
        return res()
      }
      return rej(new Error("no localStorage. Get a new browser"));
    });
  }
}
