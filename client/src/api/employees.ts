import { get, patch } from './client'
import type { Employee, PaginatedEmployees } from './types'

export interface GetEmployeesParams {
  page?: number
  pageSize?: number
  search?: string
  department?: string
  country?: string
  [key: string]: string | number | undefined
}

export function getEmployees(params: GetEmployeesParams = {}): Promise<PaginatedEmployees> {
  return get<PaginatedEmployees>('/employees', params)
}

export interface UpdateSalaryParams {
  amountMajor: number
  currency: string
}

export function updateSalary(id: string, params: UpdateSalaryParams): Promise<Employee> {
  return patch<Employee>(`/employees/${id}/salary`, params)
}
