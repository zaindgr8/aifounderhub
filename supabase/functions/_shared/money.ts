// Money helpers. Ziina amounts are in fils (1 AED = 100 fils).
export function filsToDisplay(fils: number, currency = "AED"): string {
  const major = (fils / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${currency} ${major}`;
}
