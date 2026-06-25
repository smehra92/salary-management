import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePayInsights } from '@/hooks/usePayInsights'
import type { PayInsights } from '@/api/types'
import { abbreviateUsd, formatUsdExact } from '@/lib/formatUsd'
import { sortDescendingBy } from '@/lib/sortByKey'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartDatum {
  name: string
  averageSalaryUsd: number
  count: number
}

function buildDepartmentChartData(insights: PayInsights): ChartDatum[] {
  const mapped = insights.byDepartment.map((d) => ({
    name: d.department,
    averageSalaryUsd: d.averageSalaryUsd,
    count: d.count,
  }))
  return sortDescendingBy(mapped, 'averageSalaryUsd')
}

function buildCountryChartData(insights: PayInsights, sortKey: 'averageSalaryUsd' | 'count'): ChartDatum[] {
  const mapped = insights.byCountry.map((c) => ({
    name: c.country,
    averageSalaryUsd: c.averageSalaryUsd,
    count: c.count,
  }))
  return sortDescendingBy(mapped, sortKey)
}

function MetricCard({ label, value, exactValue }: { label: string; value: string; exactValue?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold" title={exactValue}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface ChartTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{ payload: ChartDatum }>
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p>{formatUsdExact(point.averageSalaryUsd)}</p>
      <p className="text-muted-foreground">{point.count.toLocaleString()} employees</p>
    </div>
  )
}

function InsightsBarChart({
  data,
  dataKey,
  color,
}: {
  data: ChartDatum[]
  dataKey: 'averageSalaryUsd' | 'count'
  color: string
}) {
  if (data.length === 0) {
    return <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value: number) => (dataKey === 'count' ? value.toLocaleString() : abbreviateUsd(value))}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-[340px] w-full" />
        <Skeleton className="h-[340px] w-full" />
        <Skeleton className="h-[340px] w-full md:col-span-2" />
      </div>
    </div>
  )
}

export function PayInsightsDashboard() {
  const { data, loading, error } = usePayInsights()

  if (error) {
    return <p className="text-sm text-destructive">Failed to load insights: {error}</p>
  }

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  const departmentData = buildDepartmentChartData(data)
  const countryHeadcountData = buildCountryChartData(data, 'count')
  const countryAverageData = buildCountryChartData(data, 'averageSalaryUsd')

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">All salary figures normalized to USD for comparison.</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total employees" value={data.totalEmployees.toLocaleString()} />
        <MetricCard
          label="Total annual payroll"
          value={abbreviateUsd(data.totalAnnualPayrollUsd)}
          exactValue={formatUsdExact(data.totalAnnualPayrollUsd)}
        />
        <MetricCard
          label="Average salary"
          value={abbreviateUsd(data.averageSalaryUsd)}
          exactValue={formatUsdExact(data.averageSalaryUsd)}
        />
        <MetricCard
          label="Median salary"
          value={abbreviateUsd(data.medianSalaryUsd)}
          exactValue={formatUsdExact(data.medianSalaryUsd)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Average salary by department">
          <InsightsBarChart data={departmentData} dataKey="averageSalaryUsd" color="var(--chart-1)" />
        </ChartCard>
        <ChartCard title="Headcount by country">
          <InsightsBarChart data={countryHeadcountData} dataKey="count" color="var(--chart-2)" />
        </ChartCard>
        <ChartCard title="Average salary by country" className="md:col-span-2">
          <InsightsBarChart data={countryAverageData} dataKey="averageSalaryUsd" color="var(--chart-3)" />
        </ChartCard>
      </div>
    </div>
  )
}
