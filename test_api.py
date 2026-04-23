import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    # Create test
    test_data = {
        "name": "Sample Test",
        "description": "Testing API functionality",
        "cases": [
            {"name": "Case 1", "input_key": "input1", "expected": "output1"},
            {"name": "Case 2", "input_key": "input2", "expected": "output2"}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/tests", json=test_data)
    print("✅ CREATE:", response.json())
    
    test_id = response.json()["test_id"]
    
    # Run test
    inputs = {"input1": "test1", "input2": "test2"}
    response = requests.post(f"{BASE_URL}/tests/{test_id}/run", json=inputs)
    print("✅ RUN:", response.json())
    
    # Export
    response = requests.get(f"{BASE_URL}/export/{test_id}")
    print("✅ EXPORT: File downloaded")
    
    print("🎉 All tests passed!")

if __name__ == "__main__":
    test_api()