export interface Employee {
  id: string
  name: string
  email: string
  department: string
  country: string
  role: string
  salaryAmount: number
  salaryCurrency: string
  joinedAt: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedEmployees {
  data: Employee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GroupInsight {
  count: number
  averageSalaryUsd: number
  totalPayrollUsd: number
}

export interface DepartmentInsight extends GroupInsight {
  department: string
}

export interface CountryInsight extends GroupInsight {
  country: string
}

export interface PayInsights {
  totalEmployees: number
  totalAnnualPayrollUsd: number
  averageSalaryUsd: number
  medianSalaryUsd: number
  byDepartment: DepartmentInsight[]
  byCountry: CountryInsight[]
}
