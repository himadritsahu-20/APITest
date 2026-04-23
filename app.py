from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any
import uvicorn

app = FastAPI(title="Real-time Testing API", version="1.0.0")

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage
DATA_FILE = "data/tests.json"
os.makedirs("data", exist_ok=True)

def load_data():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except:
        return {"tests": []}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Initialize data
initial_data = load_data()
if not initial_data.get("tests"):
    save_data({"tests": []})

@app.on_event("startup")
async def startup():
    print("🚀 Real-time Testing API Started!")
    print("📊 Visit http://localhost:8000/docs for interactive API")

# Test endpoints
@app.post("/tests", response_model=dict)
async def create_test(test_data: Dict[str, Any]):
    """Create a new test"""
    tests = load_data()["tests"]
    test_id = str(uuid.uuid4())
    test = {
        "id": test_id,
        "name": test_data.get("name", "Untitled Test"),
        "description": test_data.get("description", ""),
        "cases": test_data.get("cases", []),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    tests.append(test)
    save_data({"tests": tests})
    return {"message": "Test created", "test_id": test_id, "test": test}

@app.get("/tests")
async def get_tests():
    """Get all tests"""
    return load_data()

@app.get("/tests/{test_id}")
async def get_test(test_id: str):
    """Get specific test"""
    tests = load_data()["tests"]
    test = next((t for t in tests if t["id"] == test_id), None)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@app.put("/tests/{test_id}")
async def update_test(test_id: str, test_data: Dict[str, Any]):
    """Update test"""
    tests = load_data()["tests"]
    test = next((t for t in tests if t["id"] == test_id), None)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test.update(test_data)
    test["updated_at"] = datetime.now().isoformat()
    save_data({"tests": tests})
    return {"message": "Test updated", "test": test}

@app.delete("/tests/{test_id}")
async def delete_test(test_id: str):
    """Delete test"""
    tests = load_data()["tests"]
    test = next((t for t in tests if t["id"] == test_id), None)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    tests = [t for t in tests if t["id"] != test_id]
    save_data({"tests": tests})
    return {"message": "Test deleted"}

# Real-time testing endpoint
@app.post("/tests/{test_id}/run")
async def run_test(test_id: str, inputs: Dict[str, Any]):
    """Run test cases with real-time results"""
    tests = load_data()["tests"]
    test = next((t for t in tests if t["id"] == test_id), None)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    results = []
    for case in test.get("cases", []):
        result = {
            "case_name": case.get("name"),
            "expected": case.get("expected"),
            "input": inputs.get(case.get("input_key", "input")),
            "actual": "SIMULATED_RESULT",  # Replace with real execution
            "passed": True,  # Replace with real validation
            "timestamp": datetime.now().isoformat()
        }
        results.append(result)
    
    return {
        "test_id": test_id,
        "results": results,
        "summary": {
            "total": len(results),
            "passed": len([r for r in results if r["passed"]]),
            "failed": len([r for r in results if not r["passed"]])
        }
    }

# EXPORT/IMPORT SECTOR
@app.get("/export/{test_id}")
async def export_test(test_id: str):
    """Export test as JSON file"""
    tests = load_data()["tests"]
    test = next((t for t in tests if t["id"] == test_id), None)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    filename = f"test_{test_id}.json"
    with open(f"data/{filename}", "w") as f:
        json.dump(test, f, indent=2)
    
    return FileResponse(
        path=f"data/{filename}",
        filename=filename,
        media_type="application/json"
    )

@app.post("/import")
async def import_test(file: UploadFile = File(...)):
    """Import test from JSON file"""
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files allowed")
    
    content = await file.read()
    try:
        test_data = json.loads(content)
        tests = load_data()["tests"]
        test_data["id"] = str(uuid.uuid4())  # New ID for imported test
        test_data["imported_at"] = datetime.now().isoformat()
        tests.append(test_data)
        save_data({"tests": tests})
        return {"message": "Test imported", "test": test_data}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

@app.get("/export/all")
async def export_all():
    """Export all tests"""
    data = load_data()
    filename = f"all_tests_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(f"data/{filename}", "w") as f:
        json.dump(data, f, indent=2)
    return FileResponse(
        path=f"data/{filename}",
        filename=filename,
        media_type="application/json"
    )

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)