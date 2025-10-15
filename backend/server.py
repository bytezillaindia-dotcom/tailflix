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
    is_premium: bool = False  # Premium subscription status
    golden_bones_used_this_month: int = 0  # Count of golden_bones used this month
    golden_bones_reset_date: Optional[datetime] = None  # Last reset date (first day of month)
    tail_coins: int = 0  # TailCoins balance
    daily_likes_count: int = 0  # Number of free likes used today
    daily_likes_reset_date: Optional[datetime] = None  # Last reset date for daily likes

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
    sex: Optional[str] = None  # 'Male' or 'Female'
    birth_year: int
    temperaments: Optional[List[str]] = []
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
    action_type: str  # 'like', 'skip', 'super_like', 'golden_bone'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    seen: bool = False  # Whether recipient has seen this like notification

class LikeCreate(BaseModel):
    pet_id: str
    action_type: str

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    pet1_id: str
    pet2_id: str
    match_type: str  # 'like', 'super_like', 'golden_bone' - what triggered the match
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessageCreate(BaseModel):
    match_id: str
    message: str

class TailCoinsTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'earn' or 'spend'
    amount: int
    source: str  # Description of transaction (e.g., "Purchase ₹99", "Super Like", "Daily Reward")
    created_at: datetime = Field(default_factory=datetime.utcnow)


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
async def create_pet(pet_data: PetCreate, user_id: Optional[str] = None):
    """
    Create a new pet profile
    Accepts user_id as query parameter or uses most recent user as fallback
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
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


@api_router.get("/users/{user_id}/has-pets")
async def check_user_has_pets(user_id: str):
    """Check if a user has any pets"""
    try:
        pet_count = await db.pets.count_documents({"user_id": user_id})
        return {
            "user_id": user_id,
            "has_pets": pet_count > 0,
            "pet_count": pet_count
        }
    except Exception as e:
        logger.error(f"Error checking user pets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check user pets")


@api_router.get("/pets/feed")
async def get_pet_feed(user_id: Optional[str] = None, limit: int = 10, debug: bool = False):
    """
    Get pet feed for the current user
    REQUIRES: User must be verified (is_verified_human=true)
    - Only shows verified pets from verified users
    - Excludes pets already liked/skipped
    - Excludes user's own pets
    - Mock distance/location for now
    
    Accepts user_id as query parameter or uses most recent user as fallback
    Debug mode: Set ?debug=true to see first 5 pets regardless of filters
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            current_user_id = recent_user['id']
            is_verified = recent_user.get('is_verified_human', False)
        else:
            # Fetch user by user_id
            user = await db.users.find_one({"id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            current_user_id = user_id
            is_verified = user.get('is_verified_human', False)
        
        # DEBUG LOGGING
        logger.info("="*80)
        logger.info("DEBUG: PET FEED FILTERING")
        logger.info("="*80)
        
        # 1. Log total pets in database
        total_pets_count = await db.pets.count_documents({})
        logger.info(f"1. TOTAL PETS IN DATABASE: {total_pets_count}")
        
        # SERVER-SIDE VERIFICATION GUARD
        if not is_verified and not debug:
            logger.warning(f"User {current_user_id} (unverified) attempted to access pet feed - blocked")
            return {
                "error": "verification_required",
                "message": "You must be verified to access the pet feed. Please complete verification.",
                "redirect": "/verify"
            }
        
        # 2. Log user's own pets (excluded)
        own_pets_count = await db.pets.count_documents({"user_id": current_user_id})
        logger.info(f"2. EXCLUDED (own pets): {own_pets_count} pets belong to current user")
        
        # 3. Log already liked/skipped pets (excluded)
        user_interactions = await db.likes.find({"user_id": current_user_id}).to_list(10000)
        interacted_pet_ids = [like['pet_id'] for like in user_interactions]
        logger.info(f"3. EXCLUDED (already interacted): {len(interacted_pet_ids)} pets already liked/skipped")
        
        # 4. Log verified vs unverified users
        verified_users = await db.users.find({"is_verified_human": True}).to_list(10000)
        verified_user_ids = [user['id'] for user in verified_users]
        total_users_count = await db.users.count_documents({})
        unverified_users_count = total_users_count - len(verified_user_ids)
        logger.info(f"4. VERIFIED USERS: {len(verified_user_ids)} verified, {unverified_users_count} unverified")
        
        # 5. Count pets from unverified users (excluded)
        unverified_pets_count = await db.pets.count_documents({
            "user_id": {"$nin": verified_user_ids}
        })
        logger.info(f"5. EXCLUDED (unverified owners): {unverified_pets_count} pets from unverified users")
        
        # DEBUG MODE: Return first 5 pets regardless of filters
        if debug:
            logger.info("="*80)
            logger.info("DEBUG MODE ENABLED: Returning first 5 pets WITHOUT filters")
            logger.info("="*80)
            
            debug_pets = await db.pets.find().limit(5).to_list(5)
            debug_result = []
            
            for pet_doc in debug_pets:
                pet = Pet(**pet_doc)
                owner = await db.users.find_one({"id": pet.user_id})
                current_year = datetime.utcnow().year
                age = current_year - pet.birth_year
                
                debug_result.append({
                    **pet.dict(),
                    "age": age,
                    "distance_km": 5.0,
                    "owner_verified": owner.get("is_verified_human", False) if owner else False,
                    "owner_id": pet.user_id,
                    "is_own_pet": pet.user_id == current_user_id,
                    "is_interacted": pet.id in interacted_pet_ids
                })
            
            logger.info(f"Returning {len(debug_result)} pets in DEBUG mode")
            return debug_result
        
        # NORMAL MODE: Apply all filters
        logger.info("="*80)
        logger.info("APPLYING FILTERS")
        logger.info("="*80)
        
        # Build query to get eligible pets
        query = {
            "user_id": {"$ne": current_user_id, "$in": verified_user_ids},  # Not user's own pet, from verified users
            "id": {"$nin": interacted_pet_ids}  # Not already interacted with
        }
        
        # Count eligible pets before limit
        eligible_count = await db.pets.count_documents(query)
        logger.info(f"ELIGIBLE PETS (after all filters): {eligible_count}")
        
        # Fetch pets
        pets = await db.pets.find(query).limit(limit).to_list(limit)
        logger.info(f"RETURNING: {len(pets)} pets (limit={limit})")
        
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
        
        logger.info("="*80)
        logger.info(f"FINAL RESULT: {len(enriched_pets)} pets returned")
        logger.info("="*80)
        
        return enriched_pets
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pet feed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pet feed")


# ============ Verification Routes ============

@api_router.get("/likes/daily-count")
async def get_daily_like_count(user_id: Optional[str] = None):
    """
    Get the count of actions that count toward daily limit for the current user today
    Counts: like + super_like + golden_bone (excludes skip)
    Used for enforcing daily limits (10 actions per day for free users)
    Also returns user's premium status and Golden Bone monthly count (5/month for premium)
    
    Accepts user_id as query parameter or uses most recent user as fallback
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
            is_premium = recent_user.get('is_premium', False)
            golden_bones_used_this_month = recent_user.get('golden_bones_used_this_month', 0)
            golden_bones_reset_date = recent_user.get('golden_bones_reset_date')
        else:
            # Fetch user by user_id
            user = await db.users.find_one({"id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            is_premium = user.get('is_premium', False)
            golden_bones_used_this_month = user.get('golden_bones_used_this_month', 0)
            golden_bones_reset_date = user.get('golden_bones_reset_date')
        
        # Get today's date range (start and end of day)
        from datetime import datetime, timedelta
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # Check if we need to reset golden_bones count (new month)
        current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Reset golden_bones count if we're in a new month
        if not golden_bones_reset_date or golden_bones_reset_date < current_month_start:
            await db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "golden_bones_used_this_month": 0,
                        "golden_bones_reset_date": current_month_start
                    }
                }
            )
            golden_bones_used_this_month = 0
            logger.info(f"Reset golden_bones for user {user_id} (new month)")
        
        # Count actions that count toward limit: like + super_like + golden_bone (excludes skip)
        daily_actions_count = await db.likes.count_documents({
            "user_id": user_id,
            "action_type": {"$in": ["like", "super_like", "golden_bone"]},
            "created_at": {
                "$gte": today_start,
                "$lt": today_end
            }
        })
        
        # Golden Bones: 5 per month for premium users
        golden_bones_limit = 5 if is_premium else 0
        golden_bones_remaining = max(0, golden_bones_limit - golden_bones_used_this_month)
        
        logger.info(f"User {user_id} (premium={is_premium}) has {daily_actions_count} limited actions today, {golden_bones_remaining} golden_bones remaining")
        
        return {
            "user_id": user_id,
            "is_premium": is_premium,
            "daily_likes_count": daily_actions_count,
            "limit": 10,
            "remaining": max(0, 10 - daily_actions_count),
            "golden_bones_used": golden_bones_used_this_month,
            "golden_bones_limit": golden_bones_limit,
            "golden_bones_remaining": golden_bones_remaining
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching daily like count: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch daily like count")


@api_router.post("/likes")
async def create_like(like_data: LikeCreate, user_id: Optional[str] = None):
    """
    Record a like/skip/super_like/golden_bone action with TailCoins economy
    - Daily 10 free likes, then 1 TailCoin per like
    - Super Like: 5 TailCoins
    - Golden Bone: 50 TailCoins
    - Skip: Always free, unlimited
    - Premium users: Unlimited free likes
    
    Accepts user_id as query parameter or uses most recent user as fallback
    """
    try:
        # Validate action_type
        valid_actions = ['like', 'skip', 'super_like', 'golden_bone']
        if like_data.action_type not in valid_actions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid action_type. Must be one of {valid_actions}"
            )
        
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
            user = recent_user
        else:
            # Fetch user by user_id
            user = await db.users.find_one({"id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        
        is_premium = user.get('is_premium', False)
        tail_coins = user.get('tail_coins', 0)
        daily_likes_count = user.get('daily_likes_count', 0)
        daily_likes_reset_date = user.get('daily_likes_reset_date')
        
        # Reset daily counter if it's a new day
        from datetime import datetime, timedelta
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if not daily_likes_reset_date or daily_likes_reset_date < today_start:
            # Reset daily counter
            daily_likes_count = 0
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "daily_likes_count": 0,
                    "daily_likes_reset_date": today_start
                }}
            )
            logger.info(f"Reset daily likes counter for user {user_id}")
        
        # TAILCOINS ECONOMY LOGIC
        coins_to_deduct = 0
        
        if like_data.action_type == 'skip':
            # Skip is always free and unlimited
            pass
        
        elif like_data.action_type == 'like':
            # Regular like: 10 free per day, then 1 TailCoin each
            if not is_premium:
                if daily_likes_count >= 10:
                    # Need TailCoins for extra likes
                    coins_to_deduct = 1
                    if tail_coins < coins_to_deduct:
                        logger.warning(f"User {user_id} out of TailCoins for extra like. Has: {tail_coins}")
                        return {
                            "error": "insufficient_coins",
                            "message": "Out of free likes! Buy TailCoins or upgrade to Premium for unlimited likes.",
                            "tail_coins": tail_coins,
                            "coins_needed": coins_to_deduct,
                            "daily_likes_used": daily_likes_count,
                            "daily_likes_limit": 10
                        }
                # else: free like (within daily limit)
            # Premium users get unlimited free likes
        
        elif like_data.action_type == 'super_like':
            # Super Like: 5 TailCoins (or free for premium)
            if not is_premium:
                coins_to_deduct = 5
                if tail_coins < coins_to_deduct:
                    logger.warning(f"User {user_id} insufficient TailCoins for super_like. Has: {tail_coins}, needs: {coins_to_deduct}")
                    return {
                        "error": "insufficient_coins",
                        "message": "Not enough TailCoins for Super Like! Buy more coins or upgrade to Premium.",
                        "tail_coins": tail_coins,
                        "coins_needed": coins_to_deduct,
                        "action_type": "super_like"
                    }
        
        elif like_data.action_type == 'golden_bone':
            # Golden Bone: 50 TailCoins (or free for premium)
            if not is_premium:
                coins_to_deduct = 50
                if tail_coins < coins_to_deduct:
                    logger.warning(f"User {user_id} insufficient TailCoins for golden_bone. Has: {tail_coins}, needs: {coins_to_deduct}")
                    return {
                        "error": "insufficient_coins",
                        "message": "Not enough TailCoins for Golden Bone Boost! Buy more coins or upgrade to Premium.",
                        "tail_coins": tail_coins,
                        "coins_needed": coins_to_deduct,
                        "action_type": "golden_bone"
                    }
        
        # Check if pet exists and get owner info
        liked_pet = await db.pets.find_one({"id": like_data.pet_id})
        if not liked_pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        other_user_id = liked_pet['user_id']
        
        # Deduct TailCoins if needed
        if coins_to_deduct > 0:
            await db.users.update_one(
                {"id": user_id},
                {"$inc": {"tail_coins": -coins_to_deduct}}
            )
            logger.info(f"Deducted {coins_to_deduct} TailCoins from user {user_id}. New balance: {tail_coins - coins_to_deduct}")
        
        # Increment daily likes counter for 'like' actions (not for paid actions)
        if like_data.action_type == 'like' and not is_premium and coins_to_deduct == 0:
            await db.users.update_one(
                {"id": user_id},
                {"$inc": {"daily_likes_count": 1}}
            )
            daily_likes_count += 1
            logger.info(f"Incremented daily likes counter for user {user_id}: {daily_likes_count}/10")
        
        # If action is golden_bone, increment the monthly counter
        if like_data.action_type == 'golden_bone':
            await db.users.update_one(
                {"id": user_id},
                {"$inc": {"golden_bones_used_this_month": 1}}
            )
            logger.info(f"Incremented golden_bones count for user {user_id}")
        
        # Create like object
        like = Like(
            user_id=user_id,
            pet_id=like_data.pet_id,
            action_type=like_data.action_type
        )
        
        # Save to database
        await db.likes.insert_one(like.dict())
        
        logger.info(f"User {user_id} performed {like_data.action_type} on pet {like_data.pet_id}")
        
        # Check for mutual match (only for like, super_like, golden_bone - not skip)
        match_info = None
        if like_data.action_type in ['like', 'super_like', 'golden_bone']:
            # Get current user's pet (most recent)
            my_pet = await db.pets.find_one({"user_id": user_id}, sort=[("created_at", -1)])
            
            if my_pet:
                # Check if the other user already liked my pet
                mutual_like = await db.likes.find_one({
                    "user_id": other_user_id,
                    "pet_id": my_pet['id'],
                    "action_type": {"$in": ["like", "super_like", "golden_bone"]}
                })
                
                if mutual_like:
                    # It's a match! Check if match already exists
                    existing_match = await db.matches.find_one({
                        "$or": [
                            {"user1_id": user_id, "user2_id": other_user_id},
                            {"user1_id": other_user_id, "user2_id": user_id}
                        ]
                    })
                    
                    if not existing_match:
                        # Create new match
                        match = Match(
                            user1_id=user_id,
                            user2_id=other_user_id,
                            pet1_id=my_pet['id'],
                            pet2_id=like_data.pet_id,
                            match_type=like_data.action_type
                        )
                        
                        await db.matches.insert_one(match.dict())
                        
                        logger.info(f"✨ MATCH CREATED! Users {user_id} and {other_user_id}, triggered by {like_data.action_type}")
                        
                        match_info = {
                            "matched": True,
                            "match_id": match.id,
                            "match_type": like_data.action_type,
                            "my_pet": {
                                "id": my_pet['id'],
                                "name": my_pet.get('pet_name', 'Your pet'),
                                "photo": my_pet.get('photos', [])[0] if my_pet.get('photos') else None
                            },
                            "their_pet": {
                                "id": liked_pet['id'],
                                "name": liked_pet.get('pet_name', 'Their pet'),
                                "photo": liked_pet.get('photos', [])[0] if liked_pet.get('photos') else None
                            }
                        }
        
        # Get updated user stats
        updated_user = await db.users.find_one({"id": user_id})
        
        return {
            "id": like.id,
            "user_id": like.user_id,
            "pet_id": like.pet_id,
            "action_type": like.action_type,
            "created_at": like.created_at,
            "match": match_info,
            "user_stats": {
                "tail_coins": updated_user.get('tail_coins', 0),
                "daily_likes_count": updated_user.get('daily_likes_count', 0),
                "daily_likes_limit": 10 if not is_premium else None,
                "is_premium": is_premium
            }
        }
    
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


@api_router.get("/likes/received")
async def get_received_likes(user_id: Optional[str] = None):
    """
    Get all likes/super_likes/golden_bones received by the current user
    Returns enriched data with sender info and their pet details
    Excludes skip actions
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
        
        # Get current user's pets
        my_pets = await db.pets.find({"user_id": user_id}).to_list(1000)
        my_pet_ids = [pet['id'] for pet in my_pets]
        
        if not my_pet_ids:
            return {
                "likes": [],
                "super_likes": [],
                "golden_bones": [],
                "unread_count": 0,
                "super_like_count": 0
            }
        
        # Get all likes received on my pets (exclude skip)
        received_likes = await db.likes.find({
            "pet_id": {"$in": my_pet_ids},
            "action_type": {"$in": ["like", "super_like", "golden_bone"]}
        }).to_list(1000)
        
        # Enrich with sender and pet information
        likes_list = []
        super_likes_list = []
        golden_bones_list = []
        
        for like_doc in received_likes:
            # Get sender info
            sender = await db.users.find_one({"id": like_doc['user_id']})
            if not sender:
                continue
            
            # Get sender's pet (most recent)
            sender_pet = await db.pets.find_one(
                {"user_id": like_doc['user_id']},
                sort=[("created_at", -1)]
            )
            
            # Get my pet that was liked
            my_liked_pet = await db.pets.find_one({"id": like_doc['pet_id']})
            
            enriched_like = {
                "id": like_doc['id'],
                "action_type": like_doc['action_type'],
                "created_at": like_doc['created_at'],
                "sender": {
                    "user_id": sender['id'],
                    "contact": sender.get('value', 'Unknown'),
                    "is_verified": sender.get('is_verified_human', False)
                },
                "sender_pet": {
                    "id": sender_pet['id'] if sender_pet else None,
                    "name": sender_pet.get('pet_name', 'Unknown') if sender_pet else 'Unknown',
                    "breed": sender_pet.get('breed', '') if sender_pet else '',
                    "photo": sender_pet.get('photos', [])[0] if sender_pet and sender_pet.get('photos') else None
                },
                "my_pet": {
                    "id": my_liked_pet['id'] if my_liked_pet else None,
                    "name": my_liked_pet.get('pet_name', 'Unknown') if my_liked_pet else 'Unknown'
                }
            }
            
            # Categorize by action type
            if like_doc['action_type'] == 'like':
                likes_list.append(enriched_like)
            elif like_doc['action_type'] == 'super_like':
                super_likes_list.append(enriched_like)
            elif like_doc['action_type'] == 'golden_bone':
                golden_bones_list.append(enriched_like)
        
        # Sort by created_at (most recent first)
        likes_list.sort(key=lambda x: x['created_at'], reverse=True)
        super_likes_list.sort(key=lambda x: x['created_at'], reverse=True)
        golden_bones_list.sort(key=lambda x: x['created_at'], reverse=True)
        
        return {
            "likes": likes_list,
            "super_likes": super_likes_list,
            "golden_bones": golden_bones_list,
            "unread_count": len(likes_list),
            "super_like_count": len(super_likes_list) + len(golden_bones_list)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching received likes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch received likes")


@api_router.get("/likes/badges")
async def get_like_badges(user_id: Optional[str] = None):
    """
    Get badge counts for unseen likes and super likes
    Returns: { normal_likes_count, super_likes_count }
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
        
        # Get current user's pets
        my_pets = await db.pets.find({"user_id": user_id}).to_list(1000)
        my_pet_ids = [pet['id'] for pet in my_pets]
        
        if not my_pet_ids:
            return {
                "normal_likes_count": 0,
                "super_likes_count": 0,
                "has_unseen": False
            }
        
        # Count unseen normal likes
        normal_likes_count = await db.likes.count_documents({
            "pet_id": {"$in": my_pet_ids},
            "action_type": "like",
            "seen": False
        })
        
        # Count unseen super likes and golden bones
        super_likes_count = await db.likes.count_documents({
            "pet_id": {"$in": my_pet_ids},
            "action_type": {"$in": ["super_like", "golden_bone"]},
            "seen": False
        })
        
        logger.info(f"Badge counts for user {user_id}: {normal_likes_count} normal, {super_likes_count} super")
        
        return {
            "normal_likes_count": normal_likes_count,
            "super_likes_count": super_likes_count,
            "has_unseen": (normal_likes_count + super_likes_count) > 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting badge counts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get badge counts")


@api_router.post("/likes/mark-seen")
async def mark_likes_seen(user_id: Optional[str] = None):
    """
    Mark all received likes as seen for the current user
    This clears the badge notifications
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
        
        # Get current user's pets
        my_pets = await db.pets.find({"user_id": user_id}).to_list(1000)
        my_pet_ids = [pet['id'] for pet in my_pets]
        
        if not my_pet_ids:
            return {"success": True, "marked_count": 0}
        
        # Mark all received likes as seen
        result = await db.likes.update_many(
            {
                "pet_id": {"$in": my_pet_ids},
                "action_type": {"$in": ["like", "super_like", "golden_bone"]},
                "seen": False
            },
            {"$set": {"seen": True}}
        )
        
        logger.info(f"Marked {result.modified_count} likes as seen for user {user_id}")
        
        return {
            "success": True,
            "marked_count": result.modified_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking likes as seen: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark likes as seen")


# ============ Verification Routes ============

@api_router.post("/verifications", response_model=Verification)
async def create_verification(verification_data: VerificationCreate, user_id: Optional[str] = None):
    """
    Create a new verification request
    Accepts user_id as query parameter or uses most recent user as fallback
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
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


@api_router.put("/admin/users/{user_id}/premium")
async def update_user_premium_status(user_id: str, data: dict):
    """
    Update a user's premium status
    - Sets users.is_premium to true or false
    - Admin only endpoint
    """
    try:
        is_premium = data.get('is_premium', False)
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {"is_premium": is_premium}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"User {user_id} premium status updated to {is_premium}")
        
        return {
            "success": True,
            "message": f"User {'upgraded to' if is_premium else 'downgraded from'} premium",
            "user_id": user_id,
            "is_premium": is_premium
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating premium status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update premium status")


# ============ TailCoins Routes ============

@api_router.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    """
    Get user's TailCoins balance and daily likes stats
    """
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Reset daily counter if it's a new day
        from datetime import datetime
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_likes_reset_date = user.get('daily_likes_reset_date')
        daily_likes_count = user.get('daily_likes_count', 0)
        
        if not daily_likes_reset_date or daily_likes_reset_date < today_start:
            # Reset daily counter
            daily_likes_count = 0
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "daily_likes_count": 0,
                    "daily_likes_reset_date": today_start
                }}
            )
        
        is_premium = user.get('is_premium', False)
        
        return {
            "user_id": user_id,
            "tail_coins": user.get('tail_coins', 0),
            "daily_likes_count": daily_likes_count,
            "daily_likes_limit": None if is_premium else 10,
            "is_premium": is_premium,
            "golden_bones_used_this_month": user.get('golden_bones_used_this_month', 0)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user stats")


@api_router.post("/users/{user_id}/buy-coins")
async def buy_tail_coins(user_id: str, data: dict):
    """
    Buy TailCoins (stub implementation for now)
    In production, this would integrate with payment gateway
    """
    try:
        coins_to_add = data.get('coins', 0)
        amount = data.get('amount', 0)  # Amount in currency
        
        if coins_to_add <= 0:
            raise HTTPException(status_code=400, detail="Invalid coin amount")
        
        # Stub: Add coins without payment validation
        result = await db.users.update_one(
            {"id": user_id},
            {"$inc": {"tail_coins": coins_to_add}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get updated user
        user = await db.users.find_one({"id": user_id})
        
        logger.info(f"User {user_id} bought {coins_to_add} TailCoins for ₹{amount}. New balance: {user.get('tail_coins', 0)}")
        
        return {
            "success": True,
            "message": f"Successfully purchased {coins_to_add} TailCoins!",
            "coins_added": coins_to_add,
            "new_balance": user.get('tail_coins', 0),
            "amount_paid": amount
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error buying coins: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to purchase coins")


@api_router.post("/admin/users/{user_id}/add-coins")
async def admin_add_coins(user_id: str, data: dict):
    """
    Admin endpoint to add TailCoins to a user for testing
    """
    try:
        coins_to_add = data.get('coins', 100)
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$inc": {"tail_coins": coins_to_add}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get updated user
        user = await db.users.find_one({"id": user_id})
        
        logger.info(f"Admin added {coins_to_add} TailCoins to user {user_id}. New balance: {user.get('tail_coins', 0)}")
        
        return {
            "success": True,
            "message": f"Added {coins_to_add} TailCoins",
            "user_id": user_id,
            "new_balance": user.get('tail_coins', 0)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding coins: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add coins")


# ============ Chat Routes ============

@api_router.get("/chats/{match_id}")
async def get_chat_messages(match_id: str, user_id: Optional[str] = None):
    """
    Get all chat messages for a specific match
    Only users who are part of the match can access the chat
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
        
        # Verify the match exists
        match = await db.matches.find_one({"id": match_id})
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Verify user is part of the match
        if user_id not in [match['user1_id'], match['user2_id']]:
            raise HTTPException(status_code=403, detail="Unauthorized: You are not part of this match")
        
        # Get all messages for this match
        messages = await db.chats.find({"match_id": match_id}).sort("created_at", 1).to_list(1000)
        
        # Get the other user's info
        other_user_id = match['user2_id'] if match['user1_id'] == user_id else match['user1_id']
        other_user = await db.users.find_one({"id": other_user_id})
        other_pet = await db.pets.find_one({"user_id": other_user_id})
        
        return {
            "match_id": match_id,
            "messages": [ChatMessage(**msg) for msg in messages],
            "other_user": {
                "user_id": other_user_id,
                "contact": other_user.get('value', 'Unknown') if other_user else 'Unknown',
                "pet_name": other_pet.get('pet_name', 'Their Pet') if other_pet else 'Their Pet',
                "pet_photo": other_pet.get('photos', [])[0] if other_pet and other_pet.get('photos') else None
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chat messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")


@api_router.post("/chats/{match_id}")
async def send_chat_message(match_id: str, message_data: dict, user_id: Optional[str] = None):
    """
    Send a chat message in a match
    Only users who are part of the match can send messages
    """
    try:
        # Get user_id from parameter or fallback to most recent user
        if not user_id:
            recent_user = await db.users.find_one(sort=[("last_login", -1)])
            if not recent_user:
                raise HTTPException(status_code=404, detail="No user found. Please login first.")
            user_id = recent_user['id']
        
        # Verify the match exists
        match = await db.matches.find_one({"id": match_id})
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Verify user is part of the match
        if user_id not in [match['user1_id'], match['user2_id']]:
            raise HTTPException(status_code=403, detail="Unauthorized: You are not part of this match")
        
        # Create the message
        message = ChatMessage(
            match_id=match_id,
            sender_id=user_id,
            message=message_data.get('message', '')
        )
        
        # Save to database
        await db.chats.insert_one(message.dict())
        
        logger.info(f"Message sent in match {match_id} by user {user_id}")
        
        return message
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")


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
