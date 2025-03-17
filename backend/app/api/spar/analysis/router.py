from fastapi import APIRouter, BackgroundTasks

from app.api.auth.dependencies import NormalUserDep
from app.api.spar.spars.dependencies import ValidUserOwnedOrAdminSparDep
from app.core.dependencies import DBSessionDep

from .controller import (
    analysis_start_state_controller,
    create_analysis_controller,
    get_analysis_controller,
    get_analysis_with_spar_id_controller,
    read_analysis_controller,
    start_analysis_controller,
)
from .models import AnalysisCreate, AnalysisRead, AnalysisState

router = APIRouter()


@router.post("/spars/{spar_id}", response_model=AnalysisRead)
async def start_analysis(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidUserOwnedOrAdminSparDep,
    analysis: AnalysisCreate,
    background_tasks: BackgroundTasks,
):
    """
    Start the analysis of a Spar.
    """
    analysis_found = read_analysis_controller(db=db, user=user, spar=spar, analysis=analysis)
    if analysis_found:
        if analysis_found.state == AnalysisState.started or analysis_found.state == AnalysisState.in_progress:
            return analysis_found
        else:
            analysis_created = analysis_start_state_controller(db=db, user=user, spar=spar, analysis=analysis_found)
    else:
        analysis_created = create_analysis_controller(db=db, user=user, spar=spar, analysis=analysis)
    background_tasks.add_task(
        start_analysis_controller, db=db, user_id=user.id, spar_id=spar.id, analysis_id=analysis_created.id
    )

    return analysis_created


@router.get("/{analysis_id}", response_model=AnalysisRead)
def get_analysis(db: DBSessionDep, user: NormalUserDep, analysis_id: int):
    return get_analysis_controller(db=db, user=user, analysis_id=analysis_id)


@router.get("/spars/{spar_id}", response_model=AnalysisRead)
def get_analysis_with_spar_id(db: DBSessionDep, user: NormalUserDep, spar_id: int):
    return get_analysis_with_spar_id_controller(db=db, user=user, spar_id=spar_id)
