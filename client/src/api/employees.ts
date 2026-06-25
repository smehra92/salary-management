import { get } from './client'
import type { PaginatedEmployees } from './types'

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
