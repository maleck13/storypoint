package jira

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"

	"strings"

	"time"

	"encoding/json"

	"github.com/pkg/errors"
)

type Client struct {
	Token string
	Host  string
}

type token string

type Auth struct {
	LoginInfo struct {
		LoginCount        int    `json:"loginCount"`
		PreviousLoginTime string `json:"previousLoginTime"`
	} `json:"loginInfo"`
	Session struct {
		Name  string `json:"name"`
		Value string `json:"value"`
	} `json:"session"`
}

func (c Client) Authenticate(host, user, pass string) (*Auth, error) {
	login := `{"username":"` + user + `","password":"` + pass + `"}`
	authURL := fmt.Sprintf("%s/%s", host, "rest/auth/1/session")
	req, err := http.NewRequest("POST", authURL, strings.NewReader(login))
	if err != nil {
		return nil, errors.Wrap(err, "failed to create authentication request")
	}
	req.Header.Add("content-type", "application/json")
	authRes := &Auth{}
	client := http.Client{}
	client.Timeout = time.Second * 15
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to do authentication request")
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return nil, ErrAuth{Message: "failed to authenticate "}
	}
	if resp.StatusCode != 200 {
		return nil, errors.New("failed to authenticate : " + resp.Status)
	}
	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(authRes); err != nil {
		return nil, errors.Wrap(err, "failed to decode auth response from jira ")
	}
	return authRes, nil
}

func (c Client) UpdateSP(token, jiraID string, points int64) error {

	//find the customFieldId for the Story Points field
	jiraFields, err := c.EditableFields(token, jiraID)
	if err != nil {
		return errors.Wrap(err, "failed to get edititable fields at UpdateSP ")
	}
	var fieldKey string
	for k, v := range jiraFields {
		if v.Name == "Story Points" {
			fieldKey = k
			break
		}
	}
	if fieldKey == "" {
		return errors.New("did not find a Story Points field")
	}
	update := map[string]map[string]int64{
		"fields": {
			fieldKey: points,
		},
	}
	jbytes, err := json.Marshal(update)
	fmt.Println("update body", string(jbytes))
	if err != nil {
		return errors.Wrap(err, "failed to marshal update in UpdateSP")
	}
	updateURL, err := url.Parse(c.Host + "/rest/api/2/issue/" + jiraID)
	if err != nil {
		return errors.Wrap(err, "failed to parse update url at UpdateSP")
	}
	req, err := http.NewRequest("PUT", updateURL.String(), bytes.NewReader(jbytes))
	if err != nil {
		return errors.Wrap(err, "failed to create the update request")
	}
	req.AddCookie(&http.Cookie{Name: "JSESSIONID", Value: token})
	req.Header.Add("content-type", "application/json")
	httpClient := http.Client{}
	httpClient.Timeout = time.Second * 20
	res, err := httpClient.Do(req)
	if err != nil {
		return errors.Wrap(err, "failed making update request")
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusNoContent {
		return errors.New("unexpected response from jira " + res.Status)
	}
	return nil
}

type ErrAuth struct {
	Message string
}

func (e ErrAuth) Error() string {
	return e.Message
}

func IsErrAuth(err error) bool {
	if nil == err {
		return false
	}
	_, ok := err.(ErrAuth)
	return ok
}

type field struct {
	Required   bool     `json:"required"`
	Name       string   `json:"name"`
	Operations []string `json:"operations"`
}

func (c Client) EditableFields(token, id string) (map[string]*field, error) {
	searchURL, err := url.Parse(c.Host + "/rest/api/2/issue/" + id + "/editmeta")
	req, err := http.NewRequest("GET", searchURL.String(), nil)
	if err != nil {
		return nil, errors.Wrap(err, " failed to create Jira search request")
	}
	req.AddCookie(&http.Cookie{Name: "JSESSIONID", Value: token})
	client := http.Client{}
	client.Timeout = time.Second * 30
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to do Jira search query")
	}
	if resp.StatusCode == http.StatusUnauthorized {
		return nil, ErrAuth{Message: "recieved 401 from Jira"}
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read response body from Jira")
	}
	respMap := map[string]map[string]*field{}
	if err := json.Unmarshal(body, &respMap); err != nil {
		return nil, errors.Wrap(err, "failed to Unmarshal response body at EditableFields ")
	}
	return respMap["fields"], nil
}

func (c Client) Filter(token, query string) (*IssueList, error) {
	searchURL, err := url.Parse(c.Host + "/rest/api/2/search")
	urlParams := url.Values{}
	urlParams.Add("jql", query)
	searchURL.RawQuery = urlParams.Encode()
	req, err := http.NewRequest("GET", searchURL.String(), nil)
	if err != nil {
		return nil, errors.Wrap(err, " failed to create Jira search request")
	}
	req.AddCookie(&http.Cookie{Name: "JSESSIONID", Value: token})
	client := http.Client{}
	client.Timeout = time.Second * 30
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to do Jira search query")
	}
	if resp.StatusCode == http.StatusUnauthorized {
		return nil, ErrAuth{Message: "recieved 401 from Jira"}
	}
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("unexpected response from Jira " + resp.Status)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read response body from Jira")
	}
	issueList := &IssueList{}
	if err := json.Unmarshal(body, issueList); err != nil {
		return nil, errors.Wrap(err, "failed to Unmarshal response from Jira")
	}
	return issueList, nil
}

type IssueList struct {
	Issues []struct {
		Fields struct {
			Aggregateprogress struct {
				Progress int `json:"progress"`
				Total    int `json:"total"`
			} `json:"aggregateprogress"`
			Aggregatetimeestimate         interface{} `json:"aggregatetimeestimate"`
			Aggregatetimeoriginalestimate interface{} `json:"aggregatetimeoriginalestimate"`
			Aggregatetimespent            interface{} `json:"aggregatetimespent"`
			Assignee                      struct {
				Active     bool `json:"active"`
				AvatarUrls struct {
					One6x16   string `json:"16x16"`
					Two4x24   string `json:"24x24"`
					Three2x32 string `json:"32x32"`
					Four8x48  string `json:"48x48"`
				} `json:"avatarUrls"`
				DisplayName  string `json:"displayName"`
				EmailAddress string `json:"emailAddress"`
				Key          string `json:"key"`
				Name         string `json:"name"`
				Self         string `json:"self"`
				TimeZone     string `json:"timeZone"`
			} `json:"assignee"`
			Components []struct {
				ID   string `json:"id"`
				Name string `json:"name"`
				Self string `json:"self"`
			} `json:"components"`
			Created string `json:"created"`
			Creator struct {
				Active     bool `json:"active"`
				AvatarUrls struct {
					One6x16   string `json:"16x16"`
					Two4x24   string `json:"24x24"`
					Three2x32 string `json:"32x32"`
					Four8x48  string `json:"48x48"`
				} `json:"avatarUrls"`
				DisplayName  string `json:"displayName"`
				EmailAddress string `json:"emailAddress"`
				Key          string `json:"key"`
				Name         string `json:"name"`
				Self         string `json:"self"`
				TimeZone     string `json:"timeZone"`
			} `json:"creator"`
			Description interface{}   `json:"description"`
			Duedate     interface{}   `json:"duedate"`
			Environment interface{}   `json:"environment"`
			FixVersions []interface{} `json:"fixVersions"`
			Issuelinks  []interface{} `json:"issuelinks"`
			Issuetype   struct {
				AvatarID    int    `json:"avatarId"`
				Description string `json:"description"`
				IconURL     string `json:"iconUrl"`
				ID          string `json:"id"`
				Name        string `json:"name"`
				Self        string `json:"self"`
				Subtask     bool   `json:"subtask"`
			} `json:"issuetype"`
			Labels     []string    `json:"labels"`
			LastViewed interface{} `json:"lastViewed"`
			Priority   struct {
				IconURL string `json:"iconUrl"`
				ID      string `json:"id"`
				Name    string `json:"name"`
				Self    string `json:"self"`
			} `json:"priority"`
			Progress struct {
				Progress int `json:"progress"`
				Total    int `json:"total"`
			} `json:"progress"`
			Project struct {
				ID   string `json:"id"`
				Key  string `json:"key"`
				Name string `json:"name"`
				Self string `json:"self"`
			} `json:"project"`
			Reporter struct {
				Active     bool `json:"active"`
				AvatarUrls struct {
					One6x16   string `json:"16x16"`
					Two4x24   string `json:"24x24"`
					Three2x32 string `json:"32x32"`
					Four8x48  string `json:"48x48"`
				} `json:"avatarUrls"`
				DisplayName  string `json:"displayName"`
				EmailAddress string `json:"emailAddress"`
				Key          string `json:"key"`
				Name         string `json:"name"`
				Self         string `json:"self"`
				TimeZone     string `json:"timeZone"`
			} `json:"reporter"`
			Resolution     interface{} `json:"resolution"`
			Resolutiondate interface{} `json:"resolutiondate"`
			Status         struct {
				Description    string `json:"description"`
				IconURL        string `json:"iconUrl"`
				ID             string `json:"id"`
				Name           string `json:"name"`
				Self           string `json:"self"`
				StatusCategory struct {
					ColorName string `json:"colorName"`
					ID        int    `json:"id"`
					Key       string `json:"key"`
					Name      string `json:"name"`
					Self      string `json:"self"`
				} `json:"statusCategory"`
			} `json:"status"`
			Subtasks             []interface{} `json:"subtasks"`
			Summary              string        `json:"summary"`
			Timeestimate         interface{}   `json:"timeestimate"`
			Timeoriginalestimate interface{}   `json:"timeoriginalestimate"`
			Timespent            interface{}   `json:"timespent"`
			Updated              string        `json:"updated"`
			Versions             []interface{} `json:"versions"`
			Votes                struct {
				HasVoted bool   `json:"hasVoted"`
				Self     string `json:"self"`
				Votes    int    `json:"votes"`
			} `json:"votes"`
			Watches struct {
				IsWatching bool   `json:"isWatching"`
				Self       string `json:"self"`
				WatchCount int    `json:"watchCount"`
			} `json:"watches"`
			Workratio int `json:"workratio"`
		} `json:"fields"`
		ID   string `json:"id"`
		Key  string `json:"key"`
		Self string `json:"self"`
	} `json:"issues"`
	MaxResults int `json:"maxResults"`
	StartAt    int `json:"startAt"`
	Total      int `json:"total"`
}
