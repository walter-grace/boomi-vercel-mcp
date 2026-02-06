# MCP Server Extension Specification

This document provides the implementation specification for extending the Boomi MCP server with new tools for querying and managing Boomi components.

## Overview

This specification extends the existing MCP server (hosted on Replit) to add support for querying additional Boomi Platform API object types: Connections, ConnectorOperations, Maps, BusinessRules, Certificates, and other component types.

## Architecture Pattern

All new tools follow the existing pattern used by `manage_process`, `manage_trading_partner`, and `manage_organization`:

1. **Profile Validation**: Check if profile exists before making API calls
2. **Boomi API Integration**: Use the Boomi Platform API REST endpoints
3. **Error Handling**: Return structured error responses
4. **Response Formatting**: Return consistent JSON responses

## Base Helper Function

Create a reusable helper function for Boomi API queries:

```python
import requests
import json
from typing import Dict, Any, Optional

def query_boomi_api(
    profile: str,
    object_type: str,
    action: str = "QUERY",
    object_id: Optional[str] = None,
    query_filter: Optional[Dict] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Generic helper function for Boomi Platform API calls.
    
    Args:
        profile: Profile name for credentials
        object_type: Boomi object type (e.g., "Connection", "Map")
        action: API action ("QUERY", "GET", "CREATE", "UPDATE", "DELETE")
        object_id: Object ID for GET/UPDATE/DELETE operations
        query_filter: Query filter dictionary
        limit: Maximum number of results
    
    Returns:
        Dictionary with success status and result/error
    """
    # Validate profile exists
    if profile not in profiles:
        return {
            "success": False,
            "error": f"Profile '{profile}' not found. Please set credentials first using set_boomi_credentials."
        }
    
    # Get credentials from profile
    creds = profiles[profile]
    account_id = creds["account_id"]
    username = creds["username"]
    password = creds["password"]
    
    # Build API endpoint
    base_url = f"https://api.boomi.com/api/rest/v1/{account_id}"
    
    if action == "QUERY":
        url = f"{base_url}/{object_type}/QUERY"
    elif action == "GET":
        url = f"{base_url}/{object_type}/{object_id}"
    elif action == "CREATE":
        url = f"{base_url}/{object_type}"
    elif action == "UPDATE":
        url = f"{base_url}/{object_type}/{object_id}"
    elif action == "DELETE":
        url = f"{base_url}/{object_type}/{object_id}"
    else:
        return {
            "success": False,
            "error": f"Invalid action: {action}"
        }
    
    # Prepare request
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    auth = (username, password)
    
    try:
        if action == "QUERY":
            # Build query payload
            payload = {
                "max": limit,
                "start": 0
            }
            if query_filter:
                payload["QueryFilter"] = query_filter
            
            response = requests.post(url, json=payload, headers=headers, auth=auth)
        elif action == "GET":
            response = requests.get(url, headers=headers, auth=auth)
        elif action == "CREATE":
            response = requests.post(url, json=query_filter, headers=headers, auth=auth)
        elif action == "UPDATE":
            response = requests.put(url, json=query_filter, headers=headers, auth=auth)
        elif action == "DELETE":
            response = requests.delete(url, headers=headers, auth=auth)
        
        response.raise_for_status()
        
        if action == "QUERY":
            data = response.json()
            return {
                "success": True,
                "result": {
                    "items": data.get("result", []),
                    "count": data.get("numberOfResults", 0)
                }
            }
        else:
            return {
                "success": True,
                "result": response.json()
            }
    
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response else None
        error_msg = f"Boomi API error ({status_code})"
        
        if status_code == 406:
            error_msg += ": Invalid object type or format"
        elif status_code == 404:
            error_msg += ": Object not found"
        elif status_code == 401:
            error_msg += ": Authentication failed"
        elif status_code == 403:
            error_msg += ": Insufficient permissions"
        
        try:
            error_detail = e.response.json() if e.response else {}
            return {
                "success": False,
                "error": error_msg,
                "details": error_detail
            }
        except:
            return {
                "success": False,
                "error": error_msg
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }
```

## Tool Implementations

### 1. list_connections

```python
@mcp.tool()
def list_connections(
    profile: str,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all Connection components.
    
    Args:
        profile: Boomi profile name
        filter: Optional filter expression (e.g., "type = 'Database'")
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of connections
    """
    query_filter = None
    if filter:
        # Parse simple filter expressions
        # For now, support basic filters like "type = 'Database'"
        # In production, implement full filter parser
        parts = filter.split("=")
        if len(parts) == 2:
            prop = parts[0].strip()
            value = parts[1].strip().strip("'\"")
            query_filter = {
                "expression": {
                    "argument": [value],
                    "operator": "EQUALS",
                    "property": prop
                }
            }
    
    result = query_boomi_api(
        profile=profile,
        object_type="Connection",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 2. get_connection

```python
@mcp.tool()
def get_connection(
    profile: str,
    connection_id: str
) -> str:
    """
    Get details of a specific Connection.
    
    Args:
        profile: Boomi profile name
        connection_id: Connection ID (UUID)
    
    Returns:
        JSON string with connection details
    """
    result = query_boomi_api(
        profile=profile,
        object_type="Connection",
        action="GET",
        object_id=connection_id
    )
    
    return json.dumps(result)
```

### 3. list_connector_operations

```python
@mcp.tool()
def list_connector_operations(
    profile: str,
    connection_id: Optional[str] = None,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all ConnectorOperation components.
    
    Args:
        profile: Boomi profile name
        connection_id: Optional filter by connection ID
        filter: Optional additional filter expression
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of connector operations
    """
    query_filter = None
    
    if connection_id:
        query_filter = {
            "expression": {
                "argument": [connection_id],
                "operator": "EQUALS",
                "property": "connectionId"
            }
        }
    elif filter:
        # Parse filter expression
        parts = filter.split("=")
        if len(parts) == 2:
            prop = parts[0].strip()
            value = parts[1].strip().strip("'\"")
            query_filter = {
                "expression": {
                    "argument": [value],
                    "operator": "EQUALS",
                    "property": prop
                }
            }
    
    result = query_boomi_api(
        profile=profile,
        object_type="ConnectorOperation",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 4. get_connector_operation

```python
@mcp.tool()
def get_connector_operation(
    profile: str,
    operation_id: str
) -> str:
    """
    Get details of a specific ConnectorOperation.
    
    Args:
        profile: Boomi profile name
        operation_id: ConnectorOperation ID (UUID)
    
    Returns:
        JSON string with operation details
    """
    result = query_boomi_api(
        profile=profile,
        object_type="ConnectorOperation",
        action="GET",
        object_id=operation_id
    )
    
    return json.dumps(result)
```

### 5. list_maps

```python
@mcp.tool()
def list_maps(
    profile: str,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all Map components.
    
    Args:
        profile: Boomi profile name
        filter: Optional filter expression (e.g., "sourceDocumentType = 'HL7'")
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of maps
    """
    query_filter = None
    if filter:
        parts = filter.split("=")
        if len(parts) == 2:
            prop = parts[0].strip()
            value = parts[1].strip().strip("'\"")
            query_filter = {
                "expression": {
                    "argument": [value],
                    "operator": "EQUALS",
                    "property": prop
                }
            }
    
    result = query_boomi_api(
        profile=profile,
        object_type="Map",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 6. get_map

```python
@mcp.tool()
def get_map(
    profile: str,
    map_id: str
) -> str:
    """
    Get details of a specific Map.
    
    Args:
        profile: Boomi profile name
        map_id: Map ID (UUID)
    
    Returns:
        JSON string with map details
    """
    result = query_boomi_api(
        profile=profile,
        object_type="Map",
        action="GET",
        object_id=map_id
    )
    
    return json.dumps(result)
```

### 7. list_business_rules

```python
@mcp.tool()
def list_business_rules(
    profile: str,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all BusinessRule components.
    
    Args:
        profile: Boomi profile name
        filter: Optional filter expression
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of business rules
    """
    query_filter = None
    if filter:
        parts = filter.split("=")
        if len(parts) == 2:
            prop = parts[0].strip()
            value = parts[1].strip().strip("'\"")
            query_filter = {
                "expression": {
                    "argument": [value],
                    "operator": "EQUALS",
                    "property": prop
                }
            }
    
    result = query_boomi_api(
        profile=profile,
        object_type="BusinessRule",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 8. get_business_rule

```python
@mcp.tool()
def get_business_rule(
    profile: str,
    rule_id: str
) -> str:
    """
    Get details of a specific BusinessRule.
    
    Args:
        profile: Boomi profile name
        rule_id: BusinessRule ID (UUID)
    
    Returns:
        JSON string with rule details
    """
    result = query_boomi_api(
        profile=profile,
        object_type="BusinessRule",
        action="GET",
        object_id=rule_id
    )
    
    return json.dumps(result)
```

### 9. list_certificates

```python
@mcp.tool()
def list_certificates(
    profile: str,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all Certificate components.
    
    Args:
        profile: Boomi profile name
        filter: Optional filter expression
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of certificates
    """
    query_filter = None
    if filter:
        parts = filter.split("=")
        if len(parts) == 2:
            prop = parts[0].strip()
            value = parts[1].strip().strip("'\"")
            query_filter = {
                "expression": {
                    "argument": [value],
                    "operator": "EQUALS",
                    "property": prop
                }
            }
    
    result = query_boomi_api(
        profile=profile,
        object_type="Certificate",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 10. query_component (Generic)

```python
@mcp.tool()
def query_component(
    profile: str,
    object_type: str,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    Generic component query tool for any object type.
    
    Args:
        profile: Boomi profile name
        object_type: Boomi object type (e.g., "Connection", "Map", "CrossReference")
        filter: Optional filter expression
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with query results
    """
    query_filter = None
    if filter:
        parts = filter.split("=")
        if len(parts) == 2:
            prop = parts[0].strip()
            value = parts[1].strip().strip("'\"")
            query_filter = {
                "expression": {
                    "argument": [value],
                    "operator": "EQUALS",
                    "property": prop
                }
            }
    
    result = query_boomi_api(
        profile=profile,
        object_type=object_type,
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

## Tool Registration

Register all new tools in the MCP server's tool list:

```python
# In your MCP server initialization
tools = [
    # Existing tools...
    list_connections,
    get_connection,
    list_connector_operations,
    get_connector_operation,
    list_maps,
    get_map,
    list_business_rules,
    get_business_rule,
    list_certificates,
    query_component,
]
```

## Error Handling

All tools should handle the following error scenarios:

1. **Profile Not Found**: Return clear error message
2. **Authentication Failure**: Handle 401 errors gracefully
3. **Permission Denied**: Handle 403 errors
4. **Object Not Found**: Handle 404 errors for GET operations
5. **Invalid Object Type**: Handle 406 errors
6. **Network Errors**: Handle connection timeouts and network failures

## Response Format

All tools return JSON strings with this structure:

**Success Response:**
```json
{
  "success": true,
  "result": {
    "items": [...],
    "count": 10
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

## Testing

Test each tool with:

1. Valid profile and parameters
2. Invalid profile name
3. Non-existent object IDs
4. Invalid object types
5. Network failures
6. Authentication errors

## Implementation Checklist

- [ ] Create `query_boomi_api` helper function
- [ ] Implement `list_connections` tool
- [ ] Implement `get_connection` tool
- [ ] Implement `list_connector_operations` tool
- [ ] Implement `get_connector_operation` tool
- [ ] Implement `list_maps` tool
- [ ] Implement `get_map` tool
- [ ] Implement `list_business_rules` tool
- [ ] Implement `get_business_rule` tool
- [ ] Implement `list_certificates` tool
- [ ] Implement `query_component` generic tool
- [ ] Register all tools in MCP server
- [ ] Test all tools with valid credentials
- [ ] Test error handling scenarios
- [ ] Update tool documentation

## Notes

1. **Filter Parsing**: The current filter parsing is simplified. For production, consider implementing a full filter expression parser that supports multiple operators and complex expressions.

2. **Pagination**: The current implementation uses a simple limit. Consider adding support for pagination with `start` parameter for large result sets.

3. **Caching**: Consider adding caching for frequently accessed components to reduce API calls.

4. **Rate Limiting**: Be aware of Boomi API rate limits and implement appropriate throttling if needed.

5. **Object Type Validation**: Consider validating object type names before making API calls to provide better error messages.

