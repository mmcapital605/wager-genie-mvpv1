from flask import Flask, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from bs4 import BeautifulSoup
import requests
import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# The Odds API configuration
ODDS_API_KEY = os.getenv('ODDS_API_KEY')
ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports'

def fetch_odds_data():
    """Fetch daily odds data from The Odds API"""
    try:
        sports = ['basketball_nba', 'baseball_mlb', 'football_nfl']
        all_odds = []
        
        for sport in sports:
            response = requests.get(
                f'{ODDS_API_URL}/{sport}/odds',
                params={
                    'apiKey': ODDS_API_KEY,
                    'regions': 'us',
                    'markets': 'h2h,spreads',
                    'oddsFormat': 'american'
                }
            )
            if response.status_code == 200:
                odds_data = response.json()
                all_odds.extend(odds_data)
        
        # Store in Supabase
        supabase.table('odds_data').upsert(all_odds).execute()
        print(f"Successfully fetched and stored odds data at {datetime.now()}")
        
    except Exception as e:
        print(f"Error fetching odds data: {str(e)}")

def scrape_picks():
    """Scrape picks from target website"""
    try:
        # Replace with actual target website
        url = "https://example.com/picks"
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Implement actual scraping logic here
        picks = []  # Parse picks from the website
        
        # Store in Supabase
        supabase.table('scraped_picks').upsert(picks).execute()
        print(f"Successfully scraped picks at {datetime.now()}")
        
    except Exception as e:
        print(f"Error scraping picks: {str(e)}")

# Set up scheduled tasks
scheduler = BackgroundScheduler()
scheduler.add_job(fetch_odds_data, 'cron', hour='0')  # Run at midnight
scheduler.add_job(scrape_picks, 'cron', hour='*/8')   # Run every 8 hours
scheduler.start()

@app.route('/api/picks', methods=['GET'])
def get_picks():
    """Get today's picks"""
    try:
        # Combine odds data and scraped picks to generate recommendations
        odds_data = supabase.table('odds_data').select('*').execute()
        scraped_picks = supabase.table('scraped_picks').select('*').execute()
        
        # Implement pick generation logic here
        picks = []  # Generate picks based on odds and scraped data
        
        return jsonify(picks)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages and generate responses"""
    try:
        data = request.json
        user_message = data.get('message')
        user_id = data.get('user_id')
        
        # Store user message
        chat_message = {
            'user_id': user_id,
            'content': user_message,
            'role': 'user'
        }
        supabase.table('chat_messages').insert(chat_message).execute()
        
        # Generate response based on user message and available picks
        # Implement chat logic here
        response = "I'm analyzing the odds and my crystal ball..."
        
        # Store assistant response
        assistant_message = {
            'user_id': user_id,
            'content': response,
            'role': 'assistant'
        }
        supabase.table('chat_messages').insert(assistant_message).execute()
        
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 