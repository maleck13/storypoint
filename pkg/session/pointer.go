package session

import (
	"bytes"
	"fmt"
	"log"
	"time"

	"sync"

	"encoding/json"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	 writeWait = 8 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 50 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// Pointer represents a user who is in a  PointingSession
type Pointer struct {
	conn            *websocket.Conn
	send            chan []byte
	pointingSession *PointingSession
	Name            string `json:"name"`
	Score           string `json:"score"`
}

// NewPointer returns a new Pointer user
func NewPointer(conn *websocket.Conn, pointinSession *PointingSession, name string) *Pointer {
	return &Pointer{
		conn: conn,
		send: make(chan []byte),
		// the pointer has knows about the pointing session this is to BroadCast to everyone in that session
		pointingSession: pointinSession,
		Name:            name,
	}
}

type pointingMessage struct {
	Event string `json:"event"`
	Score string `json:"score"`
	Name  string `json:"name"`
}

type errorMessage struct {
	Event   string `json:"event"`
	Message string `json:"message"`
}

// Write reades messages sent to the pointer from other pointers and writes to the websocket
func (p *Pointer) Write(w *sync.WaitGroup) {
	// tick and check everything ok with the pointer once every ~40 seconds
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		p.conn.Close()
	}()
	w.Done()
	//read from our send channel
	for {
		select {
		case message, ok := <-p.send:
			p.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				p.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := p.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				fmt.Println("failed to write to the connection ", err.Error())
			}
		case <-ticker.C:
			// when it ticks write the ping to the client socket. If it fails return so the the connection is closed
			p.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := p.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
	score   = []byte(`score`)
)

func (p *Pointer) Read(w *sync.WaitGroup) {
	defer func() {
		p.conn.Close()
	}()
	p.conn.SetReadLimit(maxMessageSize)
	p.conn.SetReadDeadline(time.Now().Add(pongWait))
	p.conn.SetPongHandler(func(string) error { p.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	w.Done()
	for {
		_, message, err := p.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("unexpected close error: %v", err)
			}
			p.pointingSession.Leave <- p
			break
		}
		//remove \ns
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		if bytes.Contains(message, score) {
			// a score has been sent
			jsonMessage := &pointingMessage{}
			if err := json.Unmarshal(message, jsonMessage); err != nil {
				//send to client
				fmt.Println(err)
				jsonErr := &errorMessage{Event: "error", Message: "unexpected error " + err.Error()}
				message, err = json.Marshal(jsonErr)
				if err != nil {
					fmt.Println(err)
				}
				p.pointingSession.BroadCast <- message
			} else {
				jsonMessage.Name = p.Name
				p.Score = jsonMessage.Score
				message, err = json.Marshal(jsonMessage)
				if err != nil {
					fmt.Println(err)
				}
			}
		}
		p.pointingSession.BroadCast <- message
	}
}
