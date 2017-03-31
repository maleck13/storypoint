package main

import (
	"log"
	"net/http"

	"github.com/maleck13/storypoint/pkg/web"
)

func main() {
	router := web.Router()

	//session handler
	{
		sessionHandler := web.NewSessionHandler()
		web.SessionRoute(router, sessionHandler)
	}

	httpHandler := web.BuildHTTPHandler(router)
	if err := http.ListenAndServe(":3000", httpHandler); err != nil {
		log.Fatal(err)
	}
}
