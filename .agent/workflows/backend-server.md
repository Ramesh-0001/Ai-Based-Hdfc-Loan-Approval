---
description: Start and monitor the AI Risk Model backend server
---

# AI Risk Model Backend Workflow

This workflow ensures the `api_server.py` backend is running and healthy for loan risk assessments.

## 1. Start the Backend Server
// turbo
Run the following command to start the Flask API server:
```bash
npm run backend
```
The server should be running on `http://localhost:5001`.

## 2. Verify Connectivity
// turbo
Check if the server is responding correctly:
```bash
python test_api.py
```
You should see:
- `TEST 1: Health Check -> PASSED`
- `TEST 2: Loan Prediction -> APPROVED` (for the test case)

## 3. Trouble Shooting
If you still see "AI Server Connection Issue":
1. Ensure no other application is using port `5001`.
2. Check if Python is installed and added to PATH.
3. Check `server_debug.log` for any tracebacks.
