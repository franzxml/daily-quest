import { format } from "date-fns";
import { id } from "date-fns/locale";

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateKeyToDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function dateKeyFromISO(isoDate: string) {
  return getLocalDateKey(new Date(isoDate));
}

export function formatHumanDate(dateKey: string) {
  return format(dateKeyToDate(dateKey), "EEEE, d MMMM yyyy", { locale: id });
}

export function formatShortDate(dateKey: string) {
  return format(dateKeyToDate(dateKey), "d MMM", { locale: id });
}

export function getRecentDateKeys(totalDays: number, fromDateKey = getLocalDateKey()) {
  const startDate = dateKeyToDate(fromDateKey);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - index);

    return getLocalDateKey(date);
  });
}
