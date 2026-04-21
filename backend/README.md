# HighLit Django Backend

Django replacement backend for HighLit with DRF, JWT auth, Channels websocket support, moderation endpoints, and uploads.

## Run locally

1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and update values.
4. Run migrations:
   - `python manage.py makemigrations`
   - `python manage.py migrate`
5. Start the server:
   - `python manage.py runserver 0.0.0.0:8000`

## API

- Base path: `/api/v1/`
- OpenAPI schema: `/api/schema/`
- Swagger UI: `/api/docs/`

## WebSocket

- Path: `/ws/spaces/<space_id>/`
