export interface QRHistoryItem {
  id: string;
  type: string;
  content: string;
  color: string;
  backgroundColor: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

const STORAGE_KEY = "qrify-history";

export function getHistory(): QRHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<QRHistoryItem, "id" | "createdAt">): QRHistoryItem {
  const history = getHistory();
  const newItem: QRHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  history.unshift(newItem);
  // Keep max 50
  const trimmed = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return newItem;
}

export function deleteFromHistory(id: string) {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
