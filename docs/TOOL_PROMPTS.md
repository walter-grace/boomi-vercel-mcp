# Boomi MCP Tool Example Prompts

This document provides example prompts for each available tool in the Boomi Assistant chatbot. Use these prompts to interact with the tools through natural language.

## Profile Management Tools

### `list_boomi_profiles`
List all saved Boomi credential profiles.

**Example Prompts:**
- "List my Boomi profiles"
- "Show me all my saved profiles"
- "What profiles do I have configured?"
- "Display all Boomi credential profiles"
- "List available profiles"

---

### `set_boomi_credentials`
Store Boomi API credentials for a profile.

**Example Prompts:**
- "Set my Boomi credentials for production"
- "Save my Boomi API credentials"
- "Configure Boomi credentials with account ID 12345"
- "Add a new Boomi profile called 'staging'"
- "Store credentials: account ID xxxxx, username user@example.com, token abc123"

---

### `delete_boomi_profile`
Delete a stored credential profile.

**Example Prompts:**
- "Delete the 'test' profile"
- "Remove my staging profile"
- "Delete profile named production"
- "Remove the Boomi profile called 'dev'"

---

### `boomi_account_info`
Get Boomi account information.

**Example Prompts:**
- "Show me my Boomi account information"
- "What's my Boomi account details?"
- "Get account info for production profile"
- "Display my account information"
- "Tell me about my Boomi account"

---

## Atom API Tools

### `list_atoms`
Query all atoms/runtimes.

**Example Prompts:**
- "List all my atoms"
- "Show me all my Boomi runtimes"
- "What atoms do I have?"
- "List all cloud runtimes"
- "Show me atoms with type Cloud"
- "List the first 10 atoms"
- "Display all atoms in production"

---

### `get_atom`
Get detailed atom information.

**Example Prompts:**
- "Get details for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me information about atom ID abc123"
- "What are the details for my production atom?"
- "Get atom information for xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Tell me about atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

---

### `query_atom_status`
Get atom runtime status and health.

**Example Prompts:**
- "Check the status of my production atom"
- "What's the health status of atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?"
- "Is my atom running?"
- "Check atom status for xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Get runtime status for atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me the health metrics for my atom"

---

## Environment Tools

### `list_environments`
List all available environments.

**Example Prompts:**
- "List all environments"
- "Show me my Boomi environments"
- "What environments are available?"
- "Display all deployment environments"
- "List environments in production profile"

---

### `get_environment`
Get detailed environment information.

**Example Prompts:**
- "Get details for environment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me information about environment ID abc123"
- "What are the details for my production environment?"
- "Get environment information for xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Tell me about environment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

---

## Deployment Tools

### `list_deployments`
List all deployments.

**Example Prompts:**
- "List all deployments"
- "Show me my recent deployments"
- "What deployments have been made?"
- "Display deployment history"
- "List deployments for production profile"
- "Show me deployments from the last week"

---

### `get_deployment_status`
Get deployment status.

**Example Prompts:**
- "What's the status of deployment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?"
- "Check deployment status for ID abc123"
- "Is my deployment complete?"
- "Get status for deployment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me the deployment status"

---

### `create_packaged_component`
Create a deployment package.

**Example Prompts:**
- "Create a package for process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Package my process for deployment"
- "Create deployment package with process ID abc123"
- "Package component xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Create a package for deployment"

---

### `deploy_packaged_component`
Deploy a package to environment/atoms.

**Example Prompts:**
- "Deploy package xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
- "Deploy my package to environment abc123"
- "Deploy package xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Deploy the package to staging environment"
- "Deploy package ID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

---

### `deploy_process`
Convenience tool to deploy a process (package + deploy).

**Example Prompts:**
- "Deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to production"
- "Deploy my process to staging environment"
- "Deploy process ID abc123 to environment xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Deploy the process to production"
- "Package and deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

---

## Component Query Tools

### `query_component`
Generic component query tool.

**Example Prompts:**
- "Query components of type Connection"
- "Find all Process components"
- "Search for components with type Map"
- "Query Connection components with filter name contains 'SFTP'"
- "List all components of type ConnectorOperation"
- "Find components matching 'test'"

---

### `list_connections`
List all Connection components.

**Example Prompts:**
- "List all connections"
- "Show me my Boomi connections"
- "What connections are available?"
- "Display all connection components"
- "List connections in production"
- "Show me connections with name containing 'API'"

---

### `list_maps`
List all Map components.

**Example Prompts:**
- "List all maps"
- "Show me my Boomi maps"
- "What maps are available?"
- "Display all map components"
- "List maps in production"
- "Show me all data maps"

---

### `list_connector_operations`
List ConnectorOperation components.

**Example Prompts:**
- "List all connector operations"
- "Show me connector operations"
- "What connector operations are available?"
- "Display all connector operation components"
- "List connector operations in production"

---

### `list_profiles`
List Profile components (not credential profiles).

**Example Prompts:**
- "List all profile components"
- "Show me Boomi profile components"
- "What profile components are available?"
- "Display all profile components"
- "List profiles in production"

---

## Execution Tools

### `list_execution_records`
List process execution records.

**Example Prompts:**
- "List execution records"
- "Show me recent process executions"
- "What executions have run?"
- "Display execution history"
- "List executions for process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me executions from the last hour"
- "List failed executions"

---

### `get_execution_record`
Get detailed execution record.

**Example Prompts:**
- "Get details for execution xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me execution record ID abc123"
- "What happened in execution xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?"
- "Get execution details for xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Tell me about execution xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me the execution log"

---

## Management Tools

### `manage_trading_partner`
Manage B2B/EDI trading partners (CRUD operations).

**Example Prompts:**
- "List all trading partners"
- "Create a new trading partner"
- "Get trading partner xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Update trading partner xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Delete trading partner xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me trading partner details"
- "Add a new trading partner with name 'Acme Corp'"

---

### `manage_process`
Manage Boomi process components (CRUD operations).

**Example Prompts:**
- "List all processes"
- "Create a new process"
- "Get process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Update process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Delete process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me process details"
- "List processes with name containing 'API'"
- "Create a process called 'Order Processing'"

---

### `manage_organization`
Manage Boomi organization components (CRUD operations).

**Example Prompts:**
- "List all organizations"
- "Create a new organization"
- "Get organization xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Update organization xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Delete organization xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
- "Show me organization details"
- "List all organizations in production"

---

## Multi-Tool Workflows

### Example Workflows Using Multiple Tools

**Deployment Workflow:**
- "List my processes, then deploy the one called 'Order Processing' to production"
- "Show me all environments, then deploy process xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx to the staging environment"
- "Check my atom status, then deploy a process to it"

**Monitoring Workflow:**
- "List all my atoms and show their status"
- "Show me recent executions and their status"
- "List deployments and check their status"

**Component Discovery:**
- "List all connections, maps, and connector operations"
- "Show me all components I can use to build a process"
- "What connections and maps are available for integration?"

**Troubleshooting:**
- "Check my atom status, then show me recent failed executions"
- "List deployments and check which ones failed"
- "Show me execution records for the last hour"

---

## Tips for Using Prompts

1. **Be Specific**: Include IDs when you have them (e.g., "Get atom xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")

2. **Use Profile Names**: Specify profile when needed (e.g., "List atoms in production profile")

3. **Natural Language**: The chatbot understands natural language, so you can ask questions conversationally

4. **Combine Requests**: You can ask for multiple things in one message (e.g., "List my atoms and show their status")

5. **Filters**: Many list tools support filters (e.g., "List atoms with type Cloud")

6. **Follow-up Questions**: You can ask follow-up questions based on previous results

---

## Notes

- All tools require a `profile` parameter (defaults to "production" if not specified)
- Object IDs are UUIDs in the format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Some tools support optional `filter` and `limit` parameters
- The chatbot will automatically use the appropriate tool based on your request

