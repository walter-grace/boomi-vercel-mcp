# Boomi MCP Server Implementation Summary

This document provides a quick reference for implementing all new Boomi Platform API tools in the MCP server.

## Quick Start

1. **Read the System Prompt**: Start with `docs/REPLIT_MCP_SERVER_SYSTEM_PROMPT.md` - this contains all implementation instructions
2. **Follow Implementation Guide**: Use `docs/MCP_SERVER_DEPLOYMENT_IMPLEMENTATION.md` for deployment tools
3. **Reference API Docs**: Use `docs/ATOM_API_GUIDE.md`, `docs/PROCESS_BUILDER_GUIDE.md`, and `docs/DEPLOYMENT_API_GUIDE.md` for API details

## Tools to Implement

### Atom API Tools (3 tools)
- `list_atoms` - Query all atoms/runtimes
- `get_atom` - Get atom details
- `query_atom_status` - Get atom status

### Component Query Tools (9 tools)
- `list_connections` - List Connection components
- `get_connection` - Get connection details
- `list_connector_operations` - List ConnectorOperation components
- `get_connector_operation` - Get operation details
- `list_maps` - List Map components
- `get_map` - Get map details
- `list_business_rules` - List BusinessRule components
- `get_business_rule` - Get rule details
- `query_component` - Generic component query

### Process Builder Tools (6 tools)
- `create_process_with_components` - Create process with structure
- `add_process_step` - Add step to process
- `build_process_workflow` - Build workflow from description
- `get_process_structure` - Get full process structure
- `discover_process_components` - Discover available components
- `validate_process_structure` - Validate process structure

### Deployment Tools (7 tools)
- `list_environments` - List environments
- `get_environment` - Get environment details
- `create_deployment_package` - Create deployment package
- `deploy_package` - Deploy package to environment/atoms
- `get_deployment_status` - Get deployment status
- `list_deployments` - List all deployments
- `deploy_process` - Convenience tool (package + deploy)

**Total: 25 new tools**

## Implementation Pattern

All tools follow this pattern:

```python
@mcp.tool()
def tool_name(
    profile: str,
    # ... other parameters
) -> str:
    """
    Tool description.
    
    Args:
        profile: Boomi profile name
        # ... other parameter descriptions
    
    Returns:
        JSON string with results
    """
    # 1. Validate profile
    if profile not in profiles:
        return json.dumps({
            "success": False,
            "error": f"Profile '{profile}' not found..."
        })
    
    # 2. Use query_boomi_api for QUERY/GET operations
    # OR make direct requests for CREATE/UPDATE/custom endpoints
    
    # 3. Return JSON string
    return json.dumps({
        "success": True,
        "result": data
    })
```

## Key Implementation Details

### For QUERY/GET Operations
Use the existing `query_boomi_api` helper function:
```python
result = query_boomi_api(
    profile=profile,
    object_type="Atom",  # or "Connection", "Map", etc.
    action="QUERY",  # or "GET"
    object_id=object_id,  # for GET operations
    query_filter=query_filter,  # optional
    limit=limit
)
```

### For CREATE/UPDATE Operations
Make direct API calls:
```python
base_url = f"https://api.boomi.com/api/rest/v1/{account_id}"
url = f"{base_url}/Process"  # or /Package, /Deployment, etc.

response = requests.post(url, json=payload, headers=headers, auth=auth)
response.raise_for_status()
```

### For Custom Endpoints (Package, Deployment)
Make direct POST requests:
```python
# Package creation
url = f"{base_url}/Package"
payload = {
    "name": name,
    "packageType": "DEPLOYMENT",
    "components": components,
    "environmentId": environment_id
}

# Deployment
url = f"{base_url}/Deployment"
payload = {
    "packageId": package_id,
    "environmentId": environment_id,
    "atomIds": atom_ids  # optional
}
```

## Error Handling

Always use this pattern:
```python
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

## Testing

After implementation, test with:
- `scripts/test-atom-api.ts` - Atom API tools
- `scripts/test-process-builder.ts` - Process builder tools
- `scripts/test-component-discovery.ts` - Component discovery
- `scripts/test-deployment.ts` - Deployment tools

## Documentation Files

- `docs/REPLIT_MCP_SERVER_SYSTEM_PROMPT.md` - **START HERE** - Complete system prompt with all instructions
- `docs/MCP_SERVER_DEPLOYMENT_IMPLEMENTATION.md` - Detailed deployment tool implementations
- `docs/ATOM_API_GUIDE.md` - Atom API reference
- `docs/PROCESS_BUILDER_GUIDE.md` - Process building reference
- `docs/DEPLOYMENT_API_GUIDE.md` - Deployment API reference
- `docs/MCP_INTEGRATION.md` - Updated with all new tools

## Next Steps

1. **Read**: `docs/REPLIT_MCP_SERVER_SYSTEM_PROMPT.md` completely
2. **Implement**: Start with Atom API tools (simplest), then components, then process builder, finally deployment
3. **Test**: Use test scripts to verify each tool works
4. **Register**: Add all tools to the MCP server's tool list
5. **Deploy**: Update the Replit server with new tools

## Support

All tools must:
- Follow existing code patterns
- Use consistent error handling
- Return JSON strings (not Python objects)
- Validate profiles before API calls
- Handle all error cases gracefully

