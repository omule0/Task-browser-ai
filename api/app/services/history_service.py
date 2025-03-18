from datetime import datetime
import base64
from app.config.supabase import supabase, HISTORY_TABLE, GIF_TABLE, DOCUMENT_TABLE
from typing import Optional, List, Dict
import json
import logging
from app.utils.auth import AuthTokens
import uuid


async def save_run_history(
    user_id: str,
    task: str,
    progress_events: List[Dict],
    result: Optional[str] = None,
    error: Optional[str] = None,
    gif_content: Optional[str] = None,
    document_content: Optional[str] = None,
    auth_tokens: Optional[AuthTokens] = None,
    run_id: Optional[str] = None,
    live_view_url: Optional[str] = None
) -> str:
    """Save run history and associated GIF content."""
    try:
        # Set auth context if tokens are provided
        if auth_tokens:
            try:
                supabase.auth.set_session(
                    access_token=auth_tokens.access_token,
                    refresh_token=auth_tokens.refresh_token
                )
            except Exception as e:
                logging.error(f"Error setting session: {str(e)}")
                raise

        # Prepare history data
        history_id = run_id or str(uuid.uuid4())
        history_data = {
            'id': history_id,
            'user_id': user_id,
            'task': task,
            'progress': json.dumps(progress_events),
            'result': result,
            'error': error,
            'created_at': datetime.utcnow().isoformat(),
            'live_view_url': live_view_url
        }

        logging.info(f"Saving run history for user {user_id}")
        logging.debug(f"History data: {history_data}")

        # Insert history
        history_response = supabase.table(
            HISTORY_TABLE).insert(history_data).execute()

        if not history_response.data:
            raise Exception("No data returned from history insert")

        history_id = history_response.data[0]['id']

        # If there's a GIF, save it
        if gif_content:
            logging.info(f"GIF content length: {len(gif_content)}")
            gif_data = {
                'history_id': history_id,
                'gif_content': gif_content,
                'created_at': datetime.utcnow().isoformat()
            }

            logging.info(f"Saving GIF for history {history_id}")
            gif_response = supabase.table(GIF_TABLE).insert(gif_data).execute()

            if not gif_response.data:
                logging.error("Failed to save GIF content")
            else:
                logging.info("Successfully saved GIF content")
        else:
            logging.warning("No GIF content provided to save")

        # If there's a document, save it
        if document_content:
            logging.info(f"Document content length: {len(document_content)}")
            document_data = {
                'history_id': history_id,
                'document_content': document_content,
                'created_at': datetime.utcnow().isoformat()
            }

            logging.info(f"Saving document for history {history_id}")
            document_response = supabase.table(
                DOCUMENT_TABLE).insert(document_data).execute()

            if not document_response.data:
                logging.error("Failed to save document content")
            else:
                logging.info("Successfully saved document content")
        else:
            logging.warning("No document content provided to save")

        return history_id

    except Exception as e:
        logging.error(f"Error saving run history: {str(e)}")
        if hasattr(e, 'response'):
            logging.error(
                f"Response: {e.response.text if hasattr(e, 'response') else 'No response text'}")
        raise Exception(f"Failed to save run history: {str(e)}")


async def get_run_history(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    auth_tokens: Optional[AuthTokens] = None
) -> Dict:
    """Get paginated run history for a specific user."""
    try:
        # Set auth context if tokens are provided
        if auth_tokens:
            try:
                supabase.auth.set_session(
                    access_token=auth_tokens.access_token,
                    refresh_token=auth_tokens.refresh_token
                )
            except Exception as e:
                logging.error(f"Error setting session: {str(e)}")
                raise

        # Get total count
        count_response = supabase.table(HISTORY_TABLE)\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .execute()

        total = count_response.count if hasattr(count_response, 'count') else 0

        # Get paginated data
        data_response = supabase.table(HISTORY_TABLE)\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()

        return {
            "data": data_response.data,
            "total": total
        }

    except Exception as e:
        logging.error(f"Error getting run history: {str(e)}")
        raise Exception(f"Failed to get run history: {str(e)}")


async def get_run_details(
    user_id: str,
    history_id: str,
    auth_tokens: Optional[AuthTokens] = None
) -> Optional[Dict]:
    """Get detailed run information including GIF for a specific user."""
    try:
        # Set auth context if tokens are provided
        if auth_tokens:
            try:
                supabase.auth.set_session(
                    access_token=auth_tokens.access_token,
                    refresh_token=auth_tokens.refresh_token
                )
            except Exception as e:
                logging.error(f"Error setting session: {str(e)}")
                raise

        # Get the run history
        try:
            logging.info(f"Fetching history for ID: {history_id}")
            history_response = supabase.table(HISTORY_TABLE)\
                .select('*')\
                .eq('id', history_id)\
                .eq('user_id', user_id)\
                .single()\
                .execute()

            if not history_response.data:
                logging.warning(f"No history found for ID: {history_id}")
                return None

            history = history_response.data

            # Get the associated GIF if it exists
            try:
                logging.info(f"Fetching GIF for history ID: {history_id}")
                gif_response = supabase.table(GIF_TABLE)\
                    .select('gif_content')\
                    .eq('history_id', history_id)\
                    .single()\
                    .execute()

                if gif_response.data:
                    logging.info(
                        f"Found GIF content of length: {len(gif_response.data['gif_content'])}")
                    history['gif_content'] = gif_response.data['gif_content']
                else:
                    logging.warning(
                        f"No GIF content found for history ID: {history_id}")
                    history['gif_content'] = None
            except Exception as e:
                logging.error(f"Error fetching GIF content: {str(e)}")
                history['gif_content'] = None

            # Get the associated document if it exists
            try:
                logging.info(f"Fetching document for history ID: {history_id}")
                document_response = supabase.table(DOCUMENT_TABLE)\
                    .select('document_content')\
                    .eq('history_id', history_id)\
                    .single()\
                    .execute()

                if document_response.data:
                    logging.info(
                        f"Found document content of length: {len(document_response.data['document_content'])}")
                    history['document_content'] = document_response.data['document_content']
                else:
                    logging.warning(
                        f"No document content found for history ID: {history_id}")
                    history['document_content'] = None
            except Exception as e:
                logging.error(f"Error fetching document content: {str(e)}")
                history['document_content'] = None

            return history

        except Exception as e:
            if 'no rows' in str(e).lower():
                return None
            raise

    except Exception as e:
        logging.error(f"Error getting run details: {str(e)}")
        if hasattr(e, 'response'):
            logging.error(
                f"Response: {e.response.text if hasattr(e, 'response') else 'No response text'}")
        raise Exception(f"Failed to get run details: {str(e)}")


async def delete_run_history(
    user_id: str,
    history_id: str,
    auth_tokens: Optional[AuthTokens] = None
) -> bool:
    """Delete a run history entry and its associated GIF."""
    try:
        # Set auth context if tokens are provided
        if auth_tokens:
            try:
                supabase.auth.set_session(
                    access_token=auth_tokens.access_token,
                    refresh_token=auth_tokens.refresh_token
                )
            except Exception as e:
                logging.error(f"Error setting session: {str(e)}")
                raise

        # The GIF and document will be automatically deleted due to the ON DELETE CASCADE
        response = supabase.table(HISTORY_TABLE)\
            .delete()\
            .eq('id', history_id)\
            .eq('user_id', user_id)\
            .execute()

        return bool(response.data)

    except Exception as e:
        logging.error(f"Error deleting run history: {str(e)}")
        raise Exception(f"Failed to delete run history: {str(e)}")


async def update_history_with_document(
    user_id: str,
    history_id: str,
    document_content: str,
    auth_tokens: Optional[AuthTokens] = None,
    result: Optional[str] = None
) -> bool:
    """Update an existing history entry with document content."""
    try:
        # Set auth context if tokens are provided
        if auth_tokens:
            try:
                supabase.auth.set_session(
                    access_token=auth_tokens.access_token,
                    refresh_token=auth_tokens.refresh_token
                )
            except Exception as e:
                logging.error(f"Error setting session: {str(e)}")
                raise

        # Create update data with document content
        update_data = {}

        # Save document to document table
        document_data = {
            'history_id': history_id,
            'document_content': document_content,
            'created_at': datetime.utcnow().isoformat()
        }

        # First check if document exists
        try:
            existing_doc = supabase.table(DOCUMENT_TABLE)\
                .select('id')\
                .eq('history_id', history_id)\
                .single()\
                .execute()

            if existing_doc.data:
                # Update existing document
                doc_response = supabase.table(DOCUMENT_TABLE)\
                    .update({'document_content': document_content})\
                    .eq('history_id', history_id)\
                    .execute()
            else:
                # Create new document
                doc_response = supabase.table(DOCUMENT_TABLE)\
                    .insert(document_data)\
                    .execute()
        except Exception as doc_error:
            # Document doesn't exist, create it
            if 'no rows' in str(doc_error).lower():
                doc_response = supabase.table(DOCUMENT_TABLE)\
                    .insert(document_data)\
                    .execute()
            else:
                raise doc_error

        # If result is provided, update the history entry
        if result:
            history_response = supabase.table(HISTORY_TABLE)\
                .update({'result': result})\
                .eq('id', history_id)\
                .eq('user_id', user_id)\
                .execute()

            if not history_response.data:
                return False

        return True
    except Exception as e:
        logging.error(f"Error updating history with document: {str(e)}")
        return False
