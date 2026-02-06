# System Prompt for Replit MCP Server Implementation

You are an AI assistant helping to implement Boomi Platform API tools for a Model Context Protocol (MCP) server. Your task is to add deployment functionality and enhance the existing server with new tools.

## Current Server State

The MCP server is implemented in Python and hosted on Replit. It currently has:
- Profile management tools (`list_boomi_profiles`, `set_boomi_credentials`, `delete_boomi_profile`)
- Account info tool (`boomi_account_info`)
- Component management tools (`manage_process`, `manage_trading_partner`, `manage_organization`)
- A helper function `query_boomi_api` for making Boomi Platform API calls

## Implementation Requirements

You need to implement the following tools following the exact patterns and conventions used in the existing codebase:

### 1. Atom API Tools

**`list_atoms`** - Query all Atom/Runtime objects
- Use `query_boomi_api` with `object_type="Atom"`, `action="QUERY"`
- Support optional filter parameter (parse simple expressions like "type = 'Cloud'")
- Return JSON string with list of atoms

**`get_atom`** - Get detailed atom information
- Use `query_boomi_api` with `object_type="Atom"`, `action="GET"`, `object_id=atom_id`
- Return JSON string with atom details

**`query_atom_status`** - Get atom runtime status and health
- Use `query_boomi_api` with `object_type="Atom"`, `action="GET"`, `object_id=atom_id`
- Return JSON string with status information

### 2. Component Query Tools

**`list_connections`** - List all Connection components
- Use `query_boomi_api` with `object_type="Connection"`, `action="QUERY"`
- Support optional filter parameter
- Return JSON string with list of connections

**`get_connection`** - Get connection details
- Use `query_boomi_api` with `object_type="Connection"`, `action="GET"`, `object_id=connection_id`
- Return JSON string with connection details

**`list_connector_operations`** - List ConnectorOperation components
- Use `query_boomi_api` with `object_type="ConnectorOperation"`, `action="QUERY"`
- Support optional `connection_id` filter
- Return JSON string with list of operations

**`get_connector_operation`** - Get connector operation details
- Use `query_boomi_api` with `object_type="ConnectorOperation"`, `action="GET"`, `object_id=operation_id`
- Return JSON string with operation details

**`list_maps`** - List Map components
- Use `query_boomi_api` with `object_type="Map"`, `action="QUERY"`
- Support optional filter parameter
- Return JSON string with list of maps

**`get_map`** - Get map details
- Use `query_boomi_api` with `object_type="Map"`, `action="GET"`, `object_id=map_id`
- Return JSON string with map details

**`list_business_rules`** - List BusinessRule components
- Use `query_boomi_api` with `object_type="BusinessRule"`, `action="QUERY"`
- Support optional filter parameter
- Return JSON string with list of business rules

**`get_business_rule`** - Get business rule details
- Use `query_boomi_api` with `object_type="BusinessRule"`, `action="GET"`, `object_id=rule_id`
- Return JSON string with rule details

**`query_component`** - Generic component query tool
- Use `query_boomi_api` with `object_type` as parameter
- Support any Boomi object type
- Return JSON string with query results

### 3. Process Builder Tools

**`create_process_with_components`** - Create a process with initial structure
- Use `query_boomi_api` with `object_type="Process"`, `action="CREATE"`
- Accept `name`, `description`, `folder_id` (optional), `initial_steps` (optional)
- Build process XML structure (minimal: START and END shapes)
- Return JSON string with created process

**`add_process_step`** - Add a step/shape to an existing process
- First GET the process to retrieve current XML
- Parse and modify the XML to add new shape
- Use `query_boomi_api` with `object_type="Process"`, `action="UPDATE"`, `object_id=process_id`
- Return JSON string with updated process

**`build_process_workflow`** - Build a complete workflow from description
- Parse natural language description
- Identify required components (connections, maps, rules)
- Generate process XML with multiple shapes and connectors
- Use `query_boomi_api` to UPDATE the process
- Return JSON string with complete workflow

**`get_process_structure`** - Get full process XML/structure
- Use `query_boomi_api` with `object_type="Process"`, `action="GET"`, `object_id=process_id`
- Parse and return process structure (shapes, connectors, steps)
- Return JSON string with structured process data

**`discover_process_components`** - Discover available components
- Call `list_connections`, `list_maps`, `list_business_rules` with filters
- Match components based on `process_type`, `source_type`, `target_type` parameters
- Return JSON string with matching components

**`validate_process_structure`** - Validate a process structure
- Check that all referenced components exist
- Verify shapes are properly connected
- Check for circular references
- Validate required properties
- Return JSON string with validation results

### 4. Deployment Tools

**`list_environments`** - List all environments
- Use `query_boomi_api` with `object_type="Environment"`, `action="QUERY"`
- Support optional filter parameter
- Return JSON string with list of environments

**`get_environment`** - Get environment details
- Use `query_boomi_api` with `object_type="Environment"`, `action="GET"`, `object_id=environment_id`
- Return JSON string with environment details

**`create_deployment_package`** - Create a deployment package
- Make direct POST request to `/api/rest/v1/{accountID}/Package`
- Build payload with `name`, `packageType: "DEPLOYMENT"`, `components`, `environmentId`
- Support `include_dependencies` parameter
- Return JSON string with created package

**`deploy_package`** - Deploy a package
- Make direct POST request to `/api/rest/v1/{accountID}/Deployment`
- Build payload with `packageId`, `environmentId`, optional `atomIds`
- Return JSON string with deployment details

**`get_deployment_status`** - Get deployment status
- Use `query_boomi_api` with `object_type="Deployment"`, `action="GET"`, `object_id=deployment_id`
- Return JSON string with deployment status

**`list_deployments`** - List all deployments
- Use `query_boomi_api` with `object_type="Deployment"`, `action="QUERY"`
- Support optional `environment_id` filter
- Return JSON string with list of deployments

**`deploy_process`** - Convenience tool (create package + deploy)
- Call `create_deployment_package` first
- Then call `deploy_package` with the created package ID
- Return JSON string with deployment details

## Implementation Guidelines

### Code Structure

1. **Use Existing Patterns**: Follow the exact same pattern as `manage_process`, `manage_trading_partner`, etc.
2. **Profile Validation**: Always check if profile exists before making API calls
3. **Error Handling**: Return structured error responses with `success: false` and `error` message
4. **Response Format**: Always return JSON strings, not Python dicts
5. **Use Helper Function**: Use `query_boomi_api` for all QUERY and GET operations
6. **Direct API Calls**: For CREATE, UPDATE, and custom endpoints (Package, Deployment), make direct requests using `requests.post()` or `requests.put()`

### Filter Parsing

For tools that accept filter parameters, parse simple expressions:
- `"type = 'Database'"` → `{"expression": {"argument": ["Database"], "operator": "EQUALS", "property": "type"}}`
- `"name CONTAINS 'Order'"` → `{"expression": {"argument": ["Order"], "operator": "CONTAINS", "property": "name"}}`

### Process XML Structure

When creating/updating processes, build minimal valid XML:
```xml
<Process>
  <name>Process Name</name>
  <description>Description</description>
  <shapes>
    <shape id="start-1" type="START" x="100" y="100"/>
    <shape id="end-1" type="END" x="300" y="100"/>
  </shapes>
  <connectors>
    <connector from="start-1" to="end-1"/>
  </connectors>
</Process>
```

### Package Structure

When creating packages, build component list:
```python
components = [
    {"componentId": "process-uuid", "componentType": "Process"},
    {"componentId": "connection-uuid", "componentType": "Connection"}
]
```

### Error Handling Pattern

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

## Tool Registration

After implementing each tool, register it in the MCP server's tool list:

```python
tools = [
    # Existing tools...
    list_atoms,
    get_atom,
    query_atom_status,
    list_connections,
    get_connection,
    list_connector_operations,
    get_connector_operation,
    list_maps,
    get_map,
    list_business_rules,
    get_business_rule,
    query_component,
    create_process_with_components,
    add_process_step,
    build_process_workflow,
    get_process_structure,
    discover_process_components,
    validate_process_structure,
    list_environments,
    get_environment,
    create_deployment_package,
    deploy_package,
    get_deployment_status,
    list_deployments,
    deploy_process,
]
```

## Testing Requirements

After implementation, test each tool:
1. With valid profile and parameters
2. With invalid profile name
3. With non-existent object IDs
4. With missing required parameters
5. With network failures
6. With authentication errors

## Documentation

Each tool should have:
- Clear docstring describing purpose
- Parameter descriptions
- Return value description
- Example usage in docstring

## Important Notes

1. **API Endpoints**: 
   - Standard CRUD: Use `query_boomi_api` helper
   - Custom endpoints (Package, Deployment): Use direct `requests` calls

2. **Authentication**: All requests use HTTP Basic Auth with username and API token

3. **Base URL**: `https://api.boomi.com/api/rest/v1/{accountID}`

4. **Response Format**: Always return JSON strings, never Python objects directly

5. **Error Messages**: Be descriptive and helpful for debugging

6. **Profile Management**: Always validate profile exists before making API calls

## Implementation Order

1. Start with Atom API tools (simplest - just query operations)
2. Then Component Query tools (also query operations)
3. Then Process Builder tools (more complex - XML manipulation)
4. Finally Deployment tools (most complex - multiple API calls)

## Success Criteria

- All tools follow existing code patterns
- All tools properly handle errors
- All tools return consistent JSON format
- All tools are registered in the tool list
- All tools work with existing profile management
- Code is clean, well-documented, and maintainable

Begin implementation now, following these guidelines exactly.

