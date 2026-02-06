# Boomi MCP Server Integration

This document describes the integration of the Boomi MCP (Model Context Protocol) server with the Vercel chatbot.

## Overview

The chatbot is integrated with a Boomi MCP server hosted on Replit, which provides tools for managing Boomi Platform integrations.

## Current Tools (7)

1. `list_boomi_profiles` - List all saved Boomi credential profiles
2. `set_boomi_credentials` - Store Boomi API credentials
3. `delete_boomi_profile` - Delete a stored credential profile
4. `boomi_account_info` - Get Boomi account information
5. `manage_trading_partner` - Manage B2B/EDI trading partners (CRUD operations)
6. `manage_process` - Manage Boomi process components (CRUD operations)
7. `manage_organization` - Manage Boomi organization components (CRUD operations)

## New Tools (Atom API & Process Builder)

### Atom API Tools
8. `list_atoms` - List all Atom/Runtime objects
   - Parameters: `profile` (required), `filter` (optional), `limit` (optional)
   - Returns: Array of Atom objects with IDs, names, types, status, versions
   - Example: "List all my atoms" or "Show me all cloud runtimes"
   - See: [Atom API Guide](ATOM_API_GUIDE.md)

9. `get_atom` - Get detailed atom information
   - Parameters: `profile` (required), `atom_id` (required)
   - Returns: Full Atom object with capabilities, version, installation date
   - Example: "Get details for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   - See: [Atom API Guide](ATOM_API_GUIDE.md)

10. `query_atom_status` - Get atom runtime status and health
    - Parameters: `profile` (required), `atom_id` (required)
    - Returns: Atom status, version, capabilities, health metrics
    - Example: "Check the status of my production atom"
    - See: [Atom API Guide](ATOM_API_GUIDE.md)

### Process Builder Tools
11. `create_process_with_components` - Create a process with initial structure
    - Parameters: `profile`, `name`, `description` (optional), `folder_id` (optional), `initial_steps` (optional)
    - Returns: Created process with ID
    - Example: "Create a new process called 'Order Processing'"
    - See: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

12. `add_process_step` - Add a step/shape to an existing process
    - Parameters: `profile`, `process_id`, `step_type`, `step_config` (JSON)
    - Returns: Updated process structure
    - Example: "Add a database connector step to process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    - See: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

13. `build_process_workflow` - Build a complete workflow from description
    - Parameters: `profile`, `process_id`, `workflow_description`, `components` (optional array)
    - Returns: Process with complete workflow structure
    - Example: "Build a workflow that reads from database, transforms with map, and writes to HTTP endpoint"
    - See: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

14. `get_process_structure` - Get full process XML/structure
    - Parameters: `profile`, `process_id` (required)
    - Returns: Complete process structure with shapes, connectors, steps
    - Example: "Show me the complete structure of process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    - See: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

15. `discover_process_components` - Discover available components for a process
    - Parameters: `profile`, `process_type` (optional), `source_type` (optional), `target_type` (optional)
    - Returns: Available connections, maps, rules matching criteria
    - Example: "What components are available for building an EDI process?"
    - See: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

16. `validate_process_structure` - Validate a process structure
    - Parameters: `profile`, `process_structure` (JSON)
    - Returns: Validation results, errors, warnings
    - Example: "Validate this process structure before creating it"
    - See: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

### Deployment Tools
17. `list_environments` - List all available environments for deployment
    - Parameters: `profile` (required), `filter` (optional), `limit` (optional)
    - Returns: Array of Environment objects
    - Example: "List all environments" or "Show me the production environment"
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

18. `get_environment` - Get detailed environment information
    - Parameters: `profile`, `environment_id` (required)
    - Returns: Complete Environment object
    - Example: "Get details for environment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

19. `create_packaged_component` - Create a deployment package
    - Parameters: `profile`, `name`, `process_ids`, `environment_id`, `include_dependencies` (optional)
    - Returns: Created Package object
    - Example: "Create a deployment package for process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    - Note: Actual tool name is `create_packaged_component` (not `create_deployment_package`)
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

20. `deploy_packaged_component` - Deploy a package to environment/atoms
    - Parameters: `profile`, `package_id`, `environment_id`, `atom_ids` (optional)
    - Returns: Deployment object with status
    - Example: "Deploy package xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
    - Note: Actual tool name is `deploy_packaged_component` (not `deploy_package`)
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

21. `get_deployment_status` - Get deployment status
    - Parameters: `profile`, `deployment_id` (required)
    - Returns: Deployment status with results
    - Example: "Check the status of deployment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

22. `list_deployments` - List all deployments
    - Parameters: `profile`, `environment_id` (optional), `limit` (optional)
    - Returns: Array of Deployment objects
    - Example: "List all deployments" or "Show deployments for production"
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

23. `deploy_process` - Convenience tool to deploy a process (creates package and deploys)
    - Parameters: `profile`, `process_id`, `environment_id`, `atom_ids` (optional)
    - Returns: Deployment object
    - Example: "Deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
    - See: [Deployment API Guide](DEPLOYMENT_API_GUIDE.md)

## Extended Tools (10+ - To Be Implemented)

These tools extend the MCP server to support querying and managing additional Boomi components needed for complete process building. See `docs/MCP_SERVER_EXTENSION_SPEC.md` for implementation details.

### Connection Tools
8. `list_connections` - List all Connection components
   - Parameters: `profile` (required), `filter` (optional), `limit` (optional)
   - Returns: Array of Connection objects with IDs, names, types
   - Example: "List all database connections"

9. `get_connection` - Get details of a specific Connection
   - Parameters: `profile` (required), `connection_id` (required)
   - Returns: Full Connection configuration
   - Example: "Get details for connection ID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

### ConnectorOperation Tools
10. `list_connector_operations` - List all ConnectorOperation components
    - Parameters: `profile` (required), `connection_id` (optional filter), `filter` (optional)
    - Returns: Array of ConnectorOperation objects
    - Example: "List all operations for connection xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

11. `get_connector_operation` - Get details of a specific ConnectorOperation
    - Parameters: `profile` (required), `operation_id` (required)
    - Returns: Full ConnectorOperation configuration
    - Example: "Get operation details for ID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

### Map Tools
12. `list_maps` - List all Map components
    - Parameters: `profile` (required), `filter` (optional)
    - Returns: Array of Map objects
    - Example: "List all HL7 transformation maps"

13. `get_map` - Get details of a specific Map
    - Parameters: `profile` (required), `map_id` (required)
    - Returns: Full Map configuration
    - Example: "Get map details for ID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

### BusinessRule Tools
14. `list_business_rules` - List all BusinessRule components
    - Parameters: `profile` (required), `filter` (optional)
    - Returns: Array of BusinessRule objects
    - Example: "List all business rules"

15. `get_business_rule` - Get details of a specific BusinessRule
    - Parameters: `profile` (required), `rule_id` (required)
    - Returns: Full BusinessRule configuration
    - Example: "Get business rule details for ID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

### Certificate Tools
16. `list_certificates` - List all Certificate components
    - Parameters: `profile` (required), `filter` (optional)
    - Returns: Array of Certificate objects
    - Example: "List all SSL certificates"

### Generic Query Tool
17. `query_component` - Generic component query tool for any object type
    - Parameters: `profile` (required), `object_type` (required), `filter` (optional), `limit` (optional)
    - Returns: Query results for the specified object type
    - Example: "Query all CrossReference components"
    - Supported object types: Connection, ConnectorOperation, Map, BusinessRule, Certificate, CrossReference, CustomLibrary, EnvironmentExtension, Listener, Schedule, WebServiceServer, and more

## Configuration

### Environment Variables

Add the following environment variable to your `.env.local` file (optional, defaults to the Replit server):

```bash
BOOMI_MCP_SERVER_URL=https://boomi-mcp-server-replitzip.replit.app/mcp
```

If not set, the system will default to the Replit-hosted server URL.

### Server Endpoints

- **SSE Endpoint**: `https://boomi-mcp-server-replitzip.replit.app/sse` (for streaming)
- **HTTP POST Endpoint**: `https://boomi-mcp-server-replitzip.replit.app/mcp` (JSON-RPC 2.0)
- **Health Check**: `https://boomi-mcp-server-replitzip.replit.app/health`

## Architecture

The integration works as follows:

1. **MCP Client** (`lib/ai/mcp-client.ts`):
   - Connects to the Boomi MCP server using JSON-RPC protocol
   - Fetches available tools from the server
   - Converts MCP tools to AI SDK-compatible format
   - Caches tools to avoid repeated API calls

2. **Chat Route** (`app/(chat)/api/chat/route.ts`):
   - Loads MCP tools on each request
   - Merges MCP tools with existing tools (getWeather, createDocument, etc.)
   - Makes all tools available to the LLM during chat interactions

## Usage

Once configured, the Boomi MCP tools are automatically available in chat conversations. Users can:

### Credential Management
- Set up Boomi credentials: "Set up Boomi credentials for production profile"
- List profiles: "List all my Boomi profiles"
- Get account info: "Show me the Boomi account information for production"

### Process Management
- List processes: "List all my Boomi processes"
- Manage processes: "Create a new process called 'Order Processing'"
- Get process details: "Get details for process ID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

### Trading Partner Management
- List trading partners: "List all trading partners in the production profile"
- Manage trading partners: "Create a new trading partner"

### Atom Management
- List atoms: "List all my atoms"
- Get atom details: "Get details for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- Check atom status: "Check the status of my production atom"
- Monitor runtimes: "Show me all cloud runtimes that are online"

### Process Building
- Create processes: "Create a new process called 'Order Processing'"
- Add steps: "Add a database connector step to my process"
- Build workflows: "Build a workflow that reads from database, transforms with map, and writes to HTTP endpoint"
- Get structure: "Show me the complete structure of my order processing workflow"
- Discover components: "What components are available for building an EDI process?"
- Validate: "Validate this process structure before creating it"

### Deployment
- List environments: "List all environments" or "Show me the production environment"
- Create packages: "Create a deployment package for my Order Processing process"
- Deploy processes: "Deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
- Check status: "Check the status of my latest deployment"
- List deployments: "Show me all deployments for production environment"

### Component Querying
- List connections: "List all database connections"
- List maps: "Show me all HL7 transformation maps"
- List connector operations: "List all connector operations"
- Query components: "Query all certificates with type SSL" or "Query all Process components"
- List profiles: "List all Profile components" (data format profiles, not credential profiles)

### Execution Monitoring
- List executions: "List all execution records"
- Get execution details: "Get details for execution xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- View process history: "Show me recent process executions"

## Error Handling

The integration includes error handling:

- If the MCP server is unavailable, the system gracefully falls back to existing tools
- Tool execution errors are returned to the user in a user-friendly format
- Connection failures are logged but don't break the chat functionality

## Caching

MCP tools are cached to improve performance:

- Tool definitions are cached after the first fetch
- Cache can be cleared by calling `clearMCPCache()` if needed
- Tools are re-fetched if the cache is cleared

## Testing

To test the integration:

1. Ensure the MCP server is accessible (check health endpoint)
2. Start a chat conversation
3. Try using Boomi-related commands
4. Verify tools are being called correctly

## Troubleshooting

### Tools not appearing

- Check that `BOOMI_MCP_SERVER_URL` is set correctly
- Verify the MCP server is accessible (check health endpoint)
- Check server logs for connection errors

### Tool execution failures

- Ensure Boomi credentials are set up first using `set_boomi_credentials`
- Verify the profile name is correct
- Check that required parameters are provided

## Extending the MCP Server

To add support for querying additional Boomi components (Connections, Maps, BusinessRules, etc.), see:

- `docs/MCP_SERVER_EXTENSION_SPEC.md` - Implementation specification for new tools
- `docs/BOOMI_API_COMPONENTS.md` - Complete reference for Boomi Platform API object types
- `docs/ATOM_API_GUIDE.md` - Complete guide for Atom API integration
- `docs/PROCESS_BUILDER_GUIDE.md` - Guide for building processes programmatically
- `docs/DEPLOYMENT_API_GUIDE.md` - Complete guide for deploying processes to Boomi
- `scripts/test-list-connections.ts` - Test script for connection listing
- `scripts/test-list-maps.ts` - Test script for map listing
- `scripts/test-query-component.ts` - Test script for generic query tool
- `scripts/test-atom-api.ts` - Test script for Atom API tools
- `scripts/test-process-builder.ts` - Test script for process builder tools
- `scripts/test-component-discovery.ts` - Test script for component discovery
- `scripts/test-deployment.ts` - Test script for deployment tools

## References

- [Boomi MCP Server Documentation](https://boomi-mcp-server-replitzip.replit.app)
- [Boomi Platform API Documentation](https://developer.boomi.com/docs/APIs/PlatformAPI/Introduction/Platform_API)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai)

