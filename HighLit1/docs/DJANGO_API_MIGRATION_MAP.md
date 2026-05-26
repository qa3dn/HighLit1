# Django API Migration Map

Frontend now targets `http://localhost:8000/api/v1` by default.

## Auth and Users

- `GET /auth/health` -> `GET /api/v1/auth/health`
- `POST /auth/register` -> `POST /api/v1/auth/register`
- `POST /auth/login` -> `POST /api/v1/auth/login`
- `GET /auth/me` -> `GET /api/v1/auth/me`
- `GET /users/:id` -> `GET /api/v1/users/:id`
- `GET /users/:id/rank` -> `GET /api/v1/users/:id/rank`

## Posts

- `GET /posts` -> `GET /api/v1/posts`
- `POST /posts` -> `POST /api/v1/posts`
- `GET /posts/:id` -> `GET /api/v1/posts/:id`
- `GET /posts/rants` -> `GET /api/v1/posts/rants`
- `GET /posts/tags` -> `GET /api/v1/posts/tags`
- `GET /posts/tags/:tag` -> `GET /api/v1/posts/tags/:tag`
- `GET /posts/stats/daily` -> `GET /api/v1/posts/stats/daily`
- `POST /posts/:id/reactions` -> `POST /api/v1/posts/:id/reactions`
- `GET /posts/:id/reactions` -> `GET /api/v1/posts/:id/reactions`
- `POST /posts/:id/comments` -> `POST /api/v1/posts/:id/comments`
- `GET /posts/:id/comments` -> `GET /api/v1/posts/:id/comments`

## Jobs, Spaces, Stress

- `GET /jobs` -> `GET /api/v1/jobs`
- `GET /jobs/:id` -> `GET /api/v1/jobs/:id`
- `GET /jobs/:id/reviews` -> `GET /api/v1/jobs/:id/reviews`
- `POST /jobs/:id/reviews` -> `POST /api/v1/jobs/:id/reviews`
- `GET /spaces` -> `GET /api/v1/spaces`
- `GET /spaces/live` -> `GET /api/v1/spaces/live`
- `GET /spaces/:id` -> `GET /api/v1/spaces/:id`
- `GET /stress` -> `GET /api/v1/stress`

## Room

- `GET /room/me` -> `GET /api/v1/room/me`
- `GET /room/:userId` -> `GET /api/v1/room/:userId`
- `GET /room/code-storage` -> `GET /api/v1/room/code-storage`
- `POST /room/code-storage` -> `POST /api/v1/room/code-storage`
- `PATCH /room/code-storage/:id` -> `PATCH /api/v1/room/code-storage/:id`
- `DELETE /room/code-storage/:id` -> `DELETE /api/v1/room/code-storage/:id`
- `GET /room/dev-notes` -> `GET /api/v1/room/dev-notes`
- `POST /room/dev-notes` -> `POST /api/v1/room/dev-notes`
- `PATCH /room/dev-notes/:id` -> `PATCH /api/v1/room/dev-notes/:id`
- `DELETE /room/dev-notes/:id` -> `DELETE /api/v1/room/dev-notes/:id`
- `GET /room/ideas?userId=:id` -> `GET /api/v1/room/ideas?userId=:id`
- `POST /room/ideas` -> `POST /api/v1/room/ideas`
- `PATCH /room/ideas/:id` -> `PATCH /api/v1/room/ideas/:id`
- `DELETE /room/ideas/:id` -> `DELETE /api/v1/room/ideas/:id`
- `GET /room/saved-items` -> `GET /api/v1/room/saved-items`
- `POST /room/saved-items` -> `POST /api/v1/room/saved-items`
- `DELETE /room/saved-items?itemType=...&itemId=...` -> `DELETE /api/v1/room/saved-items?itemType=...&itemId=...`
- `PATCH /room/status` -> `PATCH /api/v1/room/status`

## Realtime

- Old client: `socket.io` namespace `/spaces`
- New client: native WebSocket at `ws://localhost:8000/ws/spaces/lobby/`
