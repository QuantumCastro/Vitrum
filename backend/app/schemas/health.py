from typing import Literal

from pydantic import BaseModel, Field


class HealthStatus(BaseModel):
    status: Literal["ok"] = Field(default="ok", description="Estado del servicio.")
