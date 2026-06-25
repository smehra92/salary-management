// Mirrors the fixed sets used in server/prisma/seed.ts so filter options match the data.
export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Support',
  'Product',
]

export const COUNTRIES = ['India', 'USA', 'Germany', 'UK', 'Singapore', 'Australia']

// Mirrors the known ISO currency codes validated by the server (employee.service.ts).
export const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AUD']

// Mirrors the seniority bands used in server/prisma/seed.ts.
export const ROLES = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager']
