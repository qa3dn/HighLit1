import json

from channels.generic.websocket import AsyncWebsocketConsumer


class SpaceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.space_id = self.scope["url_route"]["kwargs"]["space_id"]
        self.group_name = f"space_{self.space_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        self.user_id = None
        await self.send(text_data=json.dumps({"type": "connected", "space_id": self.space_id}))

    async def disconnect(self, close_code):
        if self.user_id:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "space.message",
                    "event": "user-left",
                    "data": {"userId": self.user_id},
                },
            )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return
        payload = json.loads(text_data)
        event = payload.get("event", "message")
        data = payload.get("data", {})
        if event == "join-space":
            self.user_id = data.get("userId")
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "space.message",
                    "event": "user-joined",
                    "data": data,
                },
            )
            return
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "space.message",
                "event": event,
                "data": data,
            },
        )

    async def space_message(self, event):
        await self.send(text_data=json.dumps({"event": event["event"], "data": event["data"]}))
