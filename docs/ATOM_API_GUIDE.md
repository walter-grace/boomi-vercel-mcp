# Boomi Atom API Integration Guide

This guide provides comprehensive documentation for integrating with the Boomi Atom API to query and manage Runtime objects (atoms, clusters, and cloud runtimes).

## Overview

The Boomi Atom API allows you to programmatically manage Runtime objects, which are the execution engines for Boomi processes. Atoms can be:
- **Standalone Atoms**: Single runtime instances
- **Atom Clusters**: Groups of atoms working together
- **Cloud Runtimes**: Atoms deployed in cloud environments

## Authentication

All Atom API requests use the Boomi Platform API authentication:

- **Method**: HTTP Basic Auth
- **Username**: Your Boomi username
- **Password**: Your Boomi API token (not your account password)
- **Endpoint Base**: `https://api.boomi.com/api/rest/v1/{accountID}/Atom`

### Required Privileges

- **Read Operations**: API access + `ATOM_MANAGEMENT_READ_ONLY` or `ATOM_MANAGEMENT`
- **Write Operations**: API access + `ATOM_MANAGEMENT`

## API Endpoints

### 1. Query Atoms

List all atoms/runtimes in your account.

**Endpoint**: `POST /api/rest/v1/{accountID}/Atom/QUERY`

**Request Body**:
```json
{
  "QueryFilter": {
    "expression": {
      "argument": ["Cloud"],
      "operator": "EQUALS",
      "property": "type"
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
      "name": "Production Atom",
      "type": "Atom",
      "status": "ONLINE",
      "currentVersion": "2.5.0",
      "dateInstalled": "2024-01-15T10:30:00.000Z",
      "cloudId": "cloud-123",
      "capabilities": ["GATEWAY", "BROKER"]
    }
  ]
}
```

### 2. Get Atom Details

Retrieve detailed information about a specific atom.

**Endpoint**: `GET /api/rest/v1/{accountID}/Atom/{atomId}`

**Response**:
```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "Production Atom",
  "type": "Atom",
  "status": "ONLINE",
  "currentVersion": "2.5.0",
  "dateInstalled": "2024-01-15T10:30:00.000Z",
  "cloudId": "cloud-123",
  "capabilities": ["GATEWAY", "BROKER"],
  "properties": {
    "hostname": "atom-prod.example.com",
    "ipAddress": "192.168.1.100",
    "environmentId": "env-456"
  }
}
```

### 3. Create Atom

Create a new atom/runtime (requires ATOM_MANAGEMENT privilege).

**Endpoint**: `POST /api/rest/v1/{accountID}/Atom`

**Request Body**:
```json
{
  "name": "New Atom",
  "type": "Atom",
  "cloudId": "cloud-123",
  "properties": {
    "environmentId": "env-456"
  }
}
```

### 4. Update Atom

Update an existing atom configuration.

**Endpoint**: `PUT /api/rest/v1/{accountID}/Atom/{atomId}`

**Request Body**:
```json
{
  "name": "Updated Atom Name",
  "properties": {
    "environmentId": "env-789"
  }
}
```

### 5. Delete Atom

Delete an atom/runtime (requires ATOM_MANAGEMENT privilege).

**Endpoint**: `DELETE /api/rest/v1/{accountID}/Atom/{atomId}`

## Atom Object Properties

### Common Fields

- **`id`** (string, UUID): Unique identifier for the atom
- **`name`** (string): Atom name
- **`type`** (string): Type of runtime - "Atom", "AtomCluster", or "Cloud"
- **`status`** (string): Current status - "ONLINE", "OFFLINE", "ERROR", etc.
- **`currentVersion`** (string): Installed Boomi runtime version
- **`dateInstalled`** (datetime): Installation timestamp
- **`cloudId`** (string, optional): Cloud ID for cloud-deployed atoms
- **`capabilities`** (array): Available capabilities like "GATEWAY", "BROKER"

### Filter Properties

You can filter atoms by:
- **`name`**: Atom name (CONTAINS, EQUALS, STARTS_WITH)
- **`type`**: Atom type (EQUALS)
- **`status`**: Current status (EQUALS)
- **`cloudId`**: Cloud ID (EQUALS)
- **`currentVersion`**: Version (EQUALS, STARTS_WITH)

## MCP Tools

The following MCP tools are available for Atom API operations:

### `list_atoms`

Query all atoms/runtimes in your account.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `filter` (optional): Filter expression (e.g., "type = 'Cloud'")
- `limit` (optional): Maximum number of results (default: 100)

**Example Usage**:
```
"List all my atoms"
"Show me all cloud runtimes"
"List atoms with status ONLINE"
```

**Returns**: JSON array of Atom objects

### `get_atom`

Get detailed information about a specific atom.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `atom_id` (required): Atom UUID

**Example Usage**:
```
"Get details for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"Show me information about my production atom"
```

**Returns**: Complete Atom object with all properties

### `query_atom_status`

Get atom runtime status and health information.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `atom_id` (required): Atom UUID

**Example Usage**:
```
"Check the status of my production atom"
"What's the health of atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Returns**: Atom status, version, capabilities, and health metrics

## Use Cases

### 1. Monitor Atom Health

Check the status and health of all production atoms:

```typescript
// List all atoms
const atoms = await list_atoms({
  profile: "production",
  filter: "type = 'Atom'"
});

// Check status of each atom
for (const atom of atoms) {
  const status = await query_atom_status({
    profile: "production",
    atom_id: atom.id
  });
  console.log(`${atom.name}: ${status.status}`);
}
```

### 2. Find Atoms by Version

Query atoms running a specific version:

```typescript
const atoms = await list_atoms({
  profile: "production",
  filter: "currentVersion STARTS_WITH '2.5'"
});
```

### 3. Get Cloud Runtime Information

List all cloud-deployed atoms:

```typescript
const cloudAtoms = await list_atoms({
  profile: "production",
  filter: "type = 'Cloud'"
});
```

## Error Handling

### Common Error Codes

- **401 Unauthorized**: Invalid credentials or missing API access
- **403 Forbidden**: Insufficient privileges (missing ATOM_MANAGEMENT)
- **404 Not Found**: Atom ID doesn't exist
- **406 Not Acceptable**: Invalid request format

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Best Practices

1. **Cache Atom Information**: Atom details don't change frequently, so cache results
2. **Filter Results**: Always use filters to limit results and improve performance
3. **Handle Offline Atoms**: Check status before performing operations
4. **Monitor Versions**: Track atom versions for upgrade planning
5. **Use Pagination**: For large result sets, use `start` and `max` parameters

## Integration with Process Building

Atoms are essential for process execution. When building processes, you may need to:

1. **Verify Atom Availability**: Ensure atoms are online before deploying processes
2. **Check Capabilities**: Verify atoms have required capabilities (GATEWAY, BROKER)
3. **Environment Mapping**: Map processes to appropriate atom environments

## References

- [Boomi Platform API Documentation](https://developer.boomi.com/docs/APIs/PlatformAPI/Introduction/Platform_API)
- [Boomi Atom API Reference](https://developer.boomi.com/docs/api/platformapi/Atom)
- [OpenAPI Specification](https://developer.boomi.com/APIs/platformOpenAPISpec.json)

