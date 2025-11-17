/**
 * Utility functions for extracting and formatting data from nested objects
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTitleOrDisplayName(
  obj: any,
  maxDepth = 5,
  currentDepth = 0
): string | null {
  if (currentDepth >= maxDepth) return null;

  if (obj === null || obj === undefined) return null;

  // If it's a string, return it
  if (typeof obj === "string" && obj.length > 0) {
    return obj;
  }

  // If it's an array, check each item
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = extractTitleOrDisplayName(
        item,
        maxDepth,
        currentDepth + 1
      );
      if (result) return result;
    }
    return null;
  }

  // If it's an object, prioritize title and displayName
  if (typeof obj === "object") {
    // First priority: title
    if (obj.title && typeof obj.title === "string" && obj.title.length > 0) {
      return obj.title;
    }

    // Second priority: displayName
    if (
      obj.displayName &&
      typeof obj.displayName === "string" &&
      obj.displayName.length > 0
    ) {
      return obj.displayName;
    }

    // Third priority: name
    if (obj.name && typeof obj.name === "string" && obj.name.length > 0) {
      return obj.name;
    }

    // Check nested common structures (chatroom, etc.)
    if (obj.chatroom) {
      const chatroomResult = extractTitleOrDisplayName(
        obj.chatroom,
        maxDepth,
        currentDepth + 1
      );
      if (chatroomResult) return chatroomResult;
    }

    // Recursively search through all properties
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip certain keys that are unlikely to contain display values
        if (
          key === "id" ||
          key === "seqNo" ||
          key === "version" ||
          key === "status" ||
          key === "createdAt" ||
          key === "updatedAt" ||
          key === "meta" ||
          key.startsWith("_") ||
          key.endsWith("-meta")
        ) {
          continue;
        }

        const result = extractTitleOrDisplayName(
          obj[key],
          maxDepth,
          currentDepth + 1
        );
        if (result) return result;
      }
    }
  }

  return null;
}

/**
 * Extracts field IDs from a link type field definition
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractLinkFields(fieldType: any): number[] {
  if (!fieldType) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    if (typeof fieldType === "string") {
      parsed = JSON.parse(fieldType);
    } else {
      parsed = fieldType;
    }

    const linkData = parsed["~#link"] || parsed;
    if (!linkData.settings) return [];

    const settings =
      typeof linkData.settings === "string"
        ? JSON.parse(linkData.settings)
        : linkData.settings;

    return Array.isArray(settings.fields) ? settings.fields : [];
  } catch {
    return [];
  }
}

