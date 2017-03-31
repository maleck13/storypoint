package web

import "net/http"
import "fmt"

// SessionHandler handles pointing sessions
type SessionHandler struct{}

func (sh SessionHandler) Start(rw http.ResponseWriter, req *http.Request) {
	fmt.Fprintf(rw, "hello start")
}

func (sh SessionHandler) Join(rw http.ResponseWriter, req *http.Request) {

}

func NewSessionHandler() SessionHandler {
	return SessionHandler{}
}
