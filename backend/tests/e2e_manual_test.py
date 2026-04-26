import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_e2e():
    print("--- Starting Backend E2E Test ---")
    
    # 1. Register
    email = f"test_{int(time.time())}@example.com"
    print(f"Registering user: {email}")
    reg_data = {
        "email": email,
        "password": "password123",
        "name": "Test User"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", data=reg_data)
    assert resp.status_code == 200, f"Registration failed: {resp.text}"
    token = resp.json()["access_token"]
    user_id = resp.json()["user"]["email"] # Using email as proxy for ID check
    print("Registration successful!")

    # 2. Login
    print("Logging in...")
    login_data = {"email": email, "password": "password123"}
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    assert resp.status_code == 200, "Login failed"
    print("Login successful!")

    # 3. Upload Resume & JD
    print("Uploading Resume & JD...")
    upload_data = {
        "resume_text": "Expert in Python and React with 10 years experience.",
        "jd_text": "Looking for a Senior Developer with Python, React and Node skills.",
        "user_id": email # For this test we pass email as ID if not extracted
    }
    resp = requests.post(f"{BASE_URL}/upload", data=upload_data)
    assert resp.status_code == 200, f"Upload failed: {resp.text}"
    session_id = resp.json()["id"]
    print(f"Upload successful! Session ID: {session_id}")

    # 4. Generate Roadmap
    print("Generating Roadmap...")
    resp = requests.get(f"{BASE_URL}/generate-roadmap/{session_id}")
    assert resp.status_code == 200, f"Roadmap generation failed: {resp.text}"
    roadmap = resp.json()
    print(f"Roadmap generated for: {roadmap['target_role']}")
    assert len(roadmap['weeks']) > 0, "Roadmap weeks are empty"
    print("Roadmap validation successful!")

    # 5. Check User Sessions
    print("Fetching User Sessions...")
    resp = requests.get(f"{BASE_URL}/user/sessions/{email}")
    assert resp.status_code == 200, "Fetch sessions failed"
    sessions = resp.json()
    assert len(sessions) > 0, "No sessions found for user"
    print(f"Found {len(sessions)} sessions for user. Persistence confirmed!")

    print("\n--- E2E Test Passed Successfully! ---")

if __name__ == "__main__":
    try:
        test_e2e()
    except Exception as e:
        print(f"\n--- E2E Test FAILED: {e} ---")
