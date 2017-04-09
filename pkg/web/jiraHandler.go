package web

import (
	"encoding/json"
	"net/http"

	"github.com/maleck13/storypoint/pkg/jira"
)

type JiraHandler struct{}

type jiraQuery struct {
	Host  string `json:"host"`
	Query string `json:"query"`
}

func (jh JiraHandler) IssueList(rw http.ResponseWriter, req *http.Request) {
	auth := req.Header.Get("X-Jira-Auth")
	encoder := json.NewEncoder(rw)
	decoder := json.NewDecoder(req.Body)
	client := jira.Client{}
	jQuery := &jiraQuery{}
	if err := decoder.Decode(&jQuery); err != nil {
		http.Error(rw, "failed to decode query : "+err.Error(), http.StatusBadRequest)
		return
	}
	client.Host = jQuery.Host
	//may be able to just stream through the response here
	list, err := client.Filter(auth, jQuery.Query)
	if err != nil {
		if jira.IsErrAuth(err) {
			http.Error(rw, "failed to Filter Jira issues "+err.Error(), http.StatusUnauthorized)
			return
		}
		http.Error(rw, "failed to Filter Jira issues "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := encoder.Encode(list); err != nil {
		http.Error(rw, "failed to encode response "+err.Error(), http.StatusInternalServerError)
		return
	}
}

type JiraAuth struct {
	User    string `json:"user"`
	Pass    string `json:"pass"`
	Host    string `json:"host"`
	Session string `json:"session"`
}

func (jh JiraHandler) Authenticate(rw http.ResponseWriter, req *http.Request) {
	var (
		decoder = json.NewDecoder(req.Body)
		auth    = &JiraAuth{}
		client  = jira.Client{}
		encoder = json.NewEncoder(rw)
	)

	if err := decoder.Decode(auth); err != nil {
		http.Error(rw, "failed to decode auth "+err.Error(), http.StatusBadRequest)
		return
	}
	if auth.Session != "" {
		// link session token
		if err := encoder.Encode(auth.Session); err != nil {
			http.Error(rw, "failed to encode response "+err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}
	authRes, err := client.Authenticate(auth.Host, auth.User, auth.Pass)
	if err != nil {
		http.Error(rw, "failed to authenticate "+err.Error(), http.StatusUnauthorized)
		return
	}
	if err := encoder.Encode(authRes.Session); err != nil {
		http.Error(rw, "failed to encode response "+err.Error(), http.StatusInternalServerError)
		return
	}
	return
}

func NewJiraHandler() JiraHandler {
	return JiraHandler{}
}
