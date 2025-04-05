import os
import requests
import json
from datetime import datetime, timedelta
import pytz

# Get Google Calendar API key from environment variables
GCALENDAR_KEY = os.getenv("GCALENDAR_KEY")
GCALENDAR_CALENDAR_ID = os.getenv("GCALENDAR_CALENDAR_ID", "primary")

# Default timezone
DEFAULT_TIMEZONE = os.getenv("DEFAULT_TIMEZONE", "America/New_York")

def schedule_meeting(title, date_time, attendees=None, description=""):
    """Schedule a meeting in Google Calendar"""
    if not GCALENDAR_KEY:
        raise Exception("Google Calendar API key not configured")
    
    # Google Calendar API endpoint
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GCALENDAR_CALENDAR_ID}/events"
    
    # Convert date_time to RFC3339 format if it's not already
    if isinstance(date_time, str):
        try:
            # Try to parse the date_time string
            dt = datetime.fromisoformat(date_time.replace("Z", "+00:00"))
        except ValueError:
            # If parsing fails, raise an exception
            raise Exception("Invalid date_time format. Expected ISO format.")
    else:
        dt = date_time
    
    # Ensure timezone is set
    if dt.tzinfo is None:
        tz = pytz.timezone(DEFAULT_TIMEZONE)
        dt = tz.localize(dt)
    
    # Format attendees
    formatted_attendees = []
    if attendees:
        for attendee in attendees:
            if isinstance(attendee, dict) and "email" in attendee:
                formatted_attendees.append({"email": attendee["email"]})
            elif isinstance(attendee, str) and "@" in attendee:
                formatted_attendees.append({"email": attendee})
    
    # Prepare event data
    event_data = {
        "summary": title,
        "description": description,
        "start": {
            "dateTime": dt.isoformat(),
            "timeZone": DEFAULT_TIMEZONE
        },
        "end": {
            "dateTime": (dt + timedelta(hours=1)).isoformat(),  # Default to 1-hour meetings
            "timeZone": DEFAULT_TIMEZONE
        }
    }
    
    # Add attendees if provided
    if formatted_attendees:
        event_data["attendees"] = formatted_attendees
    
    # Make the API request
    headers = {
        "Authorization": f"Bearer {GCALENDAR_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(event_data))
    
    if response.status_code not in [200, 201]:
        raise Exception(f"Failed to schedule meeting: {response.text}")
    
    return response.json()

def get_upcoming_meetings(days=7):
    """Get upcoming meetings from Google Calendar"""
    if not GCALENDAR_KEY:
        raise Exception("Google Calendar API key not configured")
    
    # Google Calendar API endpoint
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GCALENDAR_CALENDAR_ID}/events"
    
    # Calculate time range
    now = datetime.now(pytz.timezone(DEFAULT_TIMEZONE))
    time_min = now.isoformat()
    time_max = (now + timedelta(days=days)).isoformat()
    
    # Prepare query parameters
    params = {
        "timeMin": time_min,
        "timeMax": time_max,
        "singleEvents": "true",
        "orderBy": "startTime",
        "key": GCALENDAR_KEY
    }
    
    # Make the API request
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        raise Exception(f"Failed to get upcoming meetings: {response.text}")
    
    # Process the response
    events_data = response.json()
    meetings = []
    
    for event in events_data.get("items", []):
        # Skip events without a start time (all-day events)
        if "dateTime" not in event.get("start", {}):
            continue
        
        # Parse the start time
        start_time = datetime.fromisoformat(event["start"]["dateTime"].replace("Z", "+00:00"))
        
        # Format attendees
        attendees = []
        for attendee in event.get("attendees", []):
            if "displayName" in attendee:
                attendees.append(attendee["displayName"])
            elif "email" in attendee:
                attendees.append(attendee["email"].split("@")[0])  # Just use the username part
        
        # Add the meeting to the list
        meetings.append({
            "id": event["id"],
            "title": event["summary"],
            "description": event.get("description", ""),
            "date": start_time.strftime("%Y-%m-%d"),
            "time": start_time.strftime("%I:%M %p"),
            "attendees": attendees
        })
    
    return meetings

