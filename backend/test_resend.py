import requests
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path(__file__).resolve().parent / '.env')

api_key = os.getenv('RESEND_API_KEY', '')
print(f"API Key found: {'YES - ' + api_key[:10] + '...' if api_key else 'NO'}")

resp = requests.post(
    'https://api.resend.com/emails',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    },
    json={
        'from': 'FitStore <onboarding@resend.dev>',
        'to': ['anesbetch248@gmail.com'],
        'subject': 'FitStore Test Email',
        'html': '<h1>It works! 💪</h1><p>FitStore emails are working correctly.</p>',
    },
    timeout=10,
)

print(f"Status: {resp.status_code}")
print(f"Response: {resp.text}")
