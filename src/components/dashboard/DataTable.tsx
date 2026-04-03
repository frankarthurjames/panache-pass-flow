import { ReactNode, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  pageSize?: number;
}

export const DataTable = <T,>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Aucune donnée disponible",
  onRowClick,
  className,
  pageSize = 0 // 0 means no pagination
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-3xl border-gray-200 bg-gray-50/50 m-4 sm:m-6">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-center">{emptyMessage}</p>
      </div>
    );
  }

  // Pagination logic
  const isPaginated = pageSize > 0 && data.length > pageSize;
  const totalPages = isPaginated ? Math.ceil(data.length / pageSize) : 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = isPaginated
    ? data.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)
    : data;

  return (
    <div className="space-y-4">
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
            {paginatedData.map((item) => (
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

      {isPaginated && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
          <div className="text-sm text-gray-500 font-medium">
            Page {safeCurrentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-xl border-gray-200 hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="rounded-xl border-gray-200 hover:bg-white"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
