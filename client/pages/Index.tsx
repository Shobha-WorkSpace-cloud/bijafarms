import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExpenseRecord,
  ExpenseFilters,
  ExpenseSummary,
} from "@shared/expense-types";
import { DataTable } from "@/components/DataTable";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { ImportExport } from "@/components/ImportExport";
import { ClearCacheButton } from "@/components/ClearCacheButton";

import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";

export default function Index() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseRecord[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: "",
    type: "",
    category: "",
    paidBy: "",
    source: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load expenses from API on component mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await api.fetchExpenses();
        console.log("Initial load - expenses count:", data.length);
        console.log(
          "Initial load - sample IDs:",
          data.slice(0, 5).map((e) => e.id),
        );
        console.log(
          "Checking for ID 321:",
          data.find((e) => e.id === "321") ? "FOUND" : "NOT FOUND",
        );
        setExpenses(data);
        setFilteredExpenses(data);
      } catch (error) {
        console.error("Error loading expenses:", error);
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, [toast]);

  // Filter expenses based on current filters
  useEffect(() => {
    let filtered = expenses;

    if (filters.search) {
      filtered = filtered.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          expense.notes.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.type) {
      filtered = filtered.filter((expense) => expense.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(
        (expense) => expense.category === filters.category,
      );
    }

    if (filters.paidBy) {
      filtered = filtered.filter(
        (expense) => expense.paidBy === filters.paidBy,
      );
    }

    if (filters.source) {
      filtered = filtered.filter(
        (expense) => expense.source === filters.source,
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((expense) => expense.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((expense) => expense.date <= filters.dateTo);
    }

    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  // Calculate summary statistics
  const summary: ExpenseSummary = useMemo(() => {
    const totalIncome = filteredExpenses
      .filter((expense) => expense.type === "Income")
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalExpenses = filteredExpenses
      .filter((expense) => expense.type === "Expense")
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: filteredExpenses.length,
    };
  }, [filteredExpenses]);

  // Get unique values for dropdowns
  const uniqueCategories = [...new Set(expenses.map((e) => e.category))];
  const uniquePaidBy = [...new Set(expenses.map((e) => e.paidBy))];
  const uniqueSources = [...new Set(expenses.map((e) => e.source))];

  const handleAddExpense = async (newExpense: ExpenseRecord) => {
    try {
      const createdExpense = await api.createExpense(newExpense);
      setExpenses((prev) => [createdExpense, ...prev]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = async (updatedExpense: ExpenseRecord) => {
    try {
      if (!updatedExpense || !updatedExpense.id) {
        throw new Error("Invalid expense data for update");
      }

      console.log("Updating expense:", updatedExpense);
      const updated = await api.updateExpense(
        updatedExpense.id,
        updatedExpense,
      );
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === updated.id ? updated : expense)),
      );
      setEditingExpense(null);
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      if (!id || id.trim() === "") {
        throw new Error("Invalid expense ID for deletion");
      }

      console.log("Deleting expense with ID:", id);
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportExpenses = async (importedExpenses: ExpenseRecord[]) => {
    try {
      await api.importExpenses(importedExpenses);
      // Reload all expenses from server to get the latest data
      const refreshedExpenses = await api.fetchExpenses();
      setExpenses(refreshedExpenses);
      toast({
        title: "Success",
        description: `Imported ${importedExpenses.length} expenses successfully`,
      });
    } catch (error) {
      console.error("Error importing expenses:", error);
      toast({
        title: "Error",
        description: "Failed to import expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);

      // Clear any browser caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      const refreshedExpenses = await api.fetchExpenses();
      console.log(
        "Refreshed expenses data:",
        refreshedExpenses.length,
        "records",
      );
      console.log(
        "Sample IDs:",
        refreshedExpenses.slice(0, 5).map((e) => e.id),
      );

      setExpenses(refreshedExpenses);
      setFilteredExpenses(refreshedExpenses);
      toast({
        title: "Success",
        description: "Data refreshed successfully - all caches cleared",
      });
    } catch (error) {
      console.error("Error refreshing expenses:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Description",
      "Amount",
      "Paid By",
      "Category",
      "Sub-Category",
      "Source",
      "Notes",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredExpenses.map((expense) =>
        [
          expense.date,
          expense.type,
          `"${expense.description}"`,
          expense.amount,
          `"${expense.paidBy}"`,
          `"${expense.category}"`,
          `"${expense.subCategory}"`,
          `"${expense.source}"`,
          `"${expense.notes}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Bija Expense Tracker
          </h1>
          <p className="text-slate-600 text-lg">Manage finances with ease</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                ₹
                {summary.totalIncome.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                ₹
                {summary.totalExpenses.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${summary.balance >= 0 ? "text-blue-900" : "text-red-900"}`}
              >
                ₹
                {summary.balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {summary.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10 w-64"
                  />
                </div>

                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: value === "all" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: value === "all" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefreshData}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>

                <ClearCacheButton />

                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                      <DialogDescription>
                        Enter the details for your new income or expense
                        transaction.
                      </DialogDescription>
                    </DialogHeader>
                    <ExpenseForm
                      onSubmit={handleAddExpense}
                      onCancel={() => setIsAddDialogOpen(false)}
                      categories={uniqueCategories}
                      paidByOptions={uniquePaidBy}
                      sourceOptions={uniqueSources}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="table">Data Table</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <DataTable
              expenses={filteredExpenses}
              onEdit={setEditingExpense}
              onDelete={handleDeleteExpense}
            />
          </TabsContent>

          <TabsContent value="charts">
            <ExpenseCharts expenses={filteredExpenses} />
          </TabsContent>

          <TabsContent value="import">
            <ImportExport expenses={expenses} onImport={handleImportExpenses} />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingExpense}
          onOpenChange={() => setEditingExpense(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the details for this transaction.
              </DialogDescription>
            </DialogHeader>
            {editingExpense && (
              <ExpenseForm
                initialData={editingExpense}
                onSubmit={handleEditExpense}
                onCancel={() => setEditingExpense(null)}
                categories={uniqueCategories}
                paidByOptions={uniquePaidBy}
                sourceOptions={uniqueSources}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
