import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

async def send_task_completion_email(
    recipient_email: str,
    task: str,
    result: Optional[str] = None,
    error: Optional[str] = None
) -> bool:
    """
    Sends a task completion notification email.
    
    Args:
        recipient_email (str): The recipient's email address
        task (str): The completed task description
        result (Optional[str]): The task result if successful
        error (Optional[str]): Any error message if the task failed
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = "Task Completion Notification - DigestAI"
        
        # Prepare email body
        body = f"Your task has been completed!\n\n"
        body += f"Task: {task}\n\n"
        
        if result:
            body += f"Result: {result}\n\n"
        if error:
            body += f"Error: {error}\n\n"
            
        body += "Thank you for using DigestAI!"

        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Connect to the server and send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, recipient_email, msg.as_string())
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False 