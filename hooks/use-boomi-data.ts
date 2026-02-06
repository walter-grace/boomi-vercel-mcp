import { useState, useEffect } from "react";

interface BoomiData {
  processes: Array<{ id: string; name: string }>;
  atoms: Array<{ id: string; name: string }>;
  environments: Array<{ id: string; name: string }>;
  connections: Array<{ id: string; name: string }>;
  maps: Array<{ id: string; name: string }>;
  loading: boolean;
  error: string | null;
}

export function useBoomiData() {
  const [data, setData] = useState<BoomiData>({
    processes: [],
    atoms: [],
    environments: [],
    connections: [],
    maps: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchBoomiData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch data using the MCP tools via API
        // We'll need to create an API endpoint that calls the MCP tools
        const response = await fetch("/api/boomi-data");
        
        if (!response.ok) {
          throw new Error("Failed to fetch Boomi data");
        }

        const boomiData = await response.json();
        
        setData({
          processes: boomiData.processes || [],
          atoms: boomiData.atoms || [],
          environments: boomiData.environments || [],
          connections: boomiData.connections || [],
          maps: boomiData.maps || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching Boomi data:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    }

    fetchBoomiData();
  }, []);

  return data;
}

