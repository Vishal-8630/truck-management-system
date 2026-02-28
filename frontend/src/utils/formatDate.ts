export const formatDate = (dateInput: any) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};
