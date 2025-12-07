import { useState, useMemo, ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  FilterFn,
  PaginationState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  Search,
  Settings2,
  Check,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from './Input';
import { Button } from './Button';

// Global filter function
const globalFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  if (value == null) return false;
  return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
};

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  columnToggle?: boolean;
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  className?: string;
  tableClassName?: string;
}

function DataTable<TData>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  selectable = false,
  onSelectionChange,
  columnToggle = false,
  stickyHeader = false,
  striped = false,
  bordered = false,
  compact = false,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  className,
  tableClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [columnToggleOpen, setColumnToggleOpen] = useState(false);

  // Add selection column if selectable
  const tableColumns = useMemo(() => {
    if (!selectable) return columns;

    const selectionColumn: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          aria-label="Select row"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn,
    enableRowSelection: selectable,
  });

  // Notify parent of selection changes
  useMemo(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';
  const headerPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={cn('w-full', className)}>
      {/* Toolbar */}
      {(searchable || columnToggle) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          {searchable && (
            <div className="relative max-w-sm">
              <Input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                leftIcon={<Search className="h-4 w-4" />}
                inputSize="sm"
                className="w-64"
              />
            </div>
          )}

          {columnToggle && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setColumnToggleOpen(!columnToggleOpen)}
                className="gap-2"
              >
                <Settings2 className="h-4 w-4" />
                Columns
              </Button>

              {columnToggleOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setColumnToggleOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-dropdown border border-gray-200 dark:border-gray-700 py-2">
                    {table.getAllLeafColumns().map((column) => {
                      if (column.id === 'select') return null;
                      return (
                        <button
                          key={column.id}
                          onClick={() => column.toggleVisibility()}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span
                            className={cn(
                              'h-4 w-4 rounded border flex items-center justify-center',
                              column.getIsVisible()
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            {column.getIsVisible() && (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                          <span className="capitalize">
                            {column.id.replace(/_/g, ' ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          'relative overflow-auto rounded-lg',
          bordered && 'border border-gray-200 dark:border-gray-700'
        )}
      >
        <table
          className={cn(
            'w-full text-sm text-left',
            tableClassName
          )}
        >
          <thead
            className={cn(
              'text-xs uppercase bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      headerPadding,
                      'font-semibold whitespace-nowrap',
                      bordered &&
                        'border-b border-gray-200 dark:border-gray-700',
                      header.column.getCanSort() && 'cursor-pointer select-none'
                    )}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <span className="inline-flex flex-col">
                          <ChevronUp
                            className={cn(
                              'h-3 w-3 -mb-1',
                              header.column.getIsSorted() === 'asc'
                                ? 'text-brand-500'
                                : 'text-gray-400'
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'h-3 w-3 -mt-1',
                              header.column.getIsSorted() === 'desc'
                                ? 'text-brand-500'
                                : 'text-gray-400'
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: paginationState.pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {tableColumns.map((_, j) => (
                    <td key={j} className={cellPadding}>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                    {emptyIcon}
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    striped &&
                      index % 2 === 1 &&
                      'bg-gray-50/50 dark:bg-gray-800/30',
                    row.getIsSelected() && 'bg-brand-50 dark:bg-brand-900/20'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        cellPadding,
                        'text-gray-900 dark:text-gray-100',
                        bordered &&
                          'border-b border-gray-200 dark:border-gray-700'
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Rows per page:</span>
            <select
              value={paginationState.pageSize}
              onChange={(e) => {
                setPaginationState((prev) => ({
                  ...prev,
                  pageSize: Number(e.target.value),
                  pageIndex: 0,
                }));
              }}
              className="h-8 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {paginationState.pageIndex * paginationState.pageSize + 1}-
              {Math.min(
                (paginationState.pageIndex + 1) * paginationState.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {generatePageNumbers(
                paginationState.pageIndex,
                table.getPageCount()
              ).map((pageNum, i) =>
                pageNum === -1 ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={
                      pageNum === paginationState.pageIndex
                        ? 'primary'
                        : 'ghost'
                    }
                    size="icon-sm"
                    onClick={() => table.setPageIndex(pageNum)}
                    aria-label={`Go to page ${pageNum + 1}`}
                    aria-current={
                      pageNum === paginationState.pageIndex ? 'page' : undefined
                    }
                  >
                    {pageNum + 1}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Selection info */}
      {selectable && Object.keys(rowSelection).length > 0 && (
        <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800 text-sm text-brand-700 dark:text-brand-300">
          {Object.keys(rowSelection).length} row(s) selected
        </div>
      )}
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: number[] = [];

  // Always show first page
  pages.push(0);

  if (currentPage > 3) {
    pages.push(-1); // Ellipsis
  }

  // Pages around current
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 4) {
    pages.push(-1); // Ellipsis
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages - 1);
  }

  return pages;
}

export { DataTable };
export type { ColumnDef };
