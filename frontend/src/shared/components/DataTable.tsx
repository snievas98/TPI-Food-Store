import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui'

export function DataTable<T extends object>({ data, columns, paginate = true }: { data: T[]; columns: ColumnDef<T>[]; paginate?: boolean }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), manualPagination: !paginate, initialState: { pagination: { pageSize: 8 } } })
  return <><div className="table-scroll"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div>{paginate && <div className="flex justify-end items-center gap-3 mt-4 text-sm"><span className="muted">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}</span><Button variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button><Button variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button></div>}</>
}
