#!/usr/bin/env tsx
/**
 * Quick script to explore Boomi profiles and list all available tools
 */

import { config } from "dotenv";
import { getBoomiMCPTools } from "../lib/ai/mcp-client";

config({ path: ".env.local" });

async function exploreProfilesAndTools() {
  console.log("🔍 Exploring Boomi Profiles and Tools");
  console.log("=".repeat(70));
  console.log("");

  // Load MCP tools
  console.log("1️⃣ Loading MCP tools...");
  const { clearMCPCache } = await import("../lib/ai/mcp-client");
  clearMCPCache();
  const tools = await getBoomiMCPTools();
  const toolNames = Object.keys(tools).sort();
  console.log(`   ✅ Loaded ${toolNames.length} tools\n`);

  // List all tools
  console.log("2️⃣ Available Tools:");
  console.log("-".repeat(70));
  toolNames.forEach((name, index) => {
    const tool = tools[name];
    const description = tool?.description || "No description";
    console.log(`   ${(index + 1).toString().padStart(2, " ")}. ${name}`);
    console.log(`      ${description.substring(0, 60)}${description.length > 60 ? "..." : ""}`);
  });
  console.log("");

  // Test profile listing
  console.log("3️⃣ Testing Profile Management:");
  console.log("-".repeat(70));

  if (tools.list_boomi_profiles) {
    try {
      console.log("   Calling list_boomi_profiles...");
      const result = await tools.list_boomi_profiles.execute({});
      console.log("   ✅ Success!");
      console.log("");
      
      if (result && typeof result === "object") {
        const profiles = Array.isArray(result) 
          ? result 
          : result.profiles || result.result?.profiles || result.data || [];
        
        if (Array.isArray(profiles) && profiles.length > 0) {
          console.log(`   📋 Found ${profiles.length} profile(s):`);
          profiles.forEach((profile: any, index: number) => {
            const name = profile.profile || profile.name || profile.profileName || "Unknown";
            const accountId = profile.account_id || profile.accountId || "Unknown";
            console.log(`      ${index + 1}. ${name}`);
            console.log(`         Account ID: ${accountId}`);
            if (profile.username) {
              console.log(`         Username: ${profile.username}`);
            }
          });
        } else {
          console.log("   📋 No profiles found");
          console.log("   💡 Set up a profile using: set_boomi_credentials");
        }
      } else {
        console.log("   📋 Result:", JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.log("   ❌ Error:", error instanceof Error ? error.message : String(error));
    }
  } else {
    console.log("   ⚠️  list_boomi_profiles tool not found");
  }
  console.log("");

  // Test list_profiles if it exists
  if (tools.list_profiles && tools.list_profiles !== tools.list_boomi_profiles) {
    console.log("4️⃣ Testing list_profiles (alternative):");
    console.log("-".repeat(70));
    try {
      const result = await tools.list_profiles.execute({
        profile: "production",
      });
      console.log("   ✅ Success!");
      console.log("   Result:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.log("   ❌ Error:", error instanceof Error ? error.message : String(error));
    }
    console.log("");
  }

  // Categorize tools
  console.log("5️⃣ Tools by Category:");
  console.log("-".repeat(70));

  const categories: Record<string, string[]> = {
    "Profile Management": [],
    "Atom API": [],
    "Environment": [],
    "Deployment": [],
    "Components": [],
    "Executions": [],
    "Process Management": [],
    "Other": [],
  };

  toolNames.forEach((name) => {
    if (name.includes("profile") || name.includes("credential") || name.includes("account")) {
      categories["Profile Management"].push(name);
    } else if (name.includes("atom")) {
      categories["Atom API"].push(name);
    } else if (name.includes("environment")) {
      categories["Environment"].push(name);
    } else if (name.includes("deploy") || name.includes("package")) {
      categories["Deployment"].push(name);
    } else if (name.includes("execution") || name.includes("record")) {
      categories["Executions"].push(name);
    } else if (name.includes("connection") || name.includes("map") || name.includes("component") || name.includes("connector")) {
      categories["Components"].push(name);
    } else if (name.includes("process")) {
      categories["Process Management"].push(name);
    } else {
      categories["Other"].push(name);
    }
  });

  Object.entries(categories).forEach(([category, tools]) => {
    if (tools.length > 0) {
      console.log(`   ${category}: ${tools.length} tool(s)`);
      tools.forEach((tool) => {
        console.log(`      - ${tool}`);
      });
    }
  });
  console.log("");

  console.log("=".repeat(70));
  console.log("✅ Exploration complete!");
  console.log("");
  console.log("💡 Next steps:");
  console.log("   1. Run: npx tsx scripts/test-all-new-tools.ts");
  console.log("   2. Test specific tools with their test scripts");
  console.log("   3. Use tools in chat: 'List all my atoms'");
  console.log("");
}

exploreProfilesAndTools().catch(console.error);

