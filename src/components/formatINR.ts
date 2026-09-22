/** Formats a number as a whole-rupee INR amount, e.g. `1499` -> "₹1,499". */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
