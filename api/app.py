from flask import Flask, request, jsonify
import os
from trello_integration import trello_api
from email_integration import email_api
from calendar_integration import calendar_api
from chatbot import assistant

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/tasks/create', methods=['POST'])
def create_task():
    """Create a new task in Trello and store in database"""
    data = request.json
    
    try:
        # Create card in Trello
        card = trello_api.create_card(
            title=data.get('title'),
            description=data.get('description', ''),
            owner_id=data.get('owner'),
            due_date=data.get('dueDate'),
            priority=data.get('priority', 'medium')
        )
        
        # In a real implementation, we would also store in Supabase
        
        return jsonify({
            "success": True,
            "message": "Task created successfully",
            "task": card
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to create task: {str(e)}"
        }), 500

@app.route('/api/tasks/due', methods=['GET'])
def get_due_tasks():
    """Get tasks that are due soon"""
    try:
        # Get tasks from Trello
        tasks = trello_api.get_due_tasks()
        
        return jsonify({
            "success": True,
            "tasks": tasks
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to get due tasks: {str(e)}"
        }), 500

@app.route('/api/assist/chat', methods=['POST'])
def process_chat():
    """Process a chat message from the user"""
    data = request.json
    user_message = data.get('message', '')
    
    try:
        # Process the message with the assistant
        response = assistant.process_command(user_message)
        
        return jsonify({
            "success": True,
            "response": response
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to process message: {str(e)}"
        }), 500

@app.route('/api/reminders/trigger', methods=['POST'])
def trigger_reminders():
    """Trigger the reminder check for tasks"""
    try:
        # Check for tasks that need reminders
        reminders_sent = trello_api.check_and_send_reminders()
        
        return jsonify({
            "success": True,
            "reminders_sent": reminders_sent
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to trigger reminders: {str(e)}"
        }), 500

@app.route('/api/meetings/schedule', methods=['POST'])
def schedule_meeting():
    """Schedule a new meeting in Google Calendar"""
    data = request.json
    
    try:
        # Schedule meeting in Google Calendar
        meeting = calendar_api.schedule_meeting(
            title=data.get('title'),
            date_time=data.get('dateTime'),
            attendees=data.get('attendees', []),
            description=data.get('description', '')
        )
        
        return jsonify({
            "success": True,
            "message": "Meeting scheduled successfully",
            "meeting": meeting
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to schedule meeting: {str(e)}"
        }), 500

@app.route('/api/settings/update', methods=['POST'])
def update_settings():
    """Update application settings"""
    data = request.json
    
    try:
        # In a real implementation, we would update settings in Supabase
        # For now, just return success
        
        return jsonify({
            "success": True,
            "message": "Settings updated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to update settings: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)

