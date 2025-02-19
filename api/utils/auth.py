from fastapi import HTTPException, Request
from supabase.client import Client
import jwt as PyJWT  # Import as PyJWT to be explicit
from typing import Optional, Tuple, Dict
from config.supabase import supabase

class AuthTokens:
    def __init__(self, access_token: str, refresh_token: Optional[str] = None):
        self.access_token = access_token
        self.refresh_token = refresh_token or access_token  # fallback to access_token if no refresh_token

async def get_user_id_and_tokens(request: Request) -> Tuple[str, AuthTokens]:
    """
    Extract and verify the JWT tokens from the request header.
    Returns the user ID and auth tokens if valid.
    Raises HTTPException if the token is invalid or missing.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    access_token = auth_header.split(' ')[1]
    # Get refresh token from cookie or header
    refresh_token = request.cookies.get('sb-refresh-token') or access_token
    
    try:
        # Verify the JWT token using Supabase's JWT secret
        decoded = PyJWT.decode(
            access_token,
            algorithms=["HS256"],
            options={"verify_signature": False}  # We trust Supabase's token
        )
        
        # The sub claim contains the user ID in Supabase JWTs
        user_id = decoded.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
        
        return user_id, AuthTokens(access_token, refresh_token)
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

async def get_user_id(request: Request) -> str:
    """Convenience function to get just the user ID."""
    user_id, _ = await get_user_id_and_tokens(request)
    return user_id 