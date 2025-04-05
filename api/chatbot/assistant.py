import re
from datetime import datetime, timedelta
import pytz
from trello_integration import trello_api
from email_integration import email_api
from calendar_integration import calendar_api

# Default timezone
DEFAULT_TIMEZONE = "America/New_York"

def process_command(user_input):
    """Process a command from the user and return a response"""
    # Convert to lowercase for easier matching
    input_lower = user_input.lower()
    
    # Check for task-related queries
    if re.search(r'tasks? (are |is )?(due|deadline)', input_lower) or re.search(r'what.+due', input_lower):
        return get_due_tasks_response()
    
    # Check for reminder requests
    elif re.search(r'remind\s+(\w+)\s+(?:about|to|of)\s+(.+)', input_lower):
        match = re.search(r'remind\s+(\w+)\s+(?:about|to|of)\s+(.+)', input_lower)
        person = match.group(1)
        task = match.group(2)
        return send_reminder_response(person, task)
    
    # Check for meeting scheduling
    elif re.search(r'schedule\s+(?:a\s+)?meeting', input_lower):
        # Check if the command includes date/time and attendees
        date_match = re.search(r'(?:on|for)\s+(\w+(?:\s+\d+)?)', input_lower)
        time_match = re.search(r'at\s+(\d+(?::\d+)?\s*(?:am|pm)?)', input_lower)
        attendees_match = re.search(r'with\s+(.+?)(?:\s+on|\s+at|\s*$)', input_lower)
        
        if date_match and time_match:
            date_str = date_match.group(1)
            time_str = time_match.group(1)
            attendees = attendees_match.group(1).split(',') if attendees_match else []
            return schedule_meeting_response(date_str, time_str, attendees)
        else:
            return "I'd be happy to schedule a meeting. Could you provide the date, time, and attendees for the meeting?"
    
    # Check for project status queries
    elif re.search(r'(project|status|progress|how.+going)', input_lower):
        return get_project_status_response()
    
    # Default response for unknown commands
    else:
        return "I'm here to help with project management tasks. You can ask me about pending tasks, schedule meetings, or send reminders. For example, try asking 'What tasks are due?'"

def get_due_tasks_response():
    """Get a response about tasks that are due soon"""
    try:
        # Get tasks due in the next 7 days
        due_tasks = trello_api.get_due_tasks()
        
        if not due_tasks:
            return "You don't have any tasks due in the next 7 days. You're all caught up!"
        
        # Format the response
        response = f"You have {len(due_tasks)} tasks due in the next 7 days:\n\n"
        
        for task in due_tasks:
            due_date = datetime.fromisoformat(task["dueDate"].replace("Z", "+00:00"))
            owner_name = task["owner"]["name"] if task["owner"] else "Unassigned"
            
            response += f"- {task['title']} (Due: {due_date.strftime('%Y-%m-%d')}, Assigned to: {owner_name})\n"
        
        return response
    except Exception as e:
        return f"I'm sorry, I couldn't retrieve the due tasks at the moment. Error: {str(e)}"

def send_reminder_response(person, task):
    """Send a reminder to a person about a task"""
    try:
        # In a real implementation, we would:
        # 1. Look up the person in the database
        # 2. Find the task in Trello
        # 3. Send an email reminder
        # 4. Add a comment to the Trello card
        
        # For now, we'll just return a confirmation message
        return f"I've sent a reminder to {person.capitalize()} about '{task}'. They'll receive an email notification shortly."
    except Exception as e:
        return f"I'm sorry, I couldn't send the reminder at the moment. Error: {str(e)}"

def schedule_meeting_response(date_str, time_str, attendees):
    """Schedule a meeting and return a response"""
    try:
        # In a real implementation, we would:
        # 1. Parse the date and time strings
        # 2. Look up the attendees in the database
        # 3. Schedule the meeting in Google Calendar
        
        # For now, we'll just return a confirmation message
        attendees_str = ", ".join(attendee.strip().capitalize() for attendee in attendees) if attendees else "you"
        
        return f"I've scheduled a meeting for {date_str} at {time_str} with {attendees_str}. Calendar invites have been sent."
    except Exception as e:
        return f"I'm sorry, I couldn't schedule the meeting at the moment. Error: {str(e)}"

def get_project_status_response():
    """Get a response about the overall project status"""
    try:
        # In a real implementation, we would:
        # 1. Get tasks from Trello
        # 2. Get upcoming meetings from Google Calendar
        # 3. Calculate statistics
        
        # For now, we'll return a mock status
        return "The project is progressing well. You have 12 tasks in total, with 5 completed. There are 3 tasks due in the next 3 days and 1 overdue task that needs attention. Your next meeting is a Weekly Team Standup on Monday at 10:00 AM."
    except Exception as e:
        return f"I'm sorry, I couldn't retrieve the project status at the moment. Error: {str(e)}"

