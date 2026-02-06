# Boomi Process Builder Guide

This guide provides comprehensive documentation for building Boomi processes programmatically using the Platform API and MCP tools.

## Overview

Boomi processes are complex workflow definitions that orchestrate data integration tasks. A process consists of:
- **Shapes**: Visual components representing steps (connectors, maps, decisions, etc.)
- **Connectors**: Links between shapes defining data flow
- **Components**: References to connections, maps, business rules, etc.
- **Metadata**: Name, description, folder, version information

## Process Structure

### Basic Process Components

A Boomi process is defined in XML format with the following structure:

```xml
<Process>
  <name>Process Name</name>
  <description>Process Description</description>
  <folderId>folder-uuid</folderId>
  <shapes>
    <shape id="shape-1" type="START">
      <!-- Start shape configuration -->
    </shape>
    <shape id="shape-2" type="CONNECTOR">
      <componentId>connection-uuid</componentId>
      <operationId>operation-uuid</operationId>
      <!-- Connector configuration -->
    </shape>
    <shape id="shape-3" type="MAP">
      <componentId>map-uuid</componentId>
      <!-- Map configuration -->
    </shape>
    <shape id="shape-4" type="END">
      <!-- End shape configuration -->
    </shape>
  </shapes>
  <connectors>
    <connector from="shape-1" to="shape-2"/>
    <connector from="shape-2" to="shape-3"/>
    <connector from="shape-3" to="shape-4"/>
  </connectors>
</Process>
```

### Shape Types

Common shape types in Boomi processes:

- **START**: Process entry point
- **END**: Process exit point
- **CONNECTOR**: Connector operation (database, HTTP, FTP, etc.)
- **MAP**: Data transformation map
- **DECISION**: Conditional branching
- **NOTIFY**: Notification step
- **SET_PROPERTIES**: Set document properties
- **ROUTE**: Route documents
- **LOOP**: Loop through documents
- **TRY_CATCH**: Error handling

## API Endpoints

### 1. Create Process

**Endpoint**: `POST /api/rest/v1/{accountID}/Process`

**Request Body**:
```json
{
  "name": "Order Processing",
  "description": "Process orders from database",
  "folderId": "folder-uuid",
  "processXml": "<Process>...</Process>"
}
```

### 2. Get Process Structure

**Endpoint**: `GET /api/rest/v1/{accountID}/Process/{processId}`

**Response**: Complete process object including XML structure

### 3. Update Process

**Endpoint**: `PUT /api/rest/v1/{accountID}/Process/{processId}`

**Request Body**: Updated process object with modified XML

## MCP Tools

### `create_process_with_components`

Create a new process with initial structure and components.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `name` (required): Process name
- `description` (optional): Process description
- `folder_id` (optional): Folder UUID to place process in
- `initial_steps` (optional): Array of initial step configurations

**Step Configuration Format**:
```json
{
  "type": "CONNECTOR",
  "component_id": "connection-uuid",
  "operation_id": "operation-uuid",
  "position": {"x": 100, "y": 100}
}
```

**Example Usage**:
```
"Create a new process called 'Order Processing'"
"Create a process named 'Data Sync' in folder xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Returns**: Created process object with ID

### `add_process_step`

Add a step/shape to an existing process.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `process_id` (required): Process UUID
- `step_type` (required): Type of step (CONNECTOR, MAP, DECISION, etc.)
- `step_config` (required): JSON configuration for the step

**Step Config Examples**:

**Connector Step**:
```json
{
  "component_id": "connection-uuid",
  "operation_id": "operation-uuid",
  "position": {"x": 200, "y": 100},
  "properties": {
    "query": "SELECT * FROM orders"
  }
}
```

**Map Step**:
```json
{
  "component_id": "map-uuid",
  "position": {"x": 300, "y": 100},
  "source_document_type": "Order",
  "target_document_type": "Invoice"
}
```

**Example Usage**:
```
"Add a database connector step to process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"Add a map transformation step after the connector"
```

**Returns**: Updated process structure

### `build_process_workflow`

Build a complete workflow from a natural language description.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `process_id` (required): Process UUID (must exist)
- `workflow_description` (required): Natural language description of workflow
- `components` (optional): Array of component IDs to use

**Example Usage**:
```
"Build a workflow that reads from database, transforms with map, and writes to HTTP endpoint"
"Create a workflow: read orders from database, validate with business rule, send to API"
```

**Workflow Description Patterns**:
- "Read from [source]"
- "Transform using [map]"
- "Write to [target]"
- "Validate with [rule]"
- "If [condition] then [action]"

**Returns**: Process with complete workflow structure

### `get_process_structure`

Get the full process XML/structure with all shapes, connectors, and steps.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `process_id` (required): Process UUID

**Example Usage**:
```
"Show me the complete structure of process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"Get all steps in my order processing workflow"
```

**Returns**: Complete process structure including:
- All shapes with positions and configurations
- All connectors between shapes
- Component references
- Properties and metadata

## Helper Tools

### `discover_process_components`

Discover available components for building a process.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `process_type` (optional): Type of process (e.g., "EDI", "API", "Database")
- `source_type` (optional): Source data type (e.g., "Database", "HTTP", "FTP")
- `target_type` (optional): Target data type

**Example Usage**:
```
"What components are available for building an EDI process?"
"Show me all database connections and maps for order processing"
```

**Returns**: Object containing:
- Available connections matching criteria
- Available maps for transformations
- Available business rules
- Available connector operations

### `validate_process_structure`

Validate a process structure before creation or update.

**Parameters**:
- `profile` (required): Boomi credential profile name
- `process_structure` (required): JSON structure of the process

**Example Usage**:
```
"Validate this process structure before creating it"
"Check if my workflow configuration is valid"
```

**Returns**: Validation results with:
- `valid` (boolean): Whether structure is valid
- `errors` (array): List of errors found
- `warnings` (array): List of warnings
- `suggestions` (array): Improvement suggestions

## Building Workflows

### Example 1: Simple Data Flow

Build a process that reads from a database and writes to an HTTP endpoint:

```typescript
// 1. Create the process
const process = await create_process_with_components({
  profile: "production",
  name: "Database to API Sync",
  description: "Sync data from database to API"
});

// 2. Add database connector step
await add_process_step({
  profile: "production",
  process_id: process.id,
  step_type: "CONNECTOR",
  step_config: {
    component_id: "db-connection-uuid",
    operation_id: "select-operation-uuid",
    position: {x: 100, y: 100},
    properties: {
      query: "SELECT * FROM orders WHERE status = 'pending'"
    }
  }
});

// 3. Add HTTP connector step
await add_process_step({
  profile: "production",
  process_id: process.id,
  step_type: "CONNECTOR",
  step_config: {
    component_id: "http-connection-uuid",
    operation_id: "post-operation-uuid",
    position: {x: 300, y: 100},
    properties: {
      endpoint: "/api/orders",
      method: "POST"
    }
  }
});
```

### Example 2: Workflow with Transformation

Build a process with data transformation:

```typescript
// 1. Discover available components
const components = await discover_process_components({
  profile: "production",
  source_type: "Database",
  target_type: "HTTP"
});

// 2. Create process
const process = await create_process_with_components({
  profile: "production",
  name: "Order Transformation",
  initial_steps: [
    {
      type: "CONNECTOR",
      component_id: components.connections[0].id,
      operation_id: components.operations[0].id
    }
  ]
});

// 3. Add map transformation
await add_process_step({
  profile: "production",
  process_id: process.id,
  step_type: "MAP",
  step_config: {
    component_id: components.maps[0].id,
    position: {x: 200, y: 100}
  }
});

// 4. Add target connector
await add_process_step({
  profile: "production",
  process_id: process.id,
  step_type: "CONNECTOR",
  step_config: {
    component_id: components.connections[1].id,
    operation_id: components.operations[1].id,
    position: {x: 300, y: 100}
  }
});
```

### Example 3: Natural Language Workflow

Use natural language to build a complete workflow:

```typescript
// Create basic process
const process = await create_process_with_components({
  profile: "production",
  name: "Automated Order Processing"
});

// Build workflow from description
await build_process_workflow({
  profile: "production",
  process_id: process.id,
  workflow_description: "Read orders from database, validate with business rule, transform using map, and send to HTTP API",
  components: [
    "db-connection-uuid",
    "validation-rule-uuid",
    "transformation-map-uuid",
    "http-connection-uuid"
  ]
});
```

## Process Patterns

### Pattern 1: ETL (Extract, Transform, Load)

1. **Extract**: Connector step to read from source
2. **Transform**: Map step to transform data
3. **Load**: Connector step to write to target

### Pattern 2: API Integration

1. **Receive**: HTTP listener or web service
2. **Validate**: Business rule step
3. **Process**: Connector or map steps
4. **Respond**: HTTP response or notification

### Pattern 3: Error Handling

1. **Try**: Main process steps
2. **Catch**: Error handling steps
3. **Notify**: Notification on error
4. **Log**: Logging step

## Best Practices

1. **Start Simple**: Create basic process structure first, then add complexity
2. **Validate Components**: Ensure all referenced components exist before creating process
3. **Use Discovery**: Use `discover_process_components` to find available components
4. **Validate Structure**: Always validate process structure before deployment
5. **Test Incrementally**: Build and test workflows step by step
6. **Document Steps**: Include descriptions for each step
7. **Handle Errors**: Include error handling in workflows

## Error Handling

### Common Errors

- **Component Not Found**: Referenced component ID doesn't exist
- **Invalid Step Type**: Step type not supported
- **Missing Connections**: Shapes not properly connected
- **Invalid Position**: Shape positions outside valid range
- **Circular References**: Connectors creating loops

### Validation Checks

The `validate_process_structure` tool checks for:
- All referenced components exist
- All shapes are connected
- No circular references
- Valid step configurations
- Required properties present

## Integration with Other Tools

### Using Component Query Tools

Before building a process, query available components:

```typescript
// List connections
const connections = await list_connections({
  profile: "production",
  filter: "type = 'Database'"
});

// List maps
const maps = await list_maps({
  profile: "production",
  filter: "sourceDocumentType = 'Order'"
});

// List business rules
const rules = await list_business_rules({
  profile: "production"
});
```

### Using Atom API

Verify atoms are available before deploying processes:

```typescript
// Check atom status
const atoms = await list_atoms({
  profile: "production",
  filter: "status = 'ONLINE'"
});

if (atoms.length === 0) {
  throw new Error("No online atoms available for deployment");
}
```

## References

- [Boomi Platform API Documentation](https://developer.boomi.com/docs/APIs/PlatformAPI/Introduction/Platform_API)
- [Boomi Process Component Reference](docs/BOOMI_API_COMPONENTS.md)
- [Boomi Atom API Guide](docs/ATOM_API_GUIDE.md)
- [MCP Integration Guide](docs/MCP_INTEGRATION.md)

