import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calculator,
  Clipboard,
  IndianRupee,
  Heart,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Beef,
  Stethoscope,
  Receipt,
} from "lucide-react";
import { ExpenseRecord } from "@shared/expense-types";
import * as api from "@/lib/api";
import { Task, fetchTasks } from "@/lib/task-api";

export default function MainPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.fetchExpenses();
        setExpenses(data);

        const totalIncome = data
          .filter((expense) => expense.type === "Income")
          .reduce((sum, expense) => sum + expense.amount, 0);

        const totalExpenses = data
          .filter((expense) => expense.type === "Expense")
          .reduce((sum, expense) => sum + expense.amount, 0);

        setStats({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          transactionCount: data.length,
        });
      } catch (error) {
        console.error("Error loading expense stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadTasks = async () => {
      try {
        const taskData = await fetchTasks();

        // Filter and sort tasks to get next 3 upcoming items
        const upcomingTasks = taskData
          .filter((task) => task.status !== "completed")
          .sort((a, b) => {
            // Sort by due date, then by priority
            const dateComparison =
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (dateComparison !== 0) return dateComparison;

            // Priority sorting: high = 0, medium = 1, low = 2
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .slice(0, 3);

        setTasks(upcomingTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        setTasks([]); // Set empty array on error
      } finally {
        setTasksLoading(false);
      }
    };

    loadStats();
    loadTasks();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header with Logo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F483f6e241d954aec88a0b40782122459%2F5254047a2582477b8e206724ecfff5b8?format=webp&width=800"
              alt="Bija Farms Logo"
              className="h-20 w-auto"
            />
          </div>
          <div className="text-center mt-4">
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              Bija Farms Management
            </h1>
            <p className="text-green-600 text-lg">
              Integrated farming solutions for modern agriculture
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Expense Tracker Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <IndianRupee className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-800">
                      Bija Expense Tracker
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Track farm finances and manage budgets
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-blue-200 rounded mb-2 w-24"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-8 bg-blue-200 rounded"></div>
                      <div className="h-8 bg-blue-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    Financial Overview:
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Income</span>
                      </div>
                      <div className="text-lg font-bold text-green-800">
                        {formatCurrency(stats.totalIncome)}
                      </div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700 mb-1">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs font-medium">Expenses</span>
                      </div>
                      <div className="text-lg font-bold text-red-800">
                        {formatCurrency(stats.totalExpenses)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Balance:
                        </span>
                      </div>
                      <div
                        className={`text-sm font-bold ${stats.balance >= 0 ? "text-green-700" : "text-red-700"}`}
                      >
                        {formatCurrency(stats.balance)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Transactions:
                        </span>
                      </div>
                      <div className="text-sm font-bold text-blue-700">
                        {stats.transactionCount}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Link to="/expense-tracker">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3">
                    Open Expense Tracker
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Work Tracker Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-800">
                      Bija Work Tracker
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Manage goat & sheep health tasks
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {tasksLoading ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-green-200 rounded mb-3 w-32"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-green-200 rounded"></div>
                      <div className="h-8 bg-green-200 rounded"></div>
                      <div className="h-8 bg-green-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">
                    Next 3 Work Items:
                  </h4>
                  {tasks.length === 0 ? (
                    <div className="text-center py-4">
                      <Clipboard className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-green-600">
                        No upcoming tasks
                      </p>
                      <p className="text-xs text-green-500">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="bg-white/60 p-3 rounded-lg border border-green-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                              <h5 className="text-sm font-medium text-green-800 truncate">
                                {task.title}
                              </h5>
                              <p className="text-xs text-green-600 truncate">
                                {task.category} • {task.taskType}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-green-200 text-center">
                    <span className="text-xs text-green-600">
                      {tasks.length > 0
                        ? "View all tasks in Work Tracker"
                        : "Add new tasks in Work Tracker"}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Link to="/work-tracker">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3">
                    Open Work Tracker
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F483f6e241d954aec88a0b40782122459%2F5254047a2582477b8e206724ecfff5b8?format=webp&width=800"
              alt="Bija Farms Logo"
              className="h-12 w-auto filter brightness-0 invert"
            />
          </div>
          <p className="text-green-200">
            © 2024 Bija Farms. Integrated farming solutions for sustainable
            agriculture.
          </p>
        </div>
      </footer>
    </div>
  );
}
