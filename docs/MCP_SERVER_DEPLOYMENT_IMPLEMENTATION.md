# MCP Server Deployment Tools Implementation Guide

This document provides the implementation specification for adding deployment tools to the Boomi MCP server.

## Overview

This extends the existing MCP server with deployment capabilities, allowing the agent to:
1. List and query environments
2. Create deployment packages
3. Deploy packages to environments and atoms
4. Monitor deployment status
5. List deployment history

## Implementation Pattern

All new tools follow the existing pattern used by other Boomi tools:
1. **Profile Validation**: Check if profile exists before making API calls
2. **Boomi API Integration**: Use the Boomi Platform API REST endpoints
3. **Error Handling**: Return structured error responses
4. **Response Formatting**: Return consistent JSON responses

## Base Helper Function

Use the existing `query_boomi_api` helper function from `MCP_SERVER_EXTENSION_SPEC.md`:

```python
def query_boomi_api(
    profile: str,
    object_type: str,
    action: str = "QUERY",
    object_id: Optional[str] = None,
    query_filter: Optional[Dict] = None,
    limit: int = 100
) -> Dict[str, Any]:
    # Existing implementation
    pass
```

## Tool Implementations

### 1. list_environments

```python
@mcp.tool()
def list_environments(
    profile: str,
    filter: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all Environment objects available for deployment.
    
    Args:
        profile: Boomi profile name
        filter: Optional filter expression (e.g., "name = 'Production'")
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of environments
    """
    query_filter = None
    if filter:
        # Parse simple filter expressions
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
        object_type="Environment",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 2. get_environment

```python
@mcp.tool()
def get_environment(
    profile: str,
    environment_id: str
) -> str:
    """
    Get details of a specific Environment.
    
    Args:
        profile: Boomi profile name
        environment_id: Environment ID (UUID)
    
    Returns:
        JSON string with environment details
    """
    result = query_boomi_api(
        profile=profile,
        object_type="Environment",
        action="GET",
        object_id=environment_id
    )
    
    return json.dumps(result)
```

### 3. create_deployment_package

```python
@mcp.tool()
def create_deployment_package(
    profile: str,
    name: str,
    process_ids: List[str],
    environment_id: str,
    include_dependencies: bool = True,
    additional_components: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Create a deployment package containing processes and components.
    
    Args:
        profile: Boomi profile name
        name: Package name
        process_ids: List of process UUIDs to include
        environment_id: Target environment UUID
        include_dependencies: Automatically include dependencies (default: True)
        additional_components: Optional list of additional components
            Format: [{"componentId": "uuid", "componentType": "Connection"}]
    
    Returns:
        JSON string with created package details
    """
    # Validate profile
    if profile not in profiles:
        return json.dumps({
            "success": False,
            "error": f"Profile '{profile}' not found. Please set credentials first using set_boomi_credentials."
        })
    
    creds = profiles[profile]
    account_id = creds["account_id"]
    username = creds["username"]
    password = creds["password"]
    
    # Build components list
    components = []
    for process_id in process_ids:
        components.append({
            "componentId": process_id,
            "componentType": "Process"
        })
    
    if additional_components:
        components.extend(additional_components)
    
    # Build package payload
    payload = {
        "name": name,
        "packageType": "DEPLOYMENT",
        "components": components,
        "environmentId": environment_id
    }
    
    if include_dependencies:
        payload["includeDependencies"] = True
    
    # Make API call
    base_url = f"https://api.boomi.com/api/rest/v1/{account_id}"
    url = f"{base_url}/Package"
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    auth = (username, password)
    
    try:
        response = requests.post(url, json=payload, headers=headers, auth=auth)
        response.raise_for_status()
        
        return json.dumps({
            "success": True,
            "result": response.json()
        })
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response else None
        error_msg = f"Boomi API error ({status_code})"
        
        try:
            error_detail = e.response.json() if e.response else {}
            return json.dumps({
                "success": False,
                "error": error_msg,
                "details": error_detail
            })
        except:
            return json.dumps({
                "success": False,
                "error": error_msg
            })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        })
```

### 4. deploy_package

```python
@mcp.tool()
def deploy_package(
    profile: str,
    package_id: str,
    environment_id: str,
    atom_ids: Optional[List[str]] = None,
    deployment_name: Optional[str] = None
) -> str:
    """
    Deploy a package to target environment and atoms.
    
    Args:
        profile: Boomi profile name
        package_id: Package UUID
        environment_id: Target environment UUID
        atom_ids: Optional list of specific atom UUIDs (deploys to all if not provided)
        deployment_name: Optional custom deployment name
    
    Returns:
        JSON string with deployment details
    """
    # Validate profile
    if profile not in profiles:
        return json.dumps({
            "success": False,
            "error": f"Profile '{profile}' not found. Please set credentials first using set_boomi_credentials."
        })
    
    creds = profiles[profile]
    account_id = creds["account_id"]
    username = creds["username"]
    password = creds["password"]
    
    # Build deployment payload
    payload = {
        "packageId": package_id,
        "environmentId": environment_id
    }
    
    if atom_ids:
        payload["atomIds"] = atom_ids
    
    if deployment_name:
        payload["deploymentName"] = deployment_name
    
    # Make API call
    base_url = f"https://api.boomi.com/api/rest/v1/{account_id}"
    url = f"{base_url}/Deployment"
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    auth = (username, password)
    
    try:
        response = requests.post(url, json=payload, headers=headers, auth=auth)
        response.raise_for_status()
        
        return json.dumps({
            "success": True,
            "result": response.json()
        })
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response else None
        error_msg = f"Boomi API error ({status_code})"
        
        try:
            error_detail = e.response.json() if e.response else {}
            return json.dumps({
                "success": False,
                "error": error_msg,
                "details": error_detail
            })
        except:
            return json.dumps({
                "success": False,
                "error": error_msg
            })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        })
```

### 5. get_deployment_status

```python
@mcp.tool()
def get_deployment_status(
    profile: str,
    deployment_id: str
) -> str:
    """
    Get the current status of a deployment.
    
    Args:
        profile: Boomi profile name
        deployment_id: Deployment UUID
    
    Returns:
        JSON string with deployment status
    """
    result = query_boomi_api(
        profile=profile,
        object_type="Deployment",
        action="GET",
        object_id=deployment_id
    )
    
    return json.dumps(result)
```

### 6. list_deployments

```python
@mcp.tool()
def list_deployments(
    profile: str,
    environment_id: Optional[str] = None,
    limit: int = 100
) -> str:
    """
    List all deployments, optionally filtered by environment.
    
    Args:
        profile: Boomi profile name
        environment_id: Optional filter by environment UUID
        limit: Maximum number of results (default: 100)
    
    Returns:
        JSON string with list of deployments
    """
    query_filter = None
    if environment_id:
        query_filter = {
            "expression": {
                "argument": [environment_id],
                "operator": "EQUALS",
                "property": "environmentId"
            }
        }
    
    result = query_boomi_api(
        profile=profile,
        object_type="Deployment",
        action="QUERY",
        query_filter=query_filter,
        limit=limit
    )
    
    return json.dumps(result)
```

### 7. deploy_process

```python
@mcp.tool()
def deploy_process(
    profile: str,
    process_id: str,
    environment_id: str,
    atom_ids: Optional[List[str]] = None,
    include_dependencies: bool = True
) -> str:
    """
    Convenience tool that creates a package and deploys it in one step.
    
    Args:
        profile: Boomi profile name
        process_id: Process UUID to deploy
        environment_id: Target environment UUID
        atom_ids: Optional list of specific atom UUIDs
        include_dependencies: Include dependencies (default: True)
    
    Returns:
        JSON string with deployment details
    """
    # Step 1: Create package
    package_result = create_deployment_package(
        profile=profile,
        name=f"Deploy Process {process_id[:8]}",
        process_ids=[process_id],
        environment_id=environment_id,
        include_dependencies=include_dependencies
    )
    
    package_data = json.loads(package_result)
    if not package_data.get("success"):
        return package_result
    
    package_id = package_data["result"]["id"]
    
    # Step 2: Deploy package
    deployment_result = deploy_package(
        profile=profile,
        package_id=package_id,
        environment_id=environment_id,
        atom_ids=atom_ids
    )
    
    return deployment_result
```

## Tool Registration

Register all new tools in the MCP server's tool list:

```python
# In your MCP server initialization
tools = [
    # Existing tools...
    list_environments,
    get_environment,
    create_deployment_package,
    deploy_package,
    get_deployment_status,
    list_deployments,
    deploy_process,
]
```

## Error Handling

All tools should handle:
- Profile not found errors
- Authentication failures (401)
- Permission errors (403) - may need DEPLOYMENT_MANAGEMENT privilege
- Invalid package/deployment IDs (404)
- Deployment conflicts (409) - deployment already in progress
- Network timeouts
- Rate limiting

## Response Format

All tools return JSON strings with this structure:

**Success Response:**
```json
{
  "success": true,
  "result": {
    "id": "uuid",
    "status": "COMPLETED",
    ...
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
3. Non-existent environment/package/deployment IDs
4. Missing required privileges
5. Network failures
6. Authentication errors

## Implementation Checklist

- [ ] Implement `list_environments` tool
- [ ] Implement `get_environment` tool
- [ ] Implement `create_deployment_package` tool
- [ ] Implement `deploy_package` tool
- [ ] Implement `get_deployment_status` tool
- [ ] Implement `list_deployments` tool
- [ ] Implement `deploy_process` convenience tool
- [ ] Register all tools in MCP server
- [ ] Test all tools with valid credentials
- [ ] Test error handling scenarios
- [ ] Update tool documentation

## Notes

1. **Dependencies**: When `include_dependencies` is true, Boomi automatically includes all required components (connections, maps, etc.) in the package.

2. **Deployment Status**: Deployments may take time. Use `get_deployment_status` to poll for completion.

3. **Atom Selection**: If `atom_ids` is not provided, the package deploys to all atoms in the environment.

4. **Package Types**: Only "DEPLOYMENT" package type is supported for deployment operations.

5. **Privileges**: Ensure the API user has `DEPLOYMENT_MANAGEMENT` privilege for write operations.

