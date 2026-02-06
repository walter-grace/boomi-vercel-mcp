# Boomi Deployment API Guide

This guide provides comprehensive documentation for deploying Boomi processes and components to atoms and environments using the Platform API.

## Overview

Boomi deployment involves creating packages containing components (processes, connections, maps, etc.) and then deploying those packages to specific environments and atoms. The deployment process ensures that all dependencies are included and properly configured.

## Deployment Workflow

1. **Create Package**: Bundle components into a deployment package
2. **Deploy Package**: Deploy the package to target environment/atoms
3. **Monitor Status**: Check deployment status and results
4. **Verify**: Confirm components are deployed and running

## Authentication

Uses the same Boomi Platform API authentication:
- **Method**: HTTP Basic Auth
- **Username**: Boomi username
- **Password**: Boomi API token
- **Endpoint Base**: `https://api.boomi.com/api/rest/v1/{accountID}`

### Required Privileges

- **Read Operations**: API access + `DEPLOYMENT_READ_ONLY` or `DEPLOYMENT_MANAGEMENT`
- **Write Operations**: API access + `DEPLOYMENT_MANAGEMENT`
- **Environment Access**: Must have access to target environment

## API Endpoints

### 1. Query Environments

List all available environments for deployment.

**Endpoint**: `POST /api/rest/v1/{accountID}/Environment/QUERY`

**Request Body**:
```json
{
  "QueryFilter": {
    "expression": {
      "argument": ["Production"],
      "operator": "EQUALS",
      "property": "name"
    }
  },
  "sort": [
    {
      "direction": "ASC",
      "property": "name"
    }
  ],
  "start": 0,
  "max": 100
}
```

**Response**:
```json
{
  "numberOfResults": 2,
  "result": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "Production",
      "type": "ENVIRONMENT",
      "status": "ACTIVE",
      "createdDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Create Deployment Package

Create a package containing components to deploy.

**Endpoint**: `POST /api/rest/v1/{accountID}/Package`

**Request Body**:
```json
{
  "name": "Order Processing Deployment",
  "packageType": "DEPLOYMENT",
  "description": "Deploy Order Processing process and dependencies",
  "components": [
    {
      "componentId": "process-uuid-1",
      "componentType": "Process"
    },
    {
      "componentId": "connection-uuid-1",
      "componentType": "Connection"
    },
    {
      "componentId": "map-uuid-1",
      "componentType": "Map"
    }
  ],
  "environmentId": "environment-uuid"
}
```

**Response**:
```json
{
  "id": "package-uuid",
  "name": "Order Processing Deployment",
  "packageType": "DEPLOYMENT",
  "status": "PENDING",
  "createdDate": "2024-01-15T10:30:00.000Z",
  "components": [
    {
      "componentId": "process-uuid-1",
      "componentType": "Process"
    }
  ]
}
```

### 3. Deploy Package

Deploy a package to target environment and atoms.

**Endpoint**: `POST /api/rest/v1/{accountID}/Deployment`

**Request Body**:
```json
{
  "packageId": "package-uuid",
  "environmentId": "environment-uuid",
  "atomIds": [
    "atom-uuid-1",
    "atom-uuid-2"
  ],
  "deploymentName": "Order Processing Deployment - 2024-01-15"
}
```

**Response**:
```json
{
  "id": "deployment-uuid",
  "packageId": "package-uuid",
  "environmentId": "environment-uuid",
  "status": "IN_PROGRESS",
  "startDate": "2024-01-15T10:30:00.000Z",
  "atomIds": ["atom-uuid-1", "atom-uuid-2"]
}
```

### 4. Get Deployment Status

Check the status of a deployment.

**Endpoint**: `GET /api/rest/v1/{accountID}/Deployment/{deploymentId}`

**Response**:
```json
{
  "id": "deployment-uuid",
  "packageId": "package-uuid",
  "environmentId": "environment-uuid",
  "status": "COMPLETED",
  "startDate": "2024-01-15T10:30:00.000Z",
  "endDate": "2024-01-15T10:31:00.000Z",
  "results": [
    {
      "atomId": "atom-uuid-1",
      "status": "SUCCESS",
      "message": "Deployment completed successfully"
    },
    {
      "atomId": "atom-uuid-2",
      "status": "SUCCESS",
      "message": "Deployment completed successfully"
    }
  ]
}
```

### 5. Query Deployments

List all deployments.

**Endpoint**: `POST /api/rest/v1/{accountID}/Deployment/QUERY`

**Request Body**:
```json
{
  "QueryFilter": {
    "expression": {
      "argument": ["environment-uuid"],
      "operator": "EQUALS",
      "property": "environmentId"
    }
  },
  "sort": [
    {
      "direction": "DESC",
      "property": "startDate"
    }
  ],
  "start": 0,
  "max": 100
}
```

## MCP Tools

### `list_environments`

List all available environments for deployment.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `filter` (optional): Filter expression (e.g., "name = 'Production'")
- `limit` (optional): Maximum number of results (default: 100)

**Example Usage**:
```
"List all environments"
"Show me the production environment"
"List environments with status ACTIVE"
```

**Returns**: JSON array of Environment objects

### `get_environment`

Get detailed information about a specific environment.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `environment_id` (required): Environment UUID

**Example Usage**:
```
"Get details for environment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"Show me information about the production environment"
```

**Returns**: Complete Environment object

### `create_deployment_package`

Create a deployment package containing components.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `name` (required): Package name
- `process_ids` (required): Array of process UUIDs to include
- `environment_id` (required): Target environment UUID
- `include_dependencies` (optional): Automatically include dependencies (default: true)
- `additional_components` (optional): Array of additional component IDs (connections, maps, etc.)

**Example Usage**:
```
"Create a deployment package for process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"Package the Order Processing process for production deployment"
```

**Returns**: Created Package object with ID

### `deploy_package`

Deploy a package to target environment and atoms.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `package_id` (required): Package UUID
- `environment_id` (required): Target environment UUID
- `atom_ids` (optional): Array of specific atom UUIDs (if not provided, deploys to all atoms in environment)
- `deployment_name` (optional): Custom deployment name

**Example Usage**:
```
"Deploy package xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
"Deploy to all atoms in the production environment"
"Deploy to specific atoms: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Returns**: Deployment object with status

### `get_deployment_status`

Get the current status of a deployment.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `deployment_id` (required): Deployment UUID

**Example Usage**:
```
"Check the status of deployment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"What's the status of my latest deployment?"
```

**Returns**: Deployment status with results per atom

### `list_deployments`

List all deployments, optionally filtered by environment.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `environment_id` (optional): Filter by environment UUID
- `limit` (optional): Maximum number of results (default: 100)

**Example Usage**:
```
"List all deployments"
"Show me deployments for the production environment"
"List recent deployments"
```

**Returns**: Array of Deployment objects

### `deploy_process`

Convenience tool that combines package creation and deployment in one step.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `process_id` (required): Process UUID to deploy
- `environment_id` (required): Target environment UUID
- `atom_ids` (optional): Array of specific atom UUIDs
- `include_dependencies` (optional): Include dependencies (default: true)

**Example Usage**:
```
"Deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
"Deploy the Order Processing process to all production atoms"
```

**Returns**: Deployment object with status

## Use Cases

### 1. Deploy Single Process

Deploy a process to production:

```typescript
// 1. Get environment
const env = await get_environment({
  profile: "production",
  environment_id: "production-env-uuid"
});

// 2. Create package
const package = await create_deployment_package({
  profile: "production",
  name: "Order Processing Deployment",
  process_ids: ["process-uuid"],
  environment_id: env.id,
  include_dependencies: true
});

// 3. Deploy
const deployment = await deploy_package({
  profile: "production",
  package_id: package.id,
  environment_id: env.id
});

// 4. Monitor
const status = await get_deployment_status({
  profile: "production",
  deployment_id: deployment.id
});
```

### 2. Deploy Multiple Processes

Deploy multiple processes together:

```typescript
const package = await create_deployment_package({
  profile: "production",
  name: "Multi-Process Deployment",
  process_ids: ["process-1-uuid", "process-2-uuid", "process-3-uuid"],
  environment_id: "production-env-uuid",
  include_dependencies: true
});

await deploy_package({
  profile: "production",
  package_id: package.id,
  environment_id: "production-env-uuid"
});
```

### 3. Deploy to Specific Atoms

Deploy only to specific atoms:

```typescript
const atoms = await list_atoms({
  profile: "production",
  filter: "status = 'ONLINE'"
});

await deploy_package({
  profile: "production",
  package_id: package.id,
  environment_id: "production-env-uuid",
  atom_ids: [atoms[0].id, atoms[1].id] // Only deploy to first two atoms
});
```

### 4. Monitor Deployment

Monitor deployment progress:

```typescript
const deployment = await deploy_package({
  profile: "production",
  package_id: package.id,
  environment_id: "production-env-uuid"
});

// Poll for status
let status = await get_deployment_status({
  profile: "production",
  deployment_id: deployment.id
});

while (status.status === "IN_PROGRESS") {
  await sleep(5000); // Wait 5 seconds
  status = await get_deployment_status({
    profile: "production",
    deployment_id: deployment.id
  });
}

if (status.status === "COMPLETED") {
  console.log("Deployment successful!");
} else {
  console.log("Deployment failed:", status.results);
}
```

## Error Handling

### Common Error Codes

- **400 Bad Request**: Invalid package or deployment configuration
- **401 Unauthorized**: Invalid credentials or missing API access
- **403 Forbidden**: Insufficient privileges (missing DEPLOYMENT_MANAGEMENT)
- **404 Not Found**: Package, deployment, or environment doesn't exist
- **409 Conflict**: Deployment already in progress
- **500 Internal Server Error**: Boomi server error

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

## Best Practices

1. **Include Dependencies**: Always set `include_dependencies: true` to ensure all required components are deployed
2. **Verify Atoms**: Check atom status before deploying
3. **Monitor Deployments**: Always check deployment status after initiating
4. **Use Environments**: Deploy to environments rather than individual atoms when possible
5. **Test First**: Deploy to test environment before production
6. **Version Control**: Use descriptive package names with version numbers
7. **Error Handling**: Check deployment results for each atom

## Integration with Process Building

Deployment works seamlessly with process creation:

1. **Create Process**: Use `create_process_with_components` or `build_process_workflow`
2. **Validate**: Use `validate_process_structure` to ensure process is valid
3. **Package**: Use `create_deployment_package` to create deployment package
4. **Deploy**: Use `deploy_package` to deploy to target environment
5. **Verify**: Use `get_deployment_status` to confirm successful deployment

## References

- [Boomi Platform API Documentation](https://developer.boomi.com/docs/APIs/PlatformAPI/Introduction/Platform_API)
- [Boomi Deployment Guide](https://help.boomi.com/docs/atomsphere/deployment/)
- [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)
- [Atom API Guide](ATOM_API_GUIDE.md)

