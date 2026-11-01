import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${minutes || '00'} ${ampm}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isUpcoming(dateStr: string, timeStr: string): boolean {
  try {
    const sessionTime = new Date(`${dateStr}T${timeStr}`);
    return sessionTime.getTime() > Date.now();
  } catch {
    return true;
  }
}

export function canCancelSession(dateStr: string, timeStr: string): boolean {
  // Cancel allowed >= 2h before session per IE209 FR-6
  try {
    const sessionTime = new Date(`${dateStr}T${timeStr}`);
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return sessionTime.getTime() - Date.now() > twoHoursInMs;
  } catch {
    return false;
  }
}
