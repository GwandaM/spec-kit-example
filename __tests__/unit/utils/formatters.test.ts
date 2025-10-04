import { formatCurrency, formatDate } from "@/lib/utils/formatters";

describe("formatCurrency", () => {
  it("formats USD values for en-US locale", () => {
    const output = formatCurrency({
      amount: 1234.5,
      currency: "USD",
      locale: "en-US",
    });

    const normalized = output.replace(/\u00A0/g, " ");
    expect(normalized).toBe("$1,234.50");
  });

  it("formats EUR values for de-DE locale with code display", () => {
    const output = formatCurrency({
      amount: 1234.5,
      currency: "EUR",
      locale: "de-DE",
      options: { currencyDisplay: "code", useGrouping: false },
    });

    const normalized = output.replace(/\u00A0/g, " ");
    expect(normalized).toBe("1234,50 EUR");
  });
});

describe("formatDate", () => {
  it("formats a date string using the provided locale", () => {
    const output = formatDate({
      value: "2024-05-01T00:00:00Z",
      locale: "en-US",
      options: { dateStyle: "medium", timeZone: "UTC" },
    });

    expect(output).toBe("May 1, 2024");
  });

  it("formats date and time with explicit options", () => {
    const output = formatDate({
      value: new Date(Date.UTC(2024, 0, 1, 12, 30)),
      locale: "en-GB",
      options: { timeStyle: "short", timeZone: "UTC" },
    });

    expect(output).toBe("12:30");
  });
});
