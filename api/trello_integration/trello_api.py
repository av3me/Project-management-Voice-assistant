import os
import requests
from datetime import datetime, timedelta

# Trello API base URL
TRELLO_API_URL = "https://api.trello.com/1"

# Get Trello credentials from environment variables
TRELLO_KEY = os.getenv("TRELLO_KEY")
TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
TRELLO_BOARD_ID = os.getenv("TRELLO_BOARD_ID")
TRELLO_TODO_LIST_ID = os.getenv("TRELLO_TODO_LIST_ID")
TRELLO_INPROGRESS_LIST_ID = os.getenv("TRELLO_INPROGRESS_LIST_ID")
TRELLO_DONE_LIST_ID = os.getenv("TRELLO_DONE_LIST_ID")

def get_auth_params():
    """Return the authentication parameters for Trello API requests"""
    return {
        "key": TRELLO_KEY,
        "token": TRELLO_TOKEN
    }

def create_card(title, description="", owner_id=None, due_date=None, priority="medium"):
    """Create a new card in Trello"""
    if not TRELLO_KEY or not TRELLO_TOKEN:
        raise Exception("Trello API credentials not configured")
    
    url = f"{TRELLO_API_URL}/cards"
    
    # Prepare card data
    card_data = {
        "name": title,
        "desc": description,
        "idList": TRELLO_TODO_LIST_ID,
        **get_auth_params()
    }
    
    # Add due date if provided
    if due_date:
        card_data["due"] = due_date
    
    # Add member if provided
    if owner_id:
        card_data["idMembers"] = [owner_id]
    
    # Add label for priority
    if priority:
        # In a real implementation, we would get the label IDs from Trello
        # For now, we'll just include it in the description
        card_data["desc"] += f"\n\nPriority: {priority.capitalize()}"
    
    # Make the API request
    response = requests.post(url, data=card_data)
    
    if response.status_code != 200:
        raise Exception(f"Failed to create Trello card: {response.text}")
    
    return response.json()

def get_cards(list_id=None):
    """Get cards from a specific list or the entire board"""
    if not TRELLO_KEY or not TRELLO_TOKEN:
        raise Exception("Trello API credentials not configured")
    
    # If list_id is provided, get cards from that list
    # Otherwise, get all cards from the board
    if list_id:
        url = f"{TRELLO_API_URL}/lists/{list_id}/cards"
    else:
        url = f"{TRELLO_API_URL}/boards/{TRELLO_BOARD_ID}/cards"
    
    response = requests.get(url, params=get_auth_params())
    
    if response.status_code != 200:
        raise Exception(f"Failed to get Trello cards: {response.text}")
    
    return response.json()

def get_due_tasks():
    """Get tasks that are due soon (within the next 7 days)"""
    # Get all cards from the board
    all_cards = get_cards()
    
    # Filter cards with due dates in the next 7 days
    due_soon = []
    today = datetime.now()
    seven_days_later = today + timedelta(days=7)
    
    for card in all_cards:
        if card.get("due"):
            due_date = datetime.fromisoformat(card["due"].replace("Z", "+00:00"))
            if today <= due_date <= seven_days_later and card["idList"] != TRELLO_DONE_LIST_ID:
                # Format the card data for the frontend
                due_soon.append({
                    "id": card["id"],
                    "title": card["name"],
                    "description": card["desc"],
                    "dueDate": card["due"],
                    "owner": get_member_details(card.get("idMembers", [])[0]) if card.get("idMembers") else None,
                    "status": get_status_from_list_id(card["idList"])
                })
    
    return due_soon

def get_status_from_list_id(list_id):
    """Convert Trello list ID to status string"""
    if list_id == TRELLO_TODO_LIST_ID:
        return "todo"
    elif list_id == TRELLO_INPROGRESS_LIST_ID:
        return "in-progress"
    elif list_id == TRELLO_DONE_LIST_ID:
        return "done"
    else:
        return "unknown"

def get_member_details(member_id):
    """Get member details from Trello"""
    if not member_id:
        return None
    
    url = f"{TRELLO_API_URL}/members/{member_id}"
    response = requests.get(url, params=get_auth_params())
    
    if response.status_code != 200:
        return {"name": "Unknown", "initials": "??"}
    
    member = response.json()
    return {
        "id": member["id"],
        "name": member["fullName"],
        "initials": member["initials"],
        "username": member["username"]
    }

def add_comment_to_card(card_id, comment):
    """Add a comment to a Trello card"""
    url = f"{TRELLO_API_URL}/cards/{card_id}/actions/comments"
    data = {
        "text": comment,
        **get_auth_params()
    }
    
    response = requests.post(url, data=data)
    
    if response.status_code != 200:
        raise Exception(f"Failed to add comment to card: {response.text}")
    
    return response.json()

def check_and_send_reminders():
    """Check for tasks that need reminders and send them"""
    # In a real implementation, this would:
    # 1. Query the database for tasks created 3 days ago
    # 2. Check if they've been updated or completed
    # 3. Send reminders for those that haven't
    
    # For now, we'll just return a mock response
    return {
        "checked": 5,
        "reminders_sent": 2,
        "tasks": [
            {"id": "task1", "title": "Prepare Q1 Report", "owner": "Alice Smith"},
            {"id": "task2", "title": "Update client presentation", "owner": "Bob Johnson"}
        ]
    }

