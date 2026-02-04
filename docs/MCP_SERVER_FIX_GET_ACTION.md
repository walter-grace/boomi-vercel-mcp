# Fix MCP Server: Get Process Details (406 Error)

## Problem

When calling `manage_process` with `action: "get"`, the MCP server successfully receives the parameters but the Boomi API returns a **406 (Not Acceptable)** error.

## Error Details

```
ApiError(
    message='406 error in request to: https://api.boomi.com/api/rest/v1/{account_id}/Component/{component_id}',
    status=406
)
```

## Root Cause

The MCP server is calling the Boomi Component API endpoint incorrectly. A 406 error typically indicates:
- Missing or incorrect `Accept` header
- Missing or incorrect `Content-Type` header  
- Missing required query parameters
- Incorrect API endpoint format

## What to Fix

In the MCP server's Python code, find the function that handles `manage_process` with `action: "get"` and fix the Boomi API call.

### Current (Incorrect) Call
The server is likely calling:
```python
GET /api/rest/v1/{account_id}/Component/{component_id}
```

### Expected Fix

The Boomi Component API might need:
1. **Correct Accept header**: `application/json` or `application/xml`
2. **Query parameters**: The API might require additional parameters like `type=Process`
3. **Different endpoint**: Might need `/Process/{id}` instead of `/Component/{id}`

### Example Fix

```python
# In the manage_process_action function, for 'get' action:
def manage_process_action(action, profile, process_id=None, ...):
    if action == "get":
        if not process_id:
            return {"error": "process_id is required for get action"}
        
        # Get credentials
        credentials = get_credentials(profile)
        
        # Call Boomi API with correct headers
        headers = {
            "Accept": "application/json",  # Ensure this is set
            "Content-Type": "application/json",
            "Authorization": f"Basic {base64_credentials}"
        }
        
        # Try the Component endpoint with type parameter
        url = f"https://api.boomi.com/api/rest/v1/{account_id}/Component/{process_id}?type=Process"
        
        # Or try the Process-specific endpoint
        # url = f"https://api.boomi.com/api/rest/v1/{account_id}/Process/{process_id}"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return {"success": True, "data": response.json()}
        else:
            return {"error": f"API returned {response.status_code}: {response.text}"}
```

## Testing

After the fix, test with:
```json
{
  "name": "manage_process",
  "arguments": {
    "action": "get",
    "profile": "production",
    "process_id": "1e5efba1-d398-4420-97e2-29da11685980"
  }
}
```

Should return process details instead of 406 error.

## Reference

- Boomi API Documentation: Component API endpoints
- Check if the endpoint needs `type=Process` query parameter
- Verify Accept headers match API requirements

