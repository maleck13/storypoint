package session

import (
	"time"

	"sync"

	"encoding/json"

	"github.com/Sirupsen/logrus"
)

// NewStore creates a pointinSession store that is thread safe
func NewStore() *Store {
	return &Store{
		Mutex:    &sync.Mutex{},
		sessions: map[string]*PointingSession{},
	}
}

// Store Mutex protected map of PointingSessions
type Store struct {
	*sync.Mutex
	sessions map[string]*PointingSession
}

// Add is threadsafe method for adding new PointingSession
func (i *Store) Add(s *PointingSession) {
	i.Lock()
	defer i.Unlock()
	i.sessions[s.id] = s
}

// Remove is threadsafe method for removing new PointingSession
func (i *Store) Remove(id string) {
	i.Lock()
	defer i.Unlock()
	delete(i.sessions, id)
}

// Get is threadsafe method for getting PointingSession
func (i *Store) Get(id string) *PointingSession {
	i.Lock()
	defer i.Unlock()
	return i.sessions[id]
}

// Count returns number of sessions
func (i *Store) Count() int {
	return len(i.sessions)
}

// PointingSession is a container for set of connected websockets
type PointingSession struct {
	id string
	*sync.Mutex
	Pointers map[*Pointer]bool

	logger    *logrus.Logger
	BroadCast chan []byte
	Leave     chan *Pointer
	Store     *Store
}

// cleanUp runs in the background removing sessions that have no more users
func (ps *PointingSession) cleanUp() {
	cleanUp := time.NewTicker(time.Second * 30)
	defer cleanUp.Stop()
	for {
		select {
		case <-cleanUp.C:
			if len(ps.Pointers) == 0 {
				ps.Store.Remove(ps.id)
				return
			}
		}
	}
}

// AddPointer adds a new storypointer
func (ps *PointingSession) AddPointer(p *Pointer) {
	ps.Lock()
	defer ps.Unlock()
	ps.Pointers[p] = true
	go ps.broadCastPoints()
}

func (ps *PointingSession) removePointer(p *Pointer) {
	ps.Lock()
	defer ps.Unlock()
	delete(ps.Pointers, p)
}

func (ps *PointingSession) broadCastPoints() {
	pointers := []map[string]string{}
	for k := range ps.Pointers {
		p := map[string]string{}
		p["score"] = k.Score
		p["name"] = k.Name
		pointers = append(pointers, p)
	}
	res := map[string]interface{}{}
	res["event"] = "pointers"
	res["points"] = pointers
	data, err := json.Marshal(res)
	if err != nil {
		//should prob send this to the client
		logrus.StandardLogger().Error("err Marshalling score")
	}
	ps.BroadCast <- data
}

// Run runs the pointing session waiting for messages and monitoring for when the session is finished
func (ps *PointingSession) Run() {
	go ps.cleanUp()
	for {
		select {
		case m := <-ps.Leave:
			ps.removePointer(m)
			//needs to be async so as not to block the run loop
			go ps.broadCastPoints()
		case in := <-ps.BroadCast:
			for member := range ps.Pointers {
				select {
				case member.send <- in:
				default:
					//coulnd send to this member means nothing is reading from it so can remove
					ps.removePointer(member)
				}
			}
		}
	}
}

// New returns a new PointingSession
func New(id string, logger *logrus.Logger, store *Store) *PointingSession {
	return &PointingSession{
		Pointers:  make(map[*Pointer]bool),
		BroadCast: make(chan []byte),
		Leave:     make(chan *Pointer),
		logger:    logger,
		Store:     store,
		id:        id,
		Mutex:     &sync.Mutex{},
	}
}
