import { NameServiceResolution } from "@/types/profile";

// Cache for name resolutions with TTL
const resolutionCache = new Map<string, NameServiceResolution>();

/**
 * Resolve Stellar Name Service (SNS) or Federated address
 * @param address Stellar address to resolve
 * @returns Promise<NameServiceResolution>
 */
export async function resolveStellarName(
  address: string,
): Promise<NameServiceResolution> {
  // Check cache first
  const cached = resolutionCache.get(address);
  if (cached && Date.now() - cached.resolvedAt < cached.ttl * 1000) {
    return cached;
  }

  const resolution: NameServiceResolution = {
    address,
    type: "none",
    resolvedAt: Date.now(),
    ttl: 3600, // 1 hour default TTL
  };

  try {
    // Check if it's a federated address (contains *)
    if (address.includes("*")) {
      resolution.type = "federated";
      resolution.name = address;
    } else {
      // Try SNS resolution
      // Note: This is a simplified implementation. In production, you would:
      // 1. Query SNS smart contract on Stellar network
      // 2. Use a proper SNS API or indexer
      // For now, we'll simulate resolution for demo purposes

      // Simulate SNS API call
      const snsResponse = await fetch(
        `https://sns-api.example.com/resolve/${address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (snsResponse.ok) {
        const data = await snsResponse.json();
        if (data.name) {
          resolution.type = "sns";
          resolution.name = data.name;
          resolution.ttl = data.ttl || 3600;
        }
      }
    }
  } catch (error) {
    console.warn("Name service resolution failed:", error);
    // Continue with 'none' type
  }

  // Cache the result
  resolutionCache.set(address, resolution);

  return resolution;
}

/**
 * Generate Jazzicon/Blockies style identicon for address
 * @param address Stellar address
 * @param size Size of the identicon
 * @returns Data URL for the identicon
 */
export function generateIdenticon(address: string, size: number = 32): string {
  // Simple hash function for address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Create a simple colored circle based on hash
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Generate color from hash
  const hue = Math.abs(hash) % 360;
  ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.fill();

  // Add a border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas.toDataURL();
}

/**
 * Get display name for a user, with fallbacks
 * @param profile User profile
 * @returns Display name string
 */
export function getDisplayName(profile: any): string {
  if (profile.displayName) return profile.displayName;
  if (profile.snsName) return profile.snsName;
  if (profile.federatedAddress) return profile.federatedAddress;
  if (profile.name) return profile.name;
  if (profile.username) return profile.username;
  return "Anonymous User";
}

/**
 * Calculate profile completion percentage
 * @param profile User profile
 * @returns Completion percentage (0-100)
 */
export function calculateProfileCompletion(profile: any): number {
  const items = [
    { field: "avatar", weight: 20, required: false },
    { field: "name", weight: 15, required: true },
    { field: "username", weight: 10, required: true },
    { field: "bio", weight: 10, required: false },
    { field: "location", weight: 5, required: false },
    { field: "website", weight: 5, required: false },
    { field: "stellarAddress", weight: 20, required: false },
    { field: "email", weight: 15, required: true },
  ];

  let completed = 0;
  let totalWeight = 0;

  for (const item of items) {
    totalWeight += item.weight;
    if (profile[item.field] && profile[item.field].toString().trim()) {
      completed += item.weight;
    } else if (!item.required) {
      // Optional items still count as completed if attempted
      completed += item.weight * 0.5;
    }
  }

  return Math.round((completed / totalWeight) * 100);
}
