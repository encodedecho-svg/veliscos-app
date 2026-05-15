export function pkr(value: number): string {
  return "PKR " + (value || 0).toLocaleString();
}

export function categoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}
