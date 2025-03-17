from pydantic import BaseModel, Field
from typing import Annotated, Literal


class EvidenceAndAnalysis(BaseModel):
    timestamp: Annotated[
        str,
        Field(
            description="The timestamp of the evidence, [00:14-00:18]. Optional.",
            default="",
        ),
    ]
    quote: Annotated[
        str,
        Field(
            description="The direct quote from the conversation that demonstrates the achievement or missed opportunity. Optional.",
            default="",
            examples=["Salesperson: I think the, uh, Chanel cream would suit you well."],
        ),
    ]
    analysis: Annotated[str, Field(description="The analysis of the evidence. Required.")]
    evidence_type: Annotated[
        Literal["positive", "negative"],
        Field(description="Whether this evidence demonstrates positive or negative performance. Required."),
    ]


class Objective(BaseModel):
    title: Annotated[str, Field(description="The title of the objective, always the header.")]
    summary: Annotated[
        str,
        Field(description="The summary of the performance with respect to the objective, usually at the top"),
    ]
    evidence_and_analysis: Annotated[
        list[EvidenceAndAnalysis],
        Field(
            description="The list of evidence and analysis for the objective, if provided",
            default_factory=list,
        ),
    ]
    improvement_actions: str
    score: Annotated[int, Field(le=10, ge=0)]


class Metric(BaseModel):
    title: str
    analysis: str
    score: Annotated[int, Field(le=10, ge=0)]


class CommunicationPattern(BaseModel):
    top_strengths: str
    growth_areas: str


class BaseReport(BaseModel):
    objectives: Annotated[
        list[Objective],
        Field(description="The list of objectives and the performance details of each one"),
    ]
    metrics: list[Metric]
    communication_pattern: CommunicationPattern


class Report(BaseReport):
    overall_score: Annotated[float, Field(ge=0, le=10)]
