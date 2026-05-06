from pydantic import BaseModel
from typing import Optional, Any, Dict, List

class AnalysisSessionBase(BaseModel):
    filename: str

class AnalysisSessionCreate(AnalysisSessionBase):
    pass

class AnalysisSessionResponse(AnalysisSessionBase):
    id: int
    k_value: Optional[int]
    
    class Config:
        from_attributes = True

class ClusterRequest(BaseModel):
    k: int
    features: Optional[List[str]] = None
