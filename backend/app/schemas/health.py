from pydantic import BaseModel


class HealthCheck(BaseModel):
    status: str
    api_version: str
    database_connected: bool
