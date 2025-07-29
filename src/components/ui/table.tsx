import * as React from "react";
import { cn } from "@/lib/utils";

const Table = ({className, ...props}: React.HTMLAttributes<HTMLTableElement>) => (
    <table className={cn("w-full text-sm text-left", className)} {...props} />
)

const TableHeader = ({ className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("text-xs text-muted-foreground uppercase bg-muted", className)} {...props} />
)

const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={cn("divide-y", className)} {...props} />
)

const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("hover:bg-accent transition-colors", className)} {...props} />
)

const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th scope="col" className={cn("px-4 py-2 font-medium", className)} {...props} />
)

const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-2", className)} {...props} />
)

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };