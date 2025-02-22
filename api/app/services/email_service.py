import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import markdown2
from datetime import datetime

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def get_html_template(task: str, result: Optional[str] = None, error: Optional[str] = None) -> str:
    """
    Returns a styled HTML template for the email.
    """
    # Convert markdown to HTML if result exists
    result_html = markdown2.markdown(result) if result else None
    error_html = f'<div class="error">{error}</div>' if error else None

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #0066cc;
            }}
            .task-section {{
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #e9ecef;
            }}
            .result-section {{
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #e9ecef;
            }}
            .error {{
                background-color: #fff5f5;
                color: #c53030;
                padding: 12px;
                border-radius: 4px;
                margin-top: 12px;
            }}
            .footer {{
                text-align: center;
                font-size: 0.875rem;
                color: #666;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
            }}
            pre {{
                background-color: #f8f9fa;
                padding: 12px;
                border-radius: 4px;
                overflow-x: auto;
            }}
            code {{
                font-family: Monaco, Consolas, "Courier New", monospace;
                font-size: 0.875em;
                padding: 2px 4px;
                background-color: #f8f9fa;
                border-radius: 3px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1 style="margin: 0; color: #0066cc;">DigestAI Task Completion</h1>
            <p style="margin: 10px 0 0 0; color: #666;">
                {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
            </p>
        </div>
        
        <div class="task-section">
            <h2 style="margin-top: 0;">Task Details</h2>
            <p>{task}</p>
        </div>
        
        {f'''
        <div class="result-section">
            <h2 style="margin-top: 0;">Results</h2>
            {result_html}
        </div>
        ''' if result_html else ''}
        
        {error_html if error_html else ''}
        
        <div class="footer">
            <p>This is an automated message from DigestAI</p>
            <p style="margin: 0;">© {datetime.now().year} DigestAI. All rights reserved.</p>
        </div>
    </body>
    </html>
    """


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

        # Create HTML content
        html_content = get_html_template(task, result, error)

        # Create plain text content as fallback
        text_content = f"""
        Task Completion Notification - DigestAI
        
        Task: {task}
        
        {f'Result: {result}' if result else ''}
        {f'Error: {error}' if error else ''}
        
        Thank you for using DigestAI!
        """

        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = recipient_email
        msg['Subject'] = subject

        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        # Connect to the server and send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, recipient_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
