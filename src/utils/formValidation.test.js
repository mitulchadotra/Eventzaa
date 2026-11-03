import {
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidText,
} from "./formValidation";

test("validates email addresses", () => {
  expect(isValidEmail("person@example.com")).toBe(true);
  expect(isValidEmail("person@localhost")).toBe(false);
  expect(isValidEmail("not-an-email")).toBe(false);
});

test("validates optional phone numbers", () => {
  expect(isValidPhone("")).toBe(true);
  expect(isValidPhone("+91 98765 43210")).toBe(true);
  expect(isValidPhone("123")).toBe(false);
  expect(isValidPhone("91+9876543210")).toBe(false);
  expect(isValidPhone("phone-number")).toBe(false);
});

test("validates trimmed text length", () => {
  expect(isValidText("  Event name  ", 2, 20)).toBe(true);
  expect(isValidText(" ", 1, 20)).toBe(false);
  expect(isValidText("This name is too long", 1, 10)).toBe(false);
});

test("validates real calendar dates", () => {
  expect(isValidDate("2026-11-03")).toBe(true);
  expect(isValidDate("2026-02-30")).toBe(false);
  expect(isValidDate("")).toBe(false);
});
