package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/Sirupsen/logrus"
	"github.com/maleck13/storypoint/pkg/session"
	"github.com/maleck13/storypoint/pkg/web"
)

var logLevel string

func main() {
	flag.StringVar(&logLevel, "log-level", "info", "use this to set log level: error, info, debug")
	flag.Parse()
	switch logLevel {
	case "info":
		logrus.SetLevel(logrus.InfoLevel)
		logrus.Info("log-level set to info")
	case "error":
		logrus.SetLevel(logrus.ErrorLevel)
		logrus.Error("log-level set to error")
	case "debug":
		logrus.SetLevel(logrus.DebugLevel)
		logrus.Debug("log-level set to debug")
	default:
		logrus.SetLevel(logrus.ErrorLevel)
		logrus.Error("log-level set to error")
	}
	logrus.SetLevel(logrus.InfoLevel)
	router := web.Router()
	logger := logrus.StandardLogger()
	sesssionStore := session.NewStore()
	//sys
	{
		web.SysRoute(router)
	}
	//session handler
	{
		sessionHandler := web.NewSessionHandler(logger, sesssionStore)
		web.SessionRoute(router, sessionHandler)
	}
	//jira handler
	{
		jiraHandler := web.NewJiraHandler()
		web.JiraRoute(router, jiraHandler)
	}

	httpHandler := web.BuildHTTPHandler(router)
	log.Println("starting api on 8080")
	if err := http.ListenAndServe(":8080", httpHandler); err != nil {
		log.Fatal(err)
	}
}
