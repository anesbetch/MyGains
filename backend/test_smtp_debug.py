import smtplib
import ssl
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path(__file__).resolve().parent / '.env')

user = os.getenv('EMAIL_HOST_USER')
password = os.getenv('EMAIL_HOST_PASSWORD', '').replace(' ', '')

print(f"User: {user}")
print(f"Password length: {len(password)} chars")
print()

# Test 1: port 587 STARTTLS
print("--- Test 1: port 587 STARTTLS ---")
try:
    with smtplib.SMTP('smtp.gmail.com', 587, timeout=10) as smtp:
        smtp.set_debuglevel(1)
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(user, password)
        print("✅ Login successful on port 587!")
except Exception as e:
    print(f"❌ Failed: {e}")

print()

# Test 2: port 465 SSL
print("--- Test 2: port 465 SSL ---")
try:
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=ctx, timeout=10) as smtp:
        smtp.set_debuglevel(1)
        smtp.login(user, password)
        print("✅ Login successful on port 465!")
except Exception as e:
    print(f"❌ Failed: {e}")
