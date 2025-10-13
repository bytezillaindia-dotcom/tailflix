from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ Models ============

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    method: str  # 'phone' or 'email'
    value: str  # phone number or email
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_verified_human: bool = False

class SendOtpRequest(BaseModel):
    method: str  # 'phone' or 'email'
    value: str  # phone number or email

class VerifyOtpRequest(BaseModel):
    method: str
    value: str
    otp: str

class OtpResponse(BaseModel):
    success: bool
    message: str
    mock_otp: Optional[str] = None

class VerifyResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    token: Optional[str] = None

class Pet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pet_name: str
    breed: str
    sex: str  # 'Male' or 'Female'
    birth_year: int
    temperaments: List[str]
    photos: List[str]  # Base64 encoded images
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified: bool = False

class PetCreate(BaseModel):
    pet_name: str
    breed: str
    sex: str
    birth_year: int
    temperaments: List[str]
    photos: List[str]

class Verification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    selfie_url: str
    pet_pose_url: str
    doc_url: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None

class VerificationCreate(BaseModel):
    selfie_url: str
    pet_pose_url: str
    doc_url: Optional[str] = None

class Like(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pet_id: str
    action_type: str  # 'like', 'skip', 'superlike', 'boost'
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LikeCreate(BaseModel):
    pet_id: str
    action_type: str


# ============ Auth Routes ============

@api_router.post("/auth/send-otp", response_model=OtpResponse)
async def send_otp(request: SendOtpRequest):
    """
    Mock OTP sending - accepts any valid phone/email
    In production, this would integrate with SMS/Email service
    """
    try:
        # Validate method
        if request.method not in ['phone', 'email']:
            raise HTTPException(status_code=400, detail="Invalid method. Use 'phone' or 'email'")
        
        # Validate value
        if not request.value or len(request.value) < 3:
            raise HTTPException(status_code=400, detail="Invalid phone number or email")
        
        # Check if user exists, create if not
        user = await db.users.find_one({"method": request.method, "value": request.value})
        
        if not user:
            new_user = User(method=request.method, value=request.value)
            await db.users.insert_one(new_user.dict())
            logger.info(f"New user created: {request.value}")
        
        # Mock OTP - in production, send actual OTP via SMS/Email
        mock_otp = "123456"
        
        logger.info(f"OTP sent to {request.value}: {mock_otp}")
        
        return OtpResponse(
            success=True,
            message="OTP sent successfully (Mock)",
            mock_otp=mock_otp
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")


@api_router.post("/auth/verify-otp", response_model=VerifyResponse)
async def verify_otp(request: VerifyOtpRequest):
    """
    Mock OTP verification - accepts any 6-digit code
    In production, this would verify against stored OTP
    """
    try:
        # Validate OTP format
        if not request.otp or len(request.otp) != 6 or not request.otp.isdigit():
            return VerifyResponse(
                success=False,
                message="Invalid OTP format. Must be 6 digits"
            )
        
        # Find user
        user = await db.users.find_one({"method": request.method, "value": request.value})
        
        if not user:
            return VerifyResponse(
                success=False,
                message="User not found. Please request OTP first."
            )
        
        # Mock verification - accept any 6-digit code
        # In production, verify against stored OTP with expiry check
        
        # Update last login
        await db.users.update_one(
            {"method": request.method, "value": request.value},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Generate mock token (in production, use JWT)
        mock_token = f"token_{user['id']}_{uuid.uuid4().hex[:16]}"
        
        logger.info(f"User logged in: {request.value}")
        
        return VerifyResponse(
            success=True,
            message="Login successful",
            user_id=user['id'],
            token=mock_token
        )
    
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")


# ============ Pet Routes ============

@api_router.post("/pets", response_model=Pet)
async def create_pet(pet_data: PetCreate):
    """
    Create a new pet profile
    For now, we'll use a mock user_id. In production, extract from JWT token
    """
    try:
        # Mock user_id - in production, get from authenticated session
        # For now, get the most recent user or use a default
        recent_user = await db.users.find_one(sort=[("last_login", -1)])
        
        if not recent_user:
            raise HTTPException(status_code=404, detail="No user found. Please login first.")
        
        user_id = recent_user['id']
        
        # Create pet object
        pet = Pet(
            user_id=user_id,
            pet_name=pet_data.pet_name,
            breed=pet_data.breed,
            sex=pet_data.sex,
            birth_year=pet_data.birth_year,
            temperaments=pet_data.temperaments,
            photos=pet_data.photos,
        )
        
        # Save to database
        await db.pets.insert_one(pet.dict())
        
        logger.info(f"New pet added: {pet_data.pet_name} for user {user_id}")
        
        return pet
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating pet: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create pet")


@api_router.get("/pets", response_model=List[Pet])
async def get_pets(user_id: Optional[str] = None):
    """Get all pets or pets for a specific user"""
    try:
        if user_id:
            pets = await db.pets.find({"user_id": user_id}).to_list(1000)
        else:
            pets = await db.pets.find().to_list(1000)
        return [Pet(**pet) for pet in pets]
    except Exception as e:
        logger.error(f"Error fetching pets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pets")


@api_router.get("/pets/feed")
async def get_pet_feed(limit: int = 10):
    """
    Get pet feed for the current user
    - Only shows verified pets from verified users
    - Excludes pets already liked/skipped
    - Excludes user's own pets
    - Mock distance/location for now
    For production: extract user_id from JWT token
    """
    try:
        # Mock user_id - in production, get from authenticated session
        recent_user = await db.users.find_one(sort=[("last_login", -1)])
        
        if not recent_user:
            raise HTTPException(status_code=404, detail="No user found. Please login first.")
        
        current_user_id = recent_user['id']
        
        # Get all pet IDs that the user has already interacted with
        user_interactions = await db.likes.find({"user_id": current_user_id}).to_list(10000)
        interacted_pet_ids = [like['pet_id'] for like in user_interactions]
        
        # Find verified users only
        verified_users = await db.users.find({"is_verified_human": True}).to_list(10000)
        verified_user_ids = [user['id'] for user in verified_users]
        
        # Build query to get eligible pets
        query = {
            "user_id": {"$ne": current_user_id, "$in": verified_user_ids},  # Not user's own pet, from verified users
            "id": {"$nin": interacted_pet_ids}  # Not already interacted with
        }
        
        # Fetch pets
        pets = await db.pets.find(query).limit(limit).to_list(limit)
        
        # Enrich pet data with owner info and mock distance
        enriched_pets = []
        for pet_doc in pets:
            pet = Pet(**pet_doc)
            
            # Get owner info
            owner = await db.users.find_one({"id": pet.user_id})
            
            # Calculate age from birth_year
            current_year = datetime.utcnow().year
            age = current_year - pet.birth_year
            
            # Mock distance (in production, calculate based on user location)
            import random
            mock_distance = round(random.uniform(0.5, 50), 1)
            
            enriched_pet = {
                **pet.dict(),
                "age": age,
                "distance_km": mock_distance,
                "owner_verified": owner.get("is_verified_human", False) if owner else False
            }
            
            enriched_pets.append(enriched_pet)
        
        logger.info(f"Fetched {len(enriched_pets)} pets for feed")
        
        return enriched_pets
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pet feed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pet feed")


# ============ Verification Routes ============

@api_router.get("/likes/daily-count")
async def get_daily_like_count():
    """
    Get the count of actions that count toward daily limit for the current user today
    Counts: like + super_like + boost (excludes skip)
    Used for enforcing daily limits (10 actions per day for free users)
    """
    try:
        # Mock user_id - in production, get from authenticated session
        recent_user = await db.users.find_one(sort=[("last_login", -1)])
        
        if not recent_user:
            raise HTTPException(status_code=404, detail="No user found. Please login first.")
        
        user_id = recent_user['id']
        
        # Get today's date range (start and end of day)
        from datetime import datetime, timedelta
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # Count actions that count toward limit: like + super_like + boost (excludes skip)
        daily_actions_count = await db.likes.count_documents({
            "user_id": user_id,
            "action_type": {"$in": ["like", "super_like", "boost"]},
            "created_at": {
                "$gte": today_start,
                "$lt": today_end
            }
        })
        
        logger.info(f"User {user_id} has {daily_actions_count} limited actions today (like+super_like+boost)")
        
        return {
            "user_id": user_id,
            "daily_likes_count": daily_actions_count,
            "limit": 10,
            "remaining": max(0, 10 - daily_actions_count)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching daily like count: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch daily like count")


@api_router.post("/likes", response_model=Like)
async def create_like(like_data: LikeCreate):
    """
    Record a like/skip/super_like/boost action
    For now, we'll use a mock user_id. In production, extract from JWT token
    """
    try:
        # Validate action_type
        valid_actions = ['like', 'skip', 'super_like', 'boost']
        if like_data.action_type not in valid_actions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid action_type. Must be one of {valid_actions}"
            )
        
        # Mock user_id - in production, get from authenticated session
        recent_user = await db.users.find_one(sort=[("last_login", -1)])
        
        if not recent_user:
            raise HTTPException(status_code=404, detail="No user found. Please login first.")
        
        user_id = recent_user['id']
        
        # Check if pet exists
        pet = await db.pets.find_one({"id": like_data.pet_id})
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        # Create like object
        like = Like(
            user_id=user_id,
            pet_id=like_data.pet_id,
            action_type=like_data.action_type
        )
        
        # Save to database
        await db.likes.insert_one(like.dict())
        
        logger.info(f"User {user_id} performed {like_data.action_type} on pet {like_data.pet_id}")
        
        return like
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating like: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to record action")


@api_router.get("/likes")
async def get_likes(user_id: Optional[str] = None):
    """Get all likes or likes for a specific user"""
    try:
        if user_id:
            likes = await db.likes.find({"user_id": user_id}).to_list(1000)
        else:
            likes = await db.likes.find().to_list(1000)
        return [Like(**like) for like in likes]
    except Exception as e:
        logger.error(f"Error fetching likes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch likes")


# ============ Verification Routes ============

@api_router.post("/verifications", response_model=Verification)
async def create_verification(verification_data: VerificationCreate):
    """
    Create a new verification request
    For now, we'll use a mock user_id. In production, extract from JWT token
    """
    try:
        # Mock user_id - in production, get from authenticated session
        recent_user = await db.users.find_one(sort=[("last_login", -1)])
        
        if not recent_user:
            raise HTTPException(status_code=404, detail="No user found. Please login first.")
        
        user_id = recent_user['id']
        
        # Create verification object
        verification = Verification(
            user_id=user_id,
            selfie_url=verification_data.selfie_url,
            pet_pose_url=verification_data.pet_pose_url,
            doc_url=verification_data.doc_url,
            status="pending"
        )
        
        # Save to database
        await db.verifications.insert_one(verification.dict())
        
        logger.info(f"Verification submitted for user {user_id}")
        
        return verification
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create verification")


@api_router.get("/verifications/status/{user_id}")
async def get_verification_status(user_id: str):
    """
    Get the latest verification status for a user
    Returns: approved, pending, rejected, or not_found
    """
    try:
        # Get the most recent verification for the user
        verification = await db.verifications.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        
        if not verification:
            return {"status": "not_found", "message": "No verification found"}
        
        return {
            "status": verification.get("status", "pending"),
            "created_at": verification.get("created_at"),
            "reviewed_at": verification.get("reviewed_at")
        }
    
    except Exception as e:
        logger.error(f"Error fetching verification status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch verification status")


@api_router.get("/verifications", response_model=List[Verification])
async def get_verifications(user_id: Optional[str] = None):
    """Get all verifications or verifications for a specific user"""
    try:
        if user_id:
            verifications = await db.verifications.find({"user_id": user_id}).to_list(1000)
        else:
            verifications = await db.verifications.find().to_list(1000)
        return [Verification(**verification) for verification in verifications]
    except Exception as e:
        logger.error(f"Error fetching verifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch verifications")


# ============ Admin Routes ============

@api_router.get("/admin/verifications/pending", response_model=List[Verification])
async def get_pending_verifications():
    """Get all pending verifications for admin review"""
    try:
        verifications = await db.verifications.find({"status": "pending"}).to_list(1000)
        return [Verification(**verification) for verification in verifications]
    except Exception as e:
        logger.error(f"Error fetching pending verifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pending verifications")


@api_router.post("/admin/verifications/{verification_id}/approve")
async def approve_verification(verification_id: str, request: dict):
    """
    Approve a verification
    - Updates verification status to approved
    - Sets reviewed_by and reviewed_at
    - Updates user's is_verified_human to true
    """
    try:
        user_id = request.get('user_id')
        
        # Update verification
        result = await db.verifications.update_one(
            {"id": verification_id},
            {
                "$set": {
                    "status": "approved",
                    "reviewed_by": "Admin",  # In production, get from auth token
                    "reviewed_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Verification not found")
        
        # Update user's verification status
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"is_verified_human": True}}
        )
        
        logger.info(f"Verification {verification_id} approved for user {user_id}")
        
        return {"success": True, "message": "Verification approved"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to approve verification")


@api_router.post("/admin/verifications/{verification_id}/reject")
async def reject_verification(verification_id: str):
    """
    Reject a verification
    - Updates verification status to rejected
    - Sets reviewed_by and reviewed_at
    """
    try:
        result = await db.verifications.update_one(
            {"id": verification_id},
            {
                "$set": {
                    "status": "rejected",
                    "reviewed_by": "Admin",  # In production, get from auth token
                    "reviewed_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Verification not found")
        
        logger.info(f"Verification {verification_id} rejected")
        
        return {"success": True, "message": "Verification rejected"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reject verification")


# ============ General Routes ============

@api_router.get("/")
async def root():
    return {
        "message": "TailFlix API - Where pets lead the way to love",
        "version": "1.0.0",
        "endpoints": {
            "auth": ["/api/auth/send-otp", "/api/auth/verify-otp"],
            "users": ["/api/users"],
            "pets": ["/api/pets", "/api/pets/feed"],
            "likes": ["/api/likes", "/api/likes/daily-count"],
            "verifications": ["/api/verifications", "/api/verifications/status/{user_id}"],
            "admin": ["/api/admin/verifications/pending", "/api/admin/verifications/{id}/approve", "/api/admin/verifications/{id}/reject"]
        }
    }


@api_router.get("/users", response_model=List[User])
async def get_users():
    """Get all users (for testing/admin purposes)"""
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
