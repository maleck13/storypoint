package web

import (
	"net/http"

	"encoding/json"

	"sync"

	"fmt"

	"github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/maleck13/storypoint/pkg/session"
	"github.com/satori/go.uuid"
)

// SessionHandler handles pointing sessions
type SessionHandler struct {
	logger *logrus.Logger
	store  *session.Store
}

func configureUpgrader() websocket.Upgrader {
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	upgrader.CheckOrigin = func(req *http.Request) bool {
		return true
	}
	return upgrader
}

// Session start a new websocket and also a new pointing session or joins to an existing one
func (sh SessionHandler) Session(rw http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	name := req.URL.Query().Get("name")
	id := params["id"]
	upgrader := configureUpgrader()
	conn, err := upgrader.Upgrade(rw, req, nil)
	if err != nil {
		sh.logger.Error("failed to upgrade to websocket ", err)
		return
	}
	pointingSession := sh.store.Get(id)
	if nil == pointingSession {
		pointingSession = session.New(id, sh.logger, sh.store)
		sh.store.Add(pointingSession)
		go pointingSession.Run()
	}
	member := session.NewPointer(conn, pointingSession, name)
	w := &sync.WaitGroup{}
	w.Add(2)
	go member.Read(w)
	go member.Write(w)
	w.Wait()
	pointingSession.AddPointer(member)
}

// ID returns a new pointingSession ID
func (sh SessionHandler) ID(rw http.ResponseWriter, req *http.Request) {
	rw.Header().Add("content-type", "application/json")
	uid := uuid.NewV4()
	res := map[string]string{"id": uid.String()}
	enc := json.NewEncoder(rw)
	if err := enc.Encode(res); err != nil {
		http.Error(rw, "failed to encode json response "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// Active return the number of active sessions
func (sh SessionHandler) Active(rw http.ResponseWriter, req *http.Request) {
	rw.Header().Add("content-type", "application/json")
	fmt.Fprint(rw, sh.store.Count())
}

// NewSessionHandler return a SessionHandler
func NewSessionHandler(logger *logrus.Logger, store *session.Store) SessionHandler {
	return SessionHandler{logger: logger, store: store}
}
