import socket

print("Testing port 587...")
try:
    s = socket.create_connection(('smtp.gmail.com', 587), timeout=5)
    s.close()
    print("✅ Port 587 reachable")
except Exception as e:
    print(f"❌ Port 587 blocked: {e}")

print("Testing port 465...")
try:
    s = socket.create_connection(('smtp.gmail.com', 465), timeout=5)
    s.close()
    print("✅ Port 465 reachable")
except Exception as e:
    print(f"❌ Port 465 blocked: {e}")
