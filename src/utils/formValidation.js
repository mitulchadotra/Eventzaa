export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
    typeof value === "string" ? value.trim() : ""
  );

export const isValidPhone = (value) => {
  const phone = typeof value === "string" ? value.trim() : "";

  if (!phone) return true;
  if (!/^\+?[()\d\s-]+$/.test(phone)) return false;

  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
};

export const isValidText = (value, minLength = 1, maxLength = 200) => {
  if (typeof value !== "string") return false;

  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength;
};

export const isValidDate = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  const date = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);

    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    );
  }

  return !Number.isNaN(new Date(date).getTime());
};
