// Price maths for the result card. Inputs always come from the dataset.

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2,
})

/** 240 → "₹240", 1240.5 → "₹1,240.5" */
export const formatInr = (n) => inr.format(n)

/** Saving per pack. Percent is rounded down so we never overstate it. */
export function savingFor(drug) {
  const brand = drug.brandPriceInr
  const generic = drug.janAushadhiPriceInr
  const saved = Math.round((brand - generic) * 100) / 100
  const percent = Math.floor((saved / brand) * 100)
  return { brand, generic, saved, percent }
}
