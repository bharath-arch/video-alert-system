 
 ## API Flow Diagram
 ┌───────────┐          ┌─────────────┐          ┌───────────┐
 │ Frontend  │ <------> │   Backend   │ <------> │  Worker   │
 └───────────┘          └─────────────┘          └───────────┘
       │                       │                        │
       │  GET /cameras         │                        │
       │──────────────────────>│                        │
       │   List cameras        │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │ POST /cameras         │                        │
       │──────────────────────>│ Save in DB             │
       │                       │                        │
       │ PUT /cameras/:id      │                        │
       │──────────────────────>│ Update in DB           │
       │                       │                        │
       │ DELETE /cameras/:id   │                        │
       │──────────────────────>│ Remove in DB           │
       │                       │                        │
       │ POST /cameras/:id/start                      │
       │──────────────────────>│ Proxy → /worker/start │
       │                       │──────────────────────>│ Start RTSP ingest
       │                       │                        │
       │ POST /cameras/:id/stop                       │
       │──────────────────────>│ Proxy → /worker/stop  │
       │                       │──────────────────────>│ Stop RTSP ingest
