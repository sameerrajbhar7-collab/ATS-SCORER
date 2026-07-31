from pydantic import BaseModel
from typing import List

class ResumeSummary(BaseModel):
    name: str
    email: str
    phone: str
    experience: str
    education: str
    total_skills_found: int
    projects: int

class JobDescriptionSummary(BaseModel):
    job_title: str
    location: str
    total_skills: int
    experience_required: str
    education_required: str
    key_responsibilities: int

class MissingSkills(BaseModel):
    PROGRAMMING: List[str]
    GENAI: List[str]
    DATABASES: List[str]
    ML_DL: List[str]
    CLOUD_DEVOPS: List[str]
    TOOLS: List[str]

class KeywordsAnalysis(BaseModel):
    present: List[str]
    missing: List[str]

class ATSAnalysisResponse(BaseModel):
    ats_score: int
    resume_summary: ResumeSummary
    jd_summary: JobDescriptionSummary
    missing_skills: MissingSkills
    keywords_analysis: KeywordsAnalysis
    improvement_suggestions: List[str]
