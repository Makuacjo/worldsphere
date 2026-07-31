"""Authenticated travel workspace API with strict per-user ownership."""
from __future__ import annotations

import json
from datetime import date
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator

from app import auth, db

router = APIRouter(prefix="/account", tags=["Account workspace"])


def not_found(label: str = "Resource") -> HTTPException:
    return HTTPException(status_code=404, detail=f"{label} not found.")


def page_limit(value: int) -> int:
    return min(max(value, 1), 100)


def activity(user_id: int, event_type: str, label: str, resource_type: str | None = None,
             resource_id: str | None = None, metadata: dict | None = None, conn=None) -> None:
    def write(connection):
        connection.execute(
            "INSERT INTO user_activity (user_id,event_type,resource_type,resource_id,label,metadata) "
            "VALUES (%s,%s,%s,%s,%s,%s)",
            (user_id, event_type[:48], resource_type, resource_id, label[:300], json.dumps(metadata or {})),
        )
        connection.execute(
            "DELETE FROM user_activity WHERE user_id=%s AND id NOT IN "
            "(SELECT id FROM user_activity WHERE user_id=%s ORDER BY created_at DESC LIMIT 500)",
            (user_id, user_id),
        )
    if conn is not None:
        write(conn)
    else:
        with db.connect() as connection:
            write(connection)


class TripInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    resourceType: str | None = Field(default=None, max_length=32)
    resourceId: str | None = Field(default=None, max_length=255)
    destination: str | None = Field(default=None, max_length=200)
    startDate: date | None = None
    endDate: date | None = None
    travelers: int = Field(default=1, ge=1, le=100)
    notes: str = Field(default="", max_length=5000)
    itinerary: dict[str, Any] = Field(default_factory=dict)

    @field_validator("endDate")
    @classmethod
    def valid_dates(cls, value, info):
        start = info.data.get("startDate")
        if value and start and value < start:
            raise ValueError("End date cannot be before start date.")
        return value


class TripPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    destination: str | None = Field(default=None, max_length=200)
    startDate: date | None = None
    endDate: date | None = None
    travelers: int | None = Field(default=None, ge=1, le=100)
    notes: str | None = Field(default=None, max_length=5000)
    itinerary: dict[str, Any] | None = None


class PlanInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    destination: str = Field(min_length=1, max_length=200)
    savedTripId: int | None = Field(default=None, ge=1)
    conversationId: str | None = Field(default=None, max_length=64)
    inputs: dict[str, Any] = Field(default_factory=dict)
    planText: str = Field(min_length=1, max_length=100000)


class PlanPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    destination: str | None = Field(default=None, min_length=1, max_length=200)
    savedTripId: int | None = Field(default=None, ge=1)
    conversationId: str | None = Field(default=None, max_length=64)
    inputs: dict[str, Any] | None = None
    planText: str | None = Field(default=None, min_length=1, max_length=100000)


class ExpenseInput(BaseModel):
    category: str = Field(min_length=1, max_length=64)
    label: str = Field(min_length=1, max_length=120)
    amountMinor: int = Field(ge=0, le=9_000_000_000_000)


class BudgetInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    targetMinor: int = Field(default=0, ge=0, le=9_000_000_000_000)
    travelers: int = Field(default=1, ge=1, le=100)
    durationDays: int = Field(default=1, ge=1, le=365)
    savedTripId: int | None = Field(default=None, ge=1)
    expenses: list[ExpenseInput] = Field(default_factory=list, max_length=100)


class ActivityInput(BaseModel):
    eventType: Literal["destination_viewed", "attraction_viewed"]
    resourceType: str = Field(min_length=1, max_length=32)
    resourceId: str = Field(min_length=1, max_length=255)
    label: str = Field(min_length=1, max_length=300)


class SearchInput(BaseModel):
    query: str = Field(min_length=1, max_length=300)
    scope: str = Field(default="site", min_length=1, max_length=32)


def trip_dict(row) -> dict:
    return {"id": row["id"], "title": row["title"], "resourceType": row["resource_type"],
            "resourceId": row["resource_id"], "destination": row["destination"],
            "startDate": row["start_date"], "endDate": row["end_date"],
            "travelers": row["travelers"], "notes": row["notes"], "itinerary": row["itinerary"],
            "createdAt": row["created_at"], "updatedAt": row["updated_at"]}


def plan_dict(row) -> dict:
    return {"id": row["id"], "savedTripId": row["saved_trip_id"],
            "conversationId": row["conversation_id"], "title": row["title"],
            "destination": row["destination"], "inputs": row["inputs"],
            "planText": row["plan_text"], "createdAt": row["created_at"],
            "updatedAt": row["updated_at"]}

def budget_dict(conn, row) -> dict:
    expenses = conn.execute("SELECT id,category,label,amount_minor FROM budget_expenses WHERE budget_plan_id=%s ORDER BY position,id", (row["id"],)).fetchall()
    items = [{"id": x["id"], "category": x["category"], "label": x["label"], "amountMinor": x["amount_minor"]} for x in expenses]
    total = sum(x["amountMinor"] for x in items)
    return {"id": row["id"], "savedTripId": row["saved_trip_id"], "title": row["title"],
            "currency": row["currency"], "targetMinor": row["target_minor"],
            "travelers": row["travelers"], "durationDays": row["duration_days"],
            "expenses": items, "totalMinor": total,
            "remainingMinor": row["target_minor"] - total,
            "perTravelerMinor": total // row["travelers"],
            "perDayMinor": total // row["duration_days"],
            "createdAt": row["created_at"], "updatedAt": row["updated_at"]}


def owned_trip(conn, trip_id: int, user_id: int):
    row = conn.execute("SELECT * FROM saved_trips WHERE id=%s AND user_id=%s", (trip_id, user_id)).fetchone()
    if not row: raise not_found("Trip")
    return row


def validate_links(conn, user_id: int, trip_id: int | None = None, conversation_id: str | None = None):
    if trip_id is not None: owned_trip(conn, trip_id, user_id)
    if conversation_id is not None:
        found = conn.execute("SELECT id FROM ai_conversations WHERE id=%s AND user_id=%s", (conversation_id, user_id)).fetchone()
        if not found: raise not_found("Conversation")


@router.get("/dashboard")
def dashboard(user: dict = Depends(auth.current_user)) -> dict:
    with db.connect() as conn:
        trips = conn.execute("SELECT * FROM saved_trips WHERE user_id=%s ORDER BY updated_at DESC LIMIT 6", (user["id"],)).fetchall()
        plans = conn.execute("SELECT * FROM trip_plans WHERE user_id=%s ORDER BY updated_at DESC LIMIT 6", (user["id"],)).fetchall()
        budgets = conn.execute("SELECT * FROM budget_plans WHERE user_id=%s ORDER BY updated_at DESC LIMIT 6", (user["id"],)).fetchall()
        favorites = conn.execute("SELECT id,key,source,name,scientific_name,image,created_at FROM favorites WHERE user_id=%s ORDER BY created_at DESC LIMIT 8", (user["id"],)).fetchall()
        events = conn.execute("SELECT * FROM user_activity WHERE user_id=%s ORDER BY created_at DESC LIMIT 15", (user["id"],)).fetchall()
        chats = conn.execute(
            "SELECT c.id,c.assistant_type,c.title,c.created_at,c.updated_at,"
            "COALESCE((SELECT left(m.content,180) FROM ai_messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC,m.id DESC LIMIT 1),'') preview "
            "FROM ai_conversations c WHERE c.user_id=%s ORDER BY c.updated_at DESC LIMIT 6", (user["id"],)).fetchall()
        return {"trips": [trip_dict(x) for x in trips],
                "plans": [{"id":x["id"],"title":x["title"],"destination":x["destination"],"conversationId":x["conversation_id"],"updatedAt":x["updated_at"]} for x in plans],
                "budgets": [budget_dict(conn, x) for x in budgets],
                "favorites": [{"id":x["id"],"key":x["key"],"source":x["source"],"name":x["name"],"scientificName":x["scientific_name"],"image":x["image"],"createdAt":x["created_at"]} for x in favorites],
                "activity": [{"id":x["id"],"eventType":x["event_type"],"resourceType":x["resource_type"],"resourceId":x["resource_id"],"label":x["label"],"metadata":x["metadata"],"createdAt":x["created_at"]} for x in events],
                "conversations": [{"id":x["id"],"assistantType":x["assistant_type"],"title":x["title"],"preview":x["preview"],"createdAt":x["created_at"],"updatedAt":x["updated_at"]} for x in chats]}


@router.get("/trips")
def list_trips(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0), user: dict = Depends(auth.current_user)):
    with db.connect() as conn:
        rows = conn.execute("SELECT * FROM saved_trips WHERE user_id=%s ORDER BY updated_at DESC LIMIT %s OFFSET %s", (user["id"], page_limit(limit), offset)).fetchall()
    return [trip_dict(x) for x in rows]


@router.post("/trips", status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripInput, user: dict = Depends(auth.current_user)):
    with db.connect() as conn:
        try:
            row = conn.execute("INSERT INTO saved_trips (user_id,title,resource_type,resource_id,destination,start_date,end_date,travelers,notes,itinerary) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *",
                (user["id"],payload.title.strip(),payload.resourceType,payload.resourceId,payload.destination,payload.startDate,payload.endDate,payload.travelers,payload.notes,json.dumps(payload.itinerary))).fetchone()
        except Exception as exc:
            if getattr(exc, "sqlstate", None) == "23505": raise HTTPException(409, "This destination is already saved as a trip.") from exc
            raise
        activity(user["id"],"trip_saved",payload.title,"trip",str(row["id"]),conn=conn)
    return trip_dict(row)


@router.get("/trips/{trip_id}")
def get_trip(trip_id: int, user: dict = Depends(auth.current_user)):
    with db.connect() as conn: return trip_dict(owned_trip(conn, trip_id, user["id"]))


@router.patch("/trips/{trip_id}")
def update_trip(trip_id: int, payload: TripPatch, user: dict = Depends(auth.current_user)):
    updates = payload.model_dump(exclude_unset=True)
    mapping = {"startDate":"start_date","endDate":"end_date"}
    with db.connect() as conn:
        owned_trip(conn, trip_id, user["id"])
        if updates:
            fields=[]; args=[]
            for key,value in updates.items():
                fields.append(f"{mapping.get(key,key)}=%s"); args.append(json.dumps(value) if key=="itinerary" else value)
            conn.execute(f"UPDATE saved_trips SET {','.join(fields)},updated_at=CURRENT_TIMESTAMP WHERE id=%s AND user_id=%s",(*args,trip_id,user["id"]))
        row=owned_trip(conn,trip_id,user["id"])
        activity(user["id"],"trip_updated",row["title"],"trip",str(trip_id),conn=conn)
    return trip_dict(row)


@router.delete("/trips/{trip_id}", status_code=204)
def delete_trip(trip_id: int, user: dict = Depends(auth.current_user)):
    with db.connect() as conn:
        row=owned_trip(conn,trip_id,user["id"]); conn.execute("DELETE FROM saved_trips WHERE id=%s AND user_id=%s",(trip_id,user["id"]))
        activity(user["id"],"trip_deleted",row["title"],"trip",str(trip_id),conn=conn)


@router.post("/trips/{trip_id}/duplicate", status_code=201)
def duplicate_trip(trip_id: int, user: dict = Depends(auth.current_user)):
    with db.connect() as conn:
        source=owned_trip(conn,trip_id,user["id"])
        row=conn.execute("INSERT INTO saved_trips(user_id,title,destination,start_date,end_date,travelers,notes,itinerary) VALUES(%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *",
          (user["id"],f"{source['title']} copy",source["destination"],source["start_date"],source["end_date"],source["travelers"],source["notes"],json.dumps(source["itinerary"]))).fetchone()
        activity(user["id"],"trip_saved",row["title"],"trip",str(row["id"]),conn=conn)
    return trip_dict(row)


@router.get("/plans")
def list_plans(limit:int=Query(20,ge=1,le=100),offset:int=Query(0,ge=0),user:dict=Depends(auth.current_user)):
    with db.connect() as conn: rows=conn.execute("SELECT * FROM trip_plans WHERE user_id=%s ORDER BY updated_at DESC LIMIT %s OFFSET %s",(user["id"],limit,offset)).fetchall()
    return [plan_dict(x) for x in rows]


@router.post("/plans", status_code=201)
def create_plan(payload:PlanInput,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        validate_links(conn,user["id"],payload.savedTripId,payload.conversationId)
        row=conn.execute("INSERT INTO trip_plans(user_id,saved_trip_id,conversation_id,title,destination,inputs,plan_text) VALUES(%s,%s,%s,%s,%s,%s,%s) RETURNING *",(user["id"],payload.savedTripId,payload.conversationId,payload.title.strip(),payload.destination.strip(),json.dumps(payload.inputs),payload.planText)).fetchone()
        activity(user["id"],"trip_plan_generated",row["title"],"trip_plan",str(row["id"]),conn=conn)
    return plan_dict(row)


@router.get("/plans/{plan_id}")
def get_plan(plan_id: int, user: dict = Depends(auth.current_user)):
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM trip_plans WHERE id=%s AND user_id=%s", (plan_id, user["id"])).fetchone()
        if not row:
            raise not_found("Trip plan")
    return plan_dict(row)

@router.patch("/plans/{plan_id}")
def update_plan(plan_id:int,payload:PlanPatch,user:dict=Depends(auth.current_user)):
    updates=payload.model_dump(exclude_unset=True); mapping={"savedTripId":"saved_trip_id","conversationId":"conversation_id","planText":"plan_text"}
    with db.connect() as conn:
        if not conn.execute("SELECT id FROM trip_plans WHERE id=%s AND user_id=%s",(plan_id,user["id"])).fetchone(): raise not_found("Trip plan")
        validate_links(conn,user["id"],updates.get("savedTripId"),updates.get("conversationId"))
        if updates:
            fields=[];args=[]
            for key,value in updates.items(): fields.append(f"{mapping.get(key,key)}=%s");args.append(json.dumps(value) if key=="inputs" else value)
            conn.execute(f"UPDATE trip_plans SET {','.join(fields)},updated_at=CURRENT_TIMESTAMP WHERE id=%s AND user_id=%s",(*args,plan_id,user["id"]))
        row=conn.execute("SELECT * FROM trip_plans WHERE id=%s AND user_id=%s",(plan_id,user["id"])).fetchone()
    return plan_dict(row)


@router.delete("/plans/{plan_id}",status_code=204)
def delete_plan(plan_id:int,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        result=conn.execute("DELETE FROM trip_plans WHERE id=%s AND user_id=%s RETURNING id",(plan_id,user["id"])).fetchone()
        if not result: raise not_found("Trip plan")


@router.get("/budgets")
def list_budgets(limit:int=Query(20,ge=1,le=100),offset:int=Query(0,ge=0),user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        rows=conn.execute("SELECT * FROM budget_plans WHERE user_id=%s ORDER BY updated_at DESC LIMIT %s OFFSET %s",(user["id"],limit,offset)).fetchall(); return [budget_dict(conn,x) for x in rows]


def write_budget(conn,user_id:int,payload:BudgetInput,budget_id:int|None=None):
    validate_links(conn,user_id,payload.savedTripId)
    if budget_id is None:
        row=conn.execute("INSERT INTO budget_plans(user_id,saved_trip_id,title,currency,target_minor,travelers,duration_days) VALUES(%s,%s,%s,%s,%s,%s,%s) RETURNING *",(user_id,payload.savedTripId,payload.title.strip(),payload.currency,payload.targetMinor,payload.travelers,payload.durationDays)).fetchone()
    else:
        if not conn.execute("SELECT id FROM budget_plans WHERE id=%s AND user_id=%s",(budget_id,user_id)).fetchone(): raise not_found("Budget")
        row=conn.execute("UPDATE budget_plans SET saved_trip_id=%s,title=%s,currency=%s,target_minor=%s,travelers=%s,duration_days=%s,updated_at=CURRENT_TIMESTAMP WHERE id=%s AND user_id=%s RETURNING *",(payload.savedTripId,payload.title.strip(),payload.currency,payload.targetMinor,payload.travelers,payload.durationDays,budget_id,user_id)).fetchone()
        conn.execute("DELETE FROM budget_expenses WHERE budget_plan_id=%s",(budget_id,))
    for pos,item in enumerate(payload.expenses): conn.execute("INSERT INTO budget_expenses(budget_plan_id,category,label,amount_minor,position) VALUES(%s,%s,%s,%s,%s)",(row["id"],item.category,item.label,item.amountMinor,pos))
    return row


@router.post("/budgets",status_code=201)
def create_budget(payload:BudgetInput,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        row=write_budget(conn,user["id"],payload);activity(user["id"],"budget_created",row["title"],"budget",str(row["id"]),conn=conn);return budget_dict(conn,row)


@router.get("/budgets/{budget_id}")
def get_budget(budget_id: int, user: dict = Depends(auth.current_user)):
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM budget_plans WHERE id=%s AND user_id=%s", (budget_id, user["id"])).fetchone()
        if not row:
            raise not_found("Budget")
        return budget_dict(conn, row)

@router.put("/budgets/{budget_id}")
def update_budget(budget_id:int,payload:BudgetInput,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        row=write_budget(conn,user["id"],payload,budget_id);activity(user["id"],"budget_updated",row["title"],"budget",str(row["id"]),conn=conn);return budget_dict(conn,row)


@router.delete("/budgets/{budget_id}",status_code=204)
def delete_budget(budget_id:int,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        row=conn.execute("DELETE FROM budget_plans WHERE id=%s AND user_id=%s RETURNING id",(budget_id,user["id"])).fetchone()
        if not row: raise not_found("Budget")


@router.post("/budgets/{budget_id}/duplicate",status_code=201)
def duplicate_budget(budget_id:int,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        source=conn.execute("SELECT * FROM budget_plans WHERE id=%s AND user_id=%s",(budget_id,user["id"])).fetchone()
        if not source: raise not_found("Budget")
        expenses=conn.execute("SELECT category,label,amount_minor FROM budget_expenses WHERE budget_plan_id=%s ORDER BY position,id",(budget_id,)).fetchall()
        payload=BudgetInput(title=f"{source['title']} copy",currency=source["currency"],targetMinor=source["target_minor"],travelers=source["travelers"],durationDays=source["duration_days"],savedTripId=source["saved_trip_id"],expenses=[ExpenseInput(category=x["category"],label=x["label"],amountMinor=x["amount_minor"]) for x in expenses])
        row=write_budget(conn,user["id"],payload);activity(user["id"],"budget_created",row["title"],"budget",str(row["id"]),conn=conn);return budget_dict(conn,row)


@router.get("/activity")
def list_activity(limit:int=Query(30,ge=1,le=100),offset:int=Query(0,ge=0),user:dict=Depends(auth.current_user)):
    with db.connect() as conn: rows=conn.execute("SELECT * FROM user_activity WHERE user_id=%s ORDER BY created_at DESC LIMIT %s OFFSET %s",(user["id"],limit,offset)).fetchall()
    return [dict(x) for x in rows]

@router.post("/activity",status_code=204)
def record_activity(payload:ActivityInput,user:dict=Depends(auth.current_user)):
    activity(user["id"],payload.eventType,payload.label,payload.resourceType,payload.resourceId)


@router.post("/searches",status_code=204)
def record_search(payload:SearchInput,user:dict=Depends(auth.current_user)):
    with db.connect() as conn:
        conn.execute("INSERT INTO search_history(user_id,query,scope) VALUES(%s,%s,%s)",(user["id"],payload.query.strip(),payload.scope))
        conn.execute("DELETE FROM search_history WHERE user_id=%s AND id NOT IN (SELECT id FROM search_history WHERE user_id=%s ORDER BY created_at DESC LIMIT 100)",(user["id"],user["id"]))
        activity(user["id"],"search",f"Searched for {payload.query.strip()}","search",None,{"scope":payload.scope},conn)