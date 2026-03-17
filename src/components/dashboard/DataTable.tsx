import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export const DataTable = <T,>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Aucune donnée disponible",
  onRowClick,
  className
}: DataTableProps<T>) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-3xl border-gray-200 bg-gray-50/50 m-4 sm:m-6">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white overflow-x-auto", className)}>
      <Table>
        <TableHeader className="bg-gray-50/50 border-b-2 border-gray-100">
          <TableRow className="hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={cn(
                  "py-4 px-4 sm:py-6 sm:px-8 font-black text-gray-400 text-xs uppercase tracking-[0.2em] whitespace-nowrap",
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-all hover:bg-orange-50/30 group",
                onRowClick && "cursor-pointer active:scale-[0.99]"
              )}
            >
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  className={cn(
                    "py-4 px-4 sm:py-6 sm:px-8 align-middle border-b-2 border-gray-50 last:border-0",
                    col.hideOnMobile && "hidden sm:table-cell",
                    col.className
                  )}
                >
                  {col.cell ? col.cell(item) : (item[col.accessorKey] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
