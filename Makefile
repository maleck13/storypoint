TAG = 1.0.0
DOCKERORG = maleck13
API_IMAGE_NAME = storypoint-api
WEB_IMAGE_NAME = storypoint-web

.phony: build_all
build_all: build_api_image build_web_image
	


.phony: build_api_image
build_api_image: build_api_binary
	docker build -t $(DOCKERORG)/$(API_IMAGE_NAME):$(TAG) ./cmd/server/

.phony: build_api_binary
build_api_binary:
	env GOOS=linux GOARCH=amd64 go build -o ./cmd/server/server ./cmd/server




.phony: build_web_image
build_web_image: build_web_binary
	cd ./web && ng build
	docker build -t $(DOCKERORG)/$(WEB_IMAGE_NAME):$(TAG) ./web/

.phony: build_web_binary
build_web_binary:
	env GOOS=linux GOARCH=amd64 go build -o ./web/files ./cmd/files

	
	