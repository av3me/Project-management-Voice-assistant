import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Get Gmail credentials from environment variables
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")

def send_email(to_email, subject, body):
    """Send an email using Gmail SMTP"""
    if not GMAIL_USER or not GMAIL_PASSWORD:
        raise Exception("Gmail credentials not configured")
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = GMAIL_USER
    msg['To'] = to_email
    msg['Subject'] = subject
    
    # Add body to email
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        
        # Login to Gmail
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")

def send_reminder_email(to_email, task_info):
    """Send a reminder email for a task"""
    subject = f"Reminder: Task '{task_info['title']}' needs attention"
    
    body = f"""
Hi {task_info['owner']},

This is a friendly reminder that the task "{task_info['title']}" was created 3 days ago and requires your attention.

Due date: {task_info.get('dueDate', 'Not specified')}

Please update the task status or reach out if you need help.

Best regards,
Project Management Assistant
"""
    
    return send_email(to_email, subject, body)

def send_status_update_email(to_emails, project_status):
    """Send a project status update email to multiple recipients"""
    subject = f"Project Status Update - {datetime.now().strftime('%B %d, %Y')}"
    
    # Format tasks in the email
    tasks_completed = "\n".join([f"- {task['title']}" for task in project_status.get('completed_tasks', [])])
    tasks_in_progress = "\n".join([f"- {task['title']} (Due: {task.get('dueDate', 'Not specified')})" for task in project_status.get('in_progress_tasks', [])])
    tasks_upcoming = "\n".join([f"- {task['title']} (Due: {task.get('dueDate', 'Not specified')})" for task in project_status.get('upcoming_tasks', [])])
    
    # Format meetings in the email
    upcoming_meetings = "\n".join([f"- {meeting['title']} on {meeting['date']} at {meeting['time']}" for meeting in project_status.get('upcoming_meetings', [])])
    
    body = f"""
Hello Team,

Here is the current project status update:

COMPLETED TASKS:
{tasks_completed if tasks_completed else "No tasks completed recently."}

IN PROGRESS:
{tasks_in_progress if tasks_in_progress else "No tasks currently in progress."}

UPCOMING DEADLINES:
{tasks_upcoming if tasks_upcoming else "No upcoming deadlines."}

UPCOMING MEETINGS:
{upcoming_meetings if upcoming_meetings else "No upcoming meetings scheduled."}

Please review and let me know if you have any questions.

Best regards,
Project Management Assistant
"""
    
    # Send to each recipient
    results = []
    for email in to_emails:
        try:
            results.append({"email": email, "success": send_email(email, subject, body)})
        except Exception as e:
            results.append({"email": email, "success": False, "error": str(e)})
    
    return results

