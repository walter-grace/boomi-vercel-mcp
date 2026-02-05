# Replit MCP Server - Multi-User Profile Support

## Inspection Results

### ✅ What's Working

1. **Profile Isolation**: ✅ CONFIRMED
   - Successfully created and stored multiple profiles
   - Profiles are stored independently (test-user-1, test-user-2)
   - `list_boomi_profiles` correctly shows all profiles

2. **Tool Definitions**: ✅ CORRECT
   - All tools that need credentials have `profile` parameter
   - `profile` is marked as required in tool schemas
   - Tools include: `boomi_account_info`, `manage_process`, `manage_trading_partner`, `manage_organization`

3. **Profile Storage**: ✅ WORKING
   - Profiles are stored in a dictionary/map structure
   - `set_boomi_credentials` successfully creates profiles
   - Profiles persist across requests

### ⚠️ Issue Found

**Profile Validation**: ❌ MISSING

When calling a tool with a non-existent profile (e.g., "non-existent-profile-xyz"), the server did NOT return an error. This indicates:

- The server doesn't validate that a profile exists before attempting to use it
- This could lead to:
  - Using wrong/default credentials
  - Confusing error messages
  - Security issues if profiles aren't properly isolated

## Required Fixes

### Fix 1: Add Profile Validation

Add profile existence checks to all tool functions that use credentials:

```python
def boomi_account_info(profile):
    # ADD THIS CHECK:
    if profile not in profiles:
        return {
            "success": False,
            "error": f"Profile '{profile}' not found. Please set credentials first using set_boomi_credentials."
        }
    
    # Then proceed with existing code
    creds = profiles[profile]
    account_id = creds["account_id"]
    username = creds["username"]
    password = creds["password"]
    # ... rest of function
```

### Fix 2: Apply to All Tools

Add the same validation to:

1. **`boomi_account_info(profile)`**
2. **`manage_process_action(action, profile, ...)`**
3. **`manage_trading_partner_action(action, profile, ...)`**
4. **`manage_organization_action(action, profile, ...)`**

### Fix 3: Error Response Format

Ensure errors return in the expected JSON-RPC format:

```python
# If profile doesn't exist:
return {
    "jsonrpc": "2.0",
    "result": {
        "content": [{
            "type": "text",
            "text": json.dumps({
                "success": False,
                "error": f"Profile '{profile}' not found. Please set credentials first."
            })
        }],
        "isError": True
    },
    "id": request_id
}
```

## Prompt for Replit Agent

Copy this prompt and give it to your Replit agent:

---

**Prompt:**

```
I need to add profile validation to the Boomi MCP server to support multiple users safely.

Current Issue:
- When a tool is called with a non-existent profile name, the server doesn't validate it exists
- This could cause security issues or confusing errors

Required Changes:

1. Add profile validation to these functions:
   - boomi_account_info(profile, ...)
   - manage_process_action(action, profile, ...)
   - manage_trading_partner_action(action, profile, ...)
   - manage_organization_action(action, profile, ...)

2. At the start of each function, add this check:
   ```python
   if profile not in profiles:
       return {
           "success": False,
           "error": f"Profile '{profile}' not found. Please set credentials first using set_boomi_credentials."
       }
   ```

3. After validation, look up credentials:
   ```python
   creds = profiles[profile]
   account_id = creds["account_id"]
   username = creds["username"]
   password = creds["password"]
   ```

4. Ensure error responses follow JSON-RPC format with isError: True

Please review the current code and add these validations. The profiles dictionary already exists and stores profiles correctly - we just need to validate before use.
```

---

## Testing After Fix

After the Replit agent makes the changes, run this test:

```bash
# Test with non-existent profile - should fail
curl -X POST https://boomi-mcp-server-replitzip.replit.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "boomi_account_info",
      "arguments": {
        "profile": "non-existent-profile"
      }
    }
  }'
```

Expected result: Should return an error saying the profile doesn't exist.

## Summary

**Good News**: The server already supports multiple profiles! ✅

**What's Needed**: Just add profile validation to prevent using non-existent profiles.

**Impact**: Once fixed, the server will be fully ready for multi-user support where each user can have their own Boomi credentials stored in separate profiles.

