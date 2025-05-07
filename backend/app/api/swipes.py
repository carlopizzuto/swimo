from fastapi import APIRouter, Depends
from sqlmodel import select
from ..models import Swipe
from ..db import get_session

router = APIRouter()

@router.post("/", response_model=Swipe, status_code=201)
@router.post("", response_model=Swipe, status_code=201)
def create_swipe(swipe: Swipe, session=Depends(get_session)):
    swipe.user_id = 1                 # hard‑coded user for now
    session.add(swipe)
    session.commit()
    session.refresh(swipe)
    return swipe


@router.get("/{user_id}/", response_model=list[Swipe])
@router.get("/{user_id}", response_model=list[Swipe])
def get_swipes(user_id: int, session=Depends(get_session)):
    swipes = session.exec(select(Swipe).where(Swipe.user_id == user_id)).all()
    return swipes