import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export const DataTable = <T extends any>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Aucune donnée disponible",
  onRowClick,
  className
}: DataTableProps<T>) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl border-gray-200 bg-gray-50/50">
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border bg-white overflow-hidden shadow-sm", className)}>
      <Table>
        <TableHeader className="bg-gray-50 border-b border-gray-100">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead 
                key={i} 
                className={cn(
                  "py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider", 
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
                "transition-colors hover:bg-gray-50",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, i) => (
                <TableCell key={i} className={cn("py-4 align-middle border-b border-gray-50 last:border-0", col.className)}>
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
