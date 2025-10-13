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

class VerificationCreate(BaseModel):
    selfie_url: str
    pet_pose_url: str
    doc_url: Optional[str] = None


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


# ============ General Routes ============

@api_router.get("/")
async def root():
    return {
        "message": "TailFlix API - Where pets lead the way to love",
        "version": "1.0.0",
        "endpoints": {
            "auth": ["/api/auth/send-otp", "/api/auth/verify-otp"],
            "users": ["/api/users"],
            "pets": ["/api/pets"],
            "verifications": ["/api/verifications", "/api/verifications/status/{user_id}"]
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
