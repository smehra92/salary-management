import { get, patch, post } from './client'
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

export interface CreateEmployeeInput {
  name: string
  email: string
  department: string
  country: string
  role: string
  amountMajor: number
  currency: string
  joinedAt: string
}

export function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  return post<Employee>('/employees', input)
}
