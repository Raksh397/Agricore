import json
import os
import time
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
POSTS_FILE = os.path.join(DATA_DIR, "community_posts.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _load():
    if not os.path.exists(POSTS_FILE):
        return []
    try:
        with open(POSTS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _save(posts):
    with open(POSTS_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=1)


@router.get("/community/posts")
def list_posts(crop: str = "", q: str = ""):
    posts = _load()
    if crop:
        posts = [p for p in posts if p["crop"].lower() == crop.lower()]
    if q:
        ql = q.lower()
        posts = [p for p in posts if ql in p["title"].lower() or ql in p["body"].lower() or ql in p["crop"].lower()]
    return {"posts": sorted(posts, key=lambda p: p["created_at"], reverse=True)}


@router.post("/community/posts")
async def create_post(
    author: str = Form(...),
    crop: str = Form(...),
    title: str = Form(...),
    body: str = Form(""),
    location: str = Form("India"),
    image: UploadFile = File(None),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1].lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        fname = f"{uuid.uuid4().hex}{ext}"
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
            f.write(await image.read())
        image_url = f"/uploads/{fname}"

    post = {
        "id": uuid.uuid4().hex,
        "author": author.strip() or "Farmer",
        "crop": crop,
        "title": title.strip(),
        "body": body.strip(),
        "location": location.strip() or "India",
        "image": image_url,
        "likes": 0,
        "dislikes": 0,
        "answers": [],
        "created_at": time.time(),
    }
    posts = _load()
    posts.append(post)
    _save(posts)
    return post


@router.post("/community/posts/{post_id}/vote")
def vote(post_id: str, payload: dict):
    posts = _load()
    for p in posts:
        if p["id"] == post_id:
            if payload.get("type") == "up":
                p["likes"] += 1
            else:
                p["dislikes"] += 1
            _save(posts)
            return {"likes": p["likes"], "dislikes": p["dislikes"]}
    raise HTTPException(status_code=404, detail="Post not found")


@router.post("/community/posts/{post_id}/answers")
def add_answer(post_id: str, payload: dict):
    text = (payload.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Answer text is required")
    posts = _load()
    for p in posts:
        if p["id"] == post_id:
            answer = {
                "id": uuid.uuid4().hex,
                "author": (payload.get("author") or "Farmer").strip(),
                "text": text,
                "created_at": time.time(),
            }
            p["answers"].append(answer)
            _save(posts)
            return answer
    raise HTTPException(status_code=404, detail="Post not found")
