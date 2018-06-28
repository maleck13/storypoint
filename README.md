# Simple Story Pointing App

try it out at [https://storypoint.me](https://storypoint.me)

## Pre-requisites
- Go (https://golang.org/)

## Setup
- Clone the repo into the correct GOPATH

### Server Setup
1. Build the server
  ```
    make build_all
  ```
2. Run the server
  ```
    docker run -d -p 8080:8080 maleck13/storypoint-api:1.0.0
  ```

### Frontend Setup
1. Go into the web folder. `cd web/`
2. Install angular-cli
  ```
    npm install g @angular/cli@latest
  ```
3. Build using `ng build`
4. Serve using `ng serve`

