/**
 * Local date utilities adhering to PRD Section 6.1
 * targetDate is stored as local date string YYYY-MM-DD
 */

export function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(targetDate: string | null, status: 'pending' | 'completed'): boolean {
  if (!targetDate || status === 'completed') return false;
  const today = getTodayLocalDateString();
  return targetDate < today;
}

export function isDueSoon(targetDate: string | null, status: 'pending' | 'completed', daysAhead = 30): boolean {
  if (!targetDate || status === 'completed') return false;
  const today = getTodayLocalDateString();
  if (targetDate < today) return false; // Overdue, not due soon

  const now = new Date();
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const futureYear = future.getFullYear();
  const futureMonth = String(future.getMonth() + 1).padStart(2, '0');
  const futureDay = String(future.getDate()).padStart(2, '0');
  const maxDate = `${futureYear}-${futureMonth}-${futureDay}`;

  return targetDate <= maxDate;
}

export function formatLocalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  // dateStr is YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10) - 1;
  const day = parseInt(parts[2]!, 10);
  const date = new Date(year, month, day);

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}
