import { useState } from "react";
import { Edit, Trash2, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExpenseRecord } from "@shared/expense-types";

interface DataTableProps {
  expenses: ExpenseRecord[];
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (id: string) => void;
}

type SortField = keyof ExpenseRecord;
type SortDirection = "asc" | "desc";

export function DataTable({ expenses, onEdit, onDelete }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter out invalid records before sorting
  const validExpenses = expenses.filter(
    (expense) =>
      expense &&
      expense.id &&
      expense.id !== "" &&
      expense.amount !== null &&
      expense.amount !== undefined &&
      !isNaN(expense.amount),
  );

  const sortedExpenses = [...validExpenses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (sortDirection === "asc") {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 lg:px-3"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <SortButton field="date">Date</SortButton>
                </TableHead>
                <TableHead className="w-[80px] hidden sm:table-cell">
                  <SortButton field="type">Type</SortButton>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <SortButton field="description">Description</SortButton>
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortButton field="amount">Amount</SortButton>
                </TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">
                  <SortButton field="category">Category</SortButton>
                </TableHead>
                <TableHead className="w-[80px] hidden lg:table-cell">
                  <SortButton field="paidBy">Paid By</SortButton>
                </TableHead>
                <TableHead className="w-[80px] hidden lg:table-cell">
                  <SortButton field="source">Source</SortButton>
                </TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-500"
                  >
                    No transactions found. Try adjusting your filters or add a
                    new transaction.
                  </TableCell>
                </TableRow>
              ) : (
                sortedExpenses.map((expense, index) => (
                  <TableRow
                    key={`${expense.id}-${index}`}
                    className="hover:bg-slate-50"
                  >
                    <TableCell className="font-medium text-xs sm:text-sm">
                      <div className="whitespace-nowrap">
                        {formatDate(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={
                          expense.type === "Income" ? "default" : "secondary"
                        }
                        className={`text-xs ${
                          expense.type === "Income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {expense.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm line-clamp-2">
                          {expense.description}
                        </div>
                        <div className="sm:hidden text-xs text-slate-500 mt-1">
                          <Badge
                            variant={
                              expense.type === "Income"
                                ? "default"
                                : "secondary"
                            }
                            className={`text-xs mr-1 ${
                              expense.type === "Income"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {expense.type}
                          </Badge>
                          {expense.category}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-slate-500 mt-1 hidden sm:block">
                            {expense.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold text-sm ${expense.type === "Income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {expense.type === "Income" ? "+" : "-"}
                        {formatCurrency(expense.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <div className="font-medium text-sm">
                          {expense.category}
                        </div>
                        <div className="text-xs text-slate-500">
                          {expense.subCategory}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {expense.paidBy}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {expense.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              console.log("Edit clicked for expense:", expense);
                              if (expense && expense.id) {
                                onEdit(expense);
                              } else {
                                console.error(
                                  "Invalid expense for edit:",
                                  expense,
                                );
                              }
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              console.log(
                                "Delete clicked for expense ID:",
                                expense.id,
                              );
                              if (expense && expense.id) {
                                setDeleteId(expense.id);
                              } else {
                                console.error(
                                  "Invalid expense ID for delete:",
                                  expense,
                                );
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination could be added here for large datasets */}
        {sortedExpenses.length > 0 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-slate-500">
              Showing {sortedExpenses.length} of {validExpenses.length} valid
              transactions
              {validExpenses.length < expenses.length && (
                <span className="text-orange-600 ml-2">
                  ({expenses.length - validExpenses.length} invalid records
                  hidden)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
