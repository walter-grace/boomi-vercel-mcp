# Boomi MCP Tool Naming Reference

This document maps the actual tool names implemented in the Replit MCP server to the expected names.

## Tool Name Mapping

### Profile Management
- ✅ `list_boomi_profiles` - List all saved Boomi credential profiles
- ✅ `set_boomi_credentials` - Store Boomi API credentials
- ✅ `delete_boomi_profile` - Delete a stored credential profile
- ✅ `boomi_account_info` - Get Boomi account information
- ✅ `list_profiles` - Additional profile listing (may be alias)

### Atom API Tools
- ✅ `list_atoms` - Query all atoms/runtimes
- ✅ `get_atom` - Get detailed atom information
- ✅ `query_atom_status` - Get atom runtime status and health

### Environment Tools
- ✅ `list_environments` - List all available environments
- ✅ `get_environment` - Get detailed environment information

### Deployment Tools
- ✅ `list_deployments` - List all deployments
- ✅ `get_deployment_status` - Get deployment status
- ✅ `create_packaged_component` - Create a deployment package (note: different from `create_deployment_package`)
- ✅ `deploy_packaged_component` - Deploy a package (note: different from `deploy_package`)
- ✅ `deploy_process` - Convenience tool to deploy a process

### Component Query Tools
- ✅ `query_component` - Generic component query tool
- ✅ `list_connections` - List all Connection components
- ✅ `list_maps` - List all Map components
- ✅ `list_connector_operations` - List ConnectorOperation components

### Execution Tools
- ✅ `list_execution_records` - List process execution records
- ✅ `get_execution_record` - Get detailed execution record

### Existing Tools (Still Available)
- ✅ `manage_trading_partner` - Manage B2B/EDI trading partners
- ✅ `manage_process` - Manage Boomi process components
- ✅ `manage_organization` - Manage Boomi organization components

## Tool Count

**Total: 24 tools** (as reported by Replit server)

## Notes on Tool Names

### Deployment Tools
The actual tool names differ slightly from the documentation:
- **Documentation**: `create_deployment_package`
- **Actual**: `create_packaged_component`

- **Documentation**: `deploy_package`
- **Actual**: `deploy_packaged_component`

These are functionally equivalent but use different naming. The implementation should handle both names or use the actual names.

## Testing

Use `scripts/test-all-new-tools.ts` to test all tools systematically.

## Usage Examples

### List All Tools
```typescript
const tools = await getBoomiMCPTools();
console.log(Object.keys(tools)); // Lists all available tools
```

### Call a Tool
```typescript
const result = await tools.list_atoms.execute({
  profile: "production",
});
```

### Check Tool Availability
```typescript
if (tools.list_atoms) {
  // Tool is available
}
```

