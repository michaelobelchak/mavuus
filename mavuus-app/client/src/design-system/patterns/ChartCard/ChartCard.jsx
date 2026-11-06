import { useId, useMemo, useState } from 'react'
import { Table as TableIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { resolveHeadingLevel } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import { Button, Heading, Text } from '../../primitives'
import { Card } from '../Card/Card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../Table/Table'
import { ChartContext, defaultFormatter, resolveSeries } from './chartConfig'

function ChartDataTable({ title, data, xKey, xLabel, series, valueFormatter, xFormatter, id }) {
  return (
    <Table id={id} density="compact">
      <TableCaption visuallyHidden>{title}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{xLabel}</TableHead>
          {series.map((item) => (
            <TableHead key={item.key} align="right">
              {item.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={`${String(row[xKey])}-${index}`}>
            <TableHead scope="row" className="text-body-sm font-normal tracking-normal text-text-primary normal-case">
              {xFormatter(row[xKey])}
            </TableHead>
            {series.map((item) => (
              <TableCell key={item.key} align="right" className="tabular-nums">
                {valueFormatter(row[item.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Card for one chart, with a "View as table" toggle that swaps the chart for a table of the same
 * numbers. One config feeds both: pass `data`, `xKey`, `series` (and `valueFormatter`,
 * `xFormatter`) to the card and put a bare <BarChart /> or <LineChart /> inside.
 * - `title` (h3 by default, `headingLevel` 2 to 4), `description`, `actions` (a slot, e.g. a
 *   range Select).
 * - `height`: the plot area, sm 240px, md 320px (default), lg 400px.
 * - `xLabel`: the table's first column header (default "Category").
 * - `defaultView`: chart (default) or table. The "View as table" toggle is a pressed button
 *   (aria-pressed) whose label stays the same.
 * - `tableView`: false leaves the toggle out on purpose. Otherwise, without `data` and `series`
 *   the card can't build the table, so the toggle is hidden and dev warns.
 * `ref`, `className` and other props go to the Card (surface variant).
 */
export function ChartCard({
  title,
  description,
  actions,
  headingLevel,
  height,
  data,
  xKey,
  xLabel = 'Category',
  series,
  valueFormatter = defaultFormatter,
  xFormatter = defaultFormatter,
  defaultView = 'chart',
  tableView = true,
  className,
  children,
  ref,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'ChartCard')
  const [view, setView] = useState(defaultView === 'table' ? 'table' : 'chart')
  const tableId = useId()
  const hasConfig = Array.isArray(data) && Array.isArray(series) && series.length > 0
  const canTable = tableView !== false && hasConfig

  if (tableView !== false && !hasConfig) {
    warnOnce(
      'ChartCard:data',
      'ChartCard: pass data, xKey and series to the card (not only the chart) so "View as table" can show the same numbers.',
    )
  }

  const showTable = canTable && view === 'table'
  const context = useMemo(
    () => ({ data, xKey, series, valueFormatter, xFormatter, height, title }),
    [data, xKey, series, valueFormatter, xFormatter, height, title],
  )

  return (
    <Card ref={ref} variant="surface" className={cn('flex flex-col gap-ds-md', className)} {...props}>
      <div className="flex flex-wrap items-start justify-between gap-ds-sm">
        <div className="flex min-w-0 flex-col gap-ds-xxs">
          <Heading level={level} size="h4">
            {title}
          </Heading>
          {description && (
            <Text size="body-sm" tone="secondary">
              {description}
            </Text>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-ds-xs">
          {actions}
          {canTable && (
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={TableIcon}
              aria-pressed={showTable}
              className="aria-pressed:bg-surface-selected"
              aria-controls={showTable ? tableId : undefined}
              onClick={() => setView(showTable ? 'chart' : 'table')}
            >
              View as table
            </Button>
          )}
        </div>
      </div>
      <ChartContext value={context}>
        {showTable ? (
          <ChartDataTable
            id={tableId}
            title={title}
            data={data}
            xKey={xKey}
            xLabel={xLabel}
            series={resolveSeries(series, 'ChartCard')}
            valueFormatter={valueFormatter}
            xFormatter={xFormatter}
          />
        ) : (
          children
        )}
      </ChartContext>
    </Card>
  )
}
