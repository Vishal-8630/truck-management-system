export const formatNumber = (value: string) => {
  const num = Number(value);
  if (isNaN(num)) return 0;

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
