package my_sites

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"transithub/backend/internal/modules/upstream"
)

func TestCreateAdminResourceSub2APIResponsesMode(t *testing.T) {
	tests := []struct {
		groupType string
		wantMode  string
	}{
		{groupType: "openai", wantMode: "force_responses"},
		{groupType: "OpenAI", wantMode: "force_responses"},
		{groupType: "anthropic"},
		{groupType: "gemini"},
		{groupType: "antigravity"},
		{groupType: "custom"},
	}
	for _, tt := range tests {
		t.Run(tt.groupType, func(t *testing.T) {
			requests := make(chan map[string]any, 1)
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Method != http.MethodPost || r.URL.Path != "/api/v1/admin/accounts" {
					t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
					w.WriteHeader(http.StatusNotFound)
					return
				}
				var payload map[string]any
				if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
					t.Errorf("decode account payload: %v", err)
					w.WriteHeader(http.StatusBadRequest)
					return
				}
				requests <- payload
				writeConnectionTestJSON(w, map[string]any{"data": map[string]any{"id": 22}})
			}))
			defer server.Close()

			service := &Service{platformService: upstream.NewPlatformService(upstream.NewHTTPClient(server.Client()))}
			connectionCtx := connectionContext{
				state:        &State{Session: platformTestSession(upstream.PlatformSub2API, server.URL)},
				upstreamSite: &upstream.Site{Name: "source", BaseURL: "https://provider.example"},
				groupType:    tt.groupType,
				groupName:    "vip",
			}
			id, _, err := service.createAdminResource(connectionCtx, 0, []string{"7"}, "sk-test")
			if err != nil {
				t.Fatalf("create admin resource: %v", err)
			}
			if id != "22" {
				t.Fatalf("account id = %q, want 22", id)
			}

			select {
			case payload := <-requests:
				extra, _ := payload["extra"].(map[string]any)
				mode, present := extra["openai_responses_mode"]
				if tt.wantMode == "" {
					if present {
						t.Errorf("non-OpenAI account includes responses mode: %v", mode)
					}
				} else {
					if mode != tt.wantMode {
						t.Errorf("extra.openai_responses_mode = %v, want %q", mode, tt.wantMode)
					}
					if extra["openai_passthrough"] != true {
						t.Error("OpenAI passthrough must remain enabled")
					}
				}
			default:
				t.Fatal("account creation request was not sent")
			}
		})
	}
}
