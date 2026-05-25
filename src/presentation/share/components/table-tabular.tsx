import type { ReactNode } from "react";
import { TableProperties } from "lucide-react";

export type TableTabularColumn<T> = {
  key: string;
  header: ReactNode;
  className?: string;
  render: (item: T, index: number) => ReactNode;
  getTitle?: (item: T, index: number) => string;
};

interface TableTabularProps<T> {
  title: string;
  columns: TableTabularColumn<T>[];
  rows: T[];
  rowKey: (item: T, index: number) => string;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  maxHeightClassName?: string;
  rowNumberStart?: number;
  getRowClassName?: (item: T, index: number) => string;
  fitContent?: boolean;
}
export const TableTabular = <T,>({
  title,
  columns,
  rows,
  rowKey,
  isLoading = false,
  loadingMessage = "Cargando registros...",
  emptyMessage = "No hay registros para mostrar.",
  maxHeightClassName = "max-h-[560px]",
  rowNumberStart = 1,
  getRowClassName,
  fitContent = false,
}: TableTabularProps<T>) => {
  const hasRows = rows.length > 0 && columns.length > 0;
  const getColumnClassName = (column: TableTabularColumn<T>) =>
    column.key === "actions"
      ? "w-px whitespace-nowrap"
      : column.className || "";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-sky-50 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-300 bg-gradient-to-b from-sky-100 to-slate-100 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 dark:text-slate-300">
        <TableProperties className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
        {title}
      </div>

      {isLoading ? (
        <div className="px-4 py-8 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
          {loadingMessage}
        </div>
      ) : hasRows ? (
        <div className={`${maxHeightClassName} overflow-auto`}>
          <table className={`${fitContent ? "w-max" : "min-w-full"} border-collapse font-mono text-[11px] leading-4 text-slate-800 dark:text-slate-200`}>
            <thead className="sticky top-0 z-10 bg-sky-100 dark:bg-slate-900">
              <tr>
                <th className="border-b border-r border-slate-400 px-2 py-1 text-left font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-300">
                  #
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`border-b border-r border-slate-400 px-2 py-1 text-left font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-300 ${getColumnClassName(column)}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr
                  key={rowKey(item, index)}
                  className={
                    getRowClassName?.(item, index) ||
                    "odd:bg-white even:bg-sky-50/70 dark:odd:bg-slate-950 dark:even:bg-slate-900/70"
                  }
                >
                  <td className="border-b border-r border-slate-300 px-2 py-1 align-top text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    {rowNumberStart + index}
                  </td>
                  {columns.map((column) => (
                    <td
                      key={`${rowKey(item, index)}-${column.key}`}
                      className={`max-w-[240px] border-b border-r border-slate-300 px-2 py-1 align-top text-[11px] text-slate-800 dark:border-slate-800 dark:text-slate-200 ${getColumnClassName(column)}`}
                      title={column.getTitle?.(item, index)}
                    >
                      <span className="block whitespace-nowrap">
                        {column.render(item, index)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-8 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};
