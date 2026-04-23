import json
import os

DATA_FILE = "data/tests.json"

sample_data = {
  "tests": [
    {
      "id": "sample-test-1",
      "name": "API Health Check Test",
      "description": "Basic health check test cases",
      "cases": [
        {
          "name": "Health endpoint returns 200",
          "input_key": "health",
          "expected": {"status": "healthy"},
          "timeout": 5000
        }
      ],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "sample-test-2", 
      "name": "Math Calculator Test",
      "description": "Test basic arithmetic operations",
      "cases": [
        {
          "name": "Addition: 2 + 3 = 5",
          "input_key": "add",
          "input": {"a": 2, "b": 3},
          "expected": 5
        }
      ],
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  ]
}

os.makedirs("data", exist_ok=True)
with open(DATA_FILE, 'w') as f:
    json.dump(sample_data, f, indent=2)

print(f"✅ Created {DATA_FILE} with sample tests!")
print("🔗 Test the API: http://localhost:8000/tests")
print("🚀 Start server: python app.py")