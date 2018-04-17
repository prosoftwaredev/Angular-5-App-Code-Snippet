/**
 * Generic typescript utilities.
 */

// remember the included ones in lib.es5.d.ts
// export type Readonly<T> = { readonly [P in keyof T]: T[P] };
// export type Nullable<T> = { [P in keyof T]: T[P] | null };
// export type Partial<T> = { [P in keyof T]?: T[P] };
// export type Pick<T, K extends keyof T> = { [P in K]: T[P] };
// export type Record<K extends string, T> = { [P in K]: T };

export type ImplementationOf<T> = { [K in keyof T]?: T[K] };

export type SelectOptions<T> = Array<{
  value: T;
  viewValue: string;
}>;

export type UnitFormatter = (v: number) => number | string;
export type UnitFormatters = {
  // [ string: label, UnitFormatter: v => format(v), FilterEmpty ]
  [data: string]: [string, UnitFormatter, boolean];
};

export type DataObject = { [s: string]: any };
export type TranslationsObject = { [s: string]: string };
