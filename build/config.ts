export interface PackageDescription {
  name: string;
  hasTestingModule: boolean;
}

export interface Config {
  packages: PackageDescription[];
  scope: string;
}

export const packages: PackageDescription[] = [
  {
    name: 'ngrx-json-api',
    hasTestingModule: false,
  },
];
