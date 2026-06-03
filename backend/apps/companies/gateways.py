"""Pluggable payment-gateway adapters.

The product runs in manual-settlement mode now (an admin marks invoices paid),
but the abstraction is gateway-ready: a CliQ/Click adapter validates signed
webhooks so a live integration is dropping in credentials, not rewriting code.

Security (CLAUDE.md §3/§6): webhooks are verified with an HMAC signature and
fail CLOSED — a missing secret rejects the webhook, there is no bypass flag.
"""

import hashlib
import hmac
import json
import os
import uuid


class GatewayError(Exception):
    """Raised on misconfiguration or a webhook that fails verification."""


class BaseGateway:
    name = "BASE"

    def create_checkout(self, invoice) -> dict:
        """Return a reference/payload the client uses to pay this invoice."""
        raise NotImplementedError

    def verify_webhook(self, headers: dict, body: bytes) -> dict:
        """Validate a provider webhook and return a normalized event:
        {idempotency_key, gateway_ref, status: 'SUCCEEDED'|'FAILED', invoice_id, amount}."""
        raise NotImplementedError


class ManualGateway(BaseGateway):
    """No external provider — settlement is recorded by an admin."""

    name = "MANUAL"

    def create_checkout(self, invoice) -> dict:
        return {
            "gateway": self.name,
            "reference": f"manual-{invoice.id}",
            "instructions": "تُسوّى الفاتورة يدوياً بواسطة المسؤول.",
        }

    def verify_webhook(self, headers, body):
        raise GatewayError("Manual gateway has no webhook.")


class HmacGateway(BaseGateway):
    """Shared HMAC-SHA256 webhook verification for signed providers. The provider
    sends `signature_header = hex(HMAC(secret, raw_body))`."""

    name = "HMAC"
    secret_env = ""
    signature_header = "X-Signature"

    def create_checkout(self, invoice) -> dict:
        return {
            "gateway": self.name,
            "reference": f"{self.name.lower()}-{invoice.id}-{uuid.uuid4().hex[:8]}",
        }

    def _secret(self) -> bytes:
        secret = os.getenv(self.secret_env, "")
        if not secret:
            # Fail closed: never accept an unverifiable webhook.
            raise GatewayError(f"{self.secret_env} is not configured")
        return secret.encode()

    def verify_webhook(self, headers: dict, body: bytes) -> dict:
        provided = headers.get(self.signature_header) or headers.get(self.signature_header.lower()) or ""
        expected = hmac.new(self._secret(), body, hashlib.sha256).hexdigest()
        if not provided or not hmac.compare_digest(provided, expected):
            raise GatewayError("Invalid webhook signature")
        try:
            event = json.loads(body.decode() or "{}")
        except ValueError as exc:
            raise GatewayError("Invalid webhook body") from exc
        ok_states = {"paid", "succeeded", "success", "captured"}
        return {
            "idempotency_key": str(event.get("event_id") or event.get("reference") or ""),
            "gateway_ref": str(event.get("reference") or ""),
            "status": "SUCCEEDED" if str(event.get("status", "")).lower() in ok_states else "FAILED",
            "invoice_id": event.get("invoice_id"),
            "amount": event.get("amount"),
        }


class CliqGateway(HmacGateway):
    name = "CLIQ"
    secret_env = "CLIQ_WEBHOOK_SECRET"
    signature_header = "X-Cliq-Signature"


class ClickGateway(HmacGateway):
    name = "CLICK"
    secret_env = "CLICK_WEBHOOK_SECRET"
    signature_header = "X-Click-Signature"


_GATEWAYS = {
    "MANUAL": ManualGateway,
    "CLIQ": CliqGateway,
    "CLICK": ClickGateway,
}


def get_gateway(name: str) -> BaseGateway:
    cls = _GATEWAYS.get((name or "MANUAL").upper())
    if cls is None:
        raise GatewayError(f"Unknown gateway: {name}")
    return cls()
