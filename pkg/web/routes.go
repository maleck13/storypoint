package web

import (
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/maleck13/storypoint/pkg/web/middleware"
)

// Router sets up the HTTP Router
func Router() *mux.Router {
	r := mux.NewRouter()
	r.StrictSlash(true)
	return r
}

// BuildHTTPHandler puts together our HTTPHandler
func BuildHTTPHandler(r *mux.Router) http.Handler {
	recovery := negroni.NewRecovery()
	recovery.PrintStack = false
	n := negroni.New(recovery)
	cors := middleware.Cors{}
	n.UseFunc(cors.Handle)
	n.UseHandler(r)
	return n
}

// SessionRoute sets up the main session route
func SessionRoute(r *mux.Router, sessionHandler SessionHandler) {
	r.HandleFunc("/session", sessionHandler.ID).Methods("GET")
	r.HandleFunc("/session/{id}", sessionHandler.Session)
	r.HandleFunc("/sessions/count", sessionHandler.Active).Methods("GET")
}

func SysRoute(r *mux.Router) {
	sys := SysHandler{}
	r.HandleFunc("/sys/info/version", sys.Version)
}

func JiraRoute(r *mux.Router, jiraHandler JiraHandler) {
	r.HandleFunc("/jira/authenticate", jiraHandler.Authenticate).Methods("POST")
	r.HandleFunc("/jira/{sessionID}/items", jiraHandler.IssueList).Methods("POST")
	r.HandleFunc("/jira/{sessionID}/item/{id}", jiraHandler.IssueUpdate).Methods("POST")
}
