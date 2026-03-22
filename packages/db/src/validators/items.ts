// --- Cursor helpers ---

interface ItemCursor {
  dateCreated: string;
  id: string;
}

export function encodeCursor(dateCreated: Date, id: string): string {
  const payload: ItemCursor = { dateCreated: dateCreated.toISOString(), id };
  return btoa(JSON.stringify(payload));
}

export function decodeCursor(cursor: string): ItemCursor {
  try {
    const parsed = JSON.parse(atob(cursor)) as ItemCursor;
    if (!parsed.dateCreated || !parsed.id) {
      throw new Error("Invalid cursor");
    }
    return parsed;
  } catch {
    throw new Error("Invalid cursor format");
  }
}
