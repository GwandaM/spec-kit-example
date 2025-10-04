export interface FormatCurrencyArgs {
  amount: number;
  currency: string;
  locale: string;
  options?: Intl.NumberFormatOptions;
}

export interface FormatDateArgs {
  value: Date | string | number;
  locale: string;
  options?: Intl.DateTimeFormatOptions;
}

const toDate = (value: FormatDateArgs["value"]): Date => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value provided to formatDate");
  }

  return date;
};

export const formatCurrency = ({
  amount,
  currency,
  locale,
  options,
}: FormatCurrencyArgs): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...options,
  });

  return formatter.format(amount);
};

export const formatDate = ({ value, locale, options }: FormatDateArgs): string => {
  const date = toDate(value);
  const formatter = new Intl.DateTimeFormat(locale, options);

  return formatter.format(date);
};
