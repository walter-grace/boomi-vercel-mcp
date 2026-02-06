# Boomi Platform API Component Types Reference

This document provides a comprehensive reference for all Boomi Platform API object types that can be queried and managed programmatically.

## API Endpoint Structure

The Boomi Platform API uses REST endpoints with the following structure:

```
POST https://api.boomi.com/api/rest/v1/{accountID}/{objectType}/QUERY
GET  https://api.boomi.com/api/rest/v1/{accountID}/{objectType}/{objectId}
POST https://api.boomi.com/api/rest/v1/{accountID}/{objectType}
PUT  https://api.boomi.com/api/rest/v1/{accountID}/{objectType}/{objectId}
DELETE https://api.boomi.com/api/rest/v1/{accountID}/{objectType}/{objectId}
```

## Authentication

All API requests require authentication using one of:
- **API Token**: HTTP Basic Auth with username and API token as password
- **Username/Password**: HTTP Basic Auth (not available for SSO users)

## Query Operation

The QUERY operation supports filtering, sorting, and pagination:

### Query Request Format

```json
{
  "QueryFilter": {
    "expression": {
      "argument": ["value"],
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

### Filter Operators

- `EQUALS` - Exact match
- `NOT_EQUALS` - Not equal
- `CONTAINS` - Contains substring
- `STARTS_WITH` - Starts with
- `ENDS_WITH` - Ends with
- `GREATER_THAN` - Greater than (for numbers/dates)
- `LESS_THAN` - Less than (for numbers/dates)
- `BETWEEN` - Between two values
- `IN` - In list of values

## Component Object Types

### Currently Implemented

#### Atom
- **Object Type**: `Atom`
- **Description**: Runtime objects representing integration execution engines (atoms, clusters, cloud runtimes)
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Atom name
  - `type` - Runtime type (Atom, AtomCluster, Cloud)
  - `status` - Current status (ONLINE, OFFLINE, ERROR)
  - `currentVersion` - Installed Boomi runtime version
  - `dateInstalled` - Installation timestamp
  - `cloudId` - Cloud ID for cloud-deployed atoms
  - `capabilities` - Available capabilities (GATEWAY, BROKER)
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Example Query**: List all atoms
  ```json
  POST /api/rest/v1/{accountID}/Atom/QUERY
  ```
- **Use Cases**:
  - Monitor atom health and status
  - Verify atoms are online before deploying processes
  - Check atom versions for upgrade planning
  - List cloud-deployed runtimes
- **Required Privileges**: 
  - Read: API + ATOM_MANAGEMENT_READ_ONLY or ATOM_MANAGEMENT
  - Write: API + ATOM_MANAGEMENT
- **See Also**: [Atom API Guide](ATOM_API_GUIDE.md)

#### Process
- **Object Type**: `Process`
- **Description**: Process components that define data execution workflows with shapes, connectors, and steps
- **Key Fields**: 
  - `id` - Unique identifier
  - `name` - Process name
  - `type` - Process type
  - `version` - Process version
  - `createdDate` - Creation timestamp
  - `modifiedDate` - Last modification timestamp
  - `processXml` - Complete process XML structure (shapes, connectors, steps)
  - `folderId` - Parent folder ID
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Example Query**: List all processes
  ```json
  POST /api/rest/v1/{accountID}/Process/QUERY
  ```
- **Process Structure**: Processes contain:
  - **Shapes**: Visual components (START, END, CONNECTOR, MAP, DECISION, etc.)
  - **Connectors**: Links between shapes defining data flow
  - **Component References**: IDs of connections, maps, business rules used in steps
- **Use Cases**:
  - Create new integration workflows
  - Build processes programmatically with components
  - Update existing process structures
  - Deploy processes to atoms
- **See Also**: [Process Builder Guide](PROCESS_BUILDER_GUIDE.md)

#### TradingPartner
- **Object Type**: `TradingPartner`
- **Description**: B2B/EDI trading partner configurations
- **Key Fields**: `id`, `name`, `type`, `status`, `createdDate`
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE

#### Organization
- **Object Type**: `Organization`
- **Description**: Organization details and configuration
- **Key Fields**: `id`, `name`, `type`, `status`
- **Operations**: QUERY, GET

### Target Components (To Be Added)

#### Connection
- **Object Type**: `Connection`
- **Description**: Connector connection configurations for connecting to external systems
- **Key Fields**: 
  - `id` - Unique identifier
  - `name` - Connection name
  - `type` - Connection type (e.g., "Database", "HTTP", "FTP", "S3")
  - `connectorId` - Associated connector ID
  - `createdDate` - Creation timestamp
  - `modifiedDate` - Last modification timestamp
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Example Query**: List all database connections
  ```json
  {
    "QueryFilter": {
      "expression": {
        "argument": ["Database"],
        "operator": "EQUALS",
        "property": "type"
      }
    }
  }
  ```
- **Use Cases**: 
  - List available connections for process building
  - Get connection IDs for referencing in processes
  - Verify connection configurations

#### ConnectorOperation
- **Object Type**: `ConnectorOperation`
- **Description**: Connector operation definitions that define specific actions against connections
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Operation name
  - `type` - Operation type (e.g., "SELECT", "INSERT", "UPDATE", "DELETE")
  - `connectionId` - Associated connection ID
  - `connectorId` - Connector ID
  - `createdDate` - Creation timestamp
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Example Query**: List operations for a specific connection
  ```json
  {
    "QueryFilter": {
      "expression": {
        "argument": ["{connectionId}"],
        "operator": "EQUALS",
        "property": "connectionId"
      }
    }
  }
  ```
- **Use Cases**:
  - Find available operations for a connection
  - Get operation IDs for process configuration
  - List all operations of a specific type

#### Map
- **Object Type**: `Map`
- **Description**: Data transformation maps that convert data between formats
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Map name
  - `type` - Map type
  - `sourceDocumentType` - Source document type
  - `targetDocumentType` - Target document type
  - `createdDate` - Creation timestamp
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Example Query**: List maps for a specific transformation
  ```json
  {
    "QueryFilter": {
      "expression": {
        "argument": ["HL7"],
        "operator": "EQUALS",
        "property": "sourceDocumentType"
      }
    }
  }
  ```
- **Use Cases**:
  - Find transformation maps for specific document types
  - Get map IDs for process steps
  - List all available maps

#### BusinessRule
- **Object Type**: `BusinessRule`
- **Description**: Business rule components for data validation and transformation logic
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Rule name
  - `type` - Rule type
  - `status` - Active/inactive status
  - `createdDate` - Creation timestamp
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List validation rules
  - Get rule IDs for process steps
  - Find rules by type or name

#### Certificate
- **Object Type**: `Certificate`
- **Description**: SSL/TLS certificates for secure connections
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Certificate name
  - `type` - Certificate type
  - `expirationDate` - Certificate expiration
  - `status` - Certificate status
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List available certificates
  - Check certificate expiration
  - Get certificate IDs for secure connections

#### CrossReference
- **Object Type**: `CrossReference`
- **Description**: Cross-reference tables for data lookups
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Table name
  - `type` - Reference type
  - `createdDate` - Creation timestamp
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List lookup tables
  - Get table IDs for process steps
  - Find tables by name

#### CustomLibrary
- **Object Type**: `CustomLibrary`
- **Description**: Custom JAR file libraries for extended functionality
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Library name
  - `version` - Library version
  - `createdDate` - Creation timestamp
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List custom libraries
  - Get library IDs for process configuration

#### EnvironmentExtension
- **Object Type**: `EnvironmentExtension`
- **Description**: Environment-specific configuration extensions
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Extension name
  - `environmentId` - Associated environment ID
  - `type` - Extension type
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List environment extensions
  - Get extension configurations
  - Find extensions by environment

#### Listener
- **Object Type**: `Listener`
- **Description**: Process listener configurations
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Listener name
  - `processId` - Associated process ID
  - `type` - Listener type
  - `status` - Active/inactive status
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List process listeners
  - Get listener configurations
  - Check listener status

#### Schedule
- **Object Type**: `Schedule`
- **Description**: Scheduled process execution configurations
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Schedule name
  - `processId` - Associated process ID
  - `cronExpression` - Schedule expression
  - `status` - Active/inactive status
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List scheduled processes
  - Get schedule configurations
  - Check schedule status

#### WebServiceServer
- **Object Type**: `WebServiceServer`
- **Description**: Web service server configurations
- **Key Fields**:
  - `id` - Unique identifier
  - `name` - Server name
  - `type` - Server type (REST, SOAP, OData)
  - `status` - Active/inactive status
- **Operations**: QUERY, GET, CREATE, UPDATE, DELETE
- **Use Cases**:
  - List web service servers
  - Get server configurations
  - Find servers by type

## Common Response Format

### Query Response

```json
{
  "numberOfResults": 10,
  "result": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "Component Name",
      "type": "ComponentType",
      "createdDate": "2024-01-01T00:00:00.000Z",
      "modifiedDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Single Object Response

```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "Component Name",
  "type": "ComponentType",
  "properties": {
    // Component-specific properties
  },
  "createdDate": "2024-01-01T00:00:00.000Z",
  "modifiedDate": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

### Common Error Codes

- `400` - Bad Request (invalid query syntax)
- `401` - Unauthorized (authentication failed)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (object doesn't exist)
- `406` - Not Acceptable (invalid object type or format)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Limitations and Constraints

1. **Pagination**: Default max results per query is typically 100-1000, depending on object type
2. **Rate Limiting**: API requests are rate-limited; check response headers for limits
3. **Permissions**: Some object types may require specific permissions to query
4. **Object Type Names**: Must match exact Boomi object type names (case-sensitive)
5. **Filter Syntax**: Complex filters may require multiple expressions combined with AND/OR

## Best Practices

1. **Use Filters**: Always use filters to limit results and improve performance
2. **Pagination**: For large result sets, use pagination with `start` and `max` parameters
3. **Caching**: Cache component IDs and metadata to reduce API calls
4. **Error Handling**: Always handle authentication and permission errors gracefully
5. **Field Selection**: Use field selection to reduce response size when possible

## References

- [Boomi Platform API Documentation](https://developer.boomi.com/docs/APIs/PlatformAPI/Introduction/Platform_API)
- [Boomi Developer Portal](https://developer.boomi.com/)
- [OpenAPI 3.0 Specification](https://developer.boomi.com/APIs/platformOpenAPISpec.json)

