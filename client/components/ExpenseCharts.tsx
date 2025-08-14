import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ExpenseRecord,
  CategoryChartData,
  MonthlyChartData,
} from "@shared/expense-types";

interface ExpenseChartsProps {
  expenses: ExpenseRecord[];
}

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#6366F1",
];

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Category breakdown for expenses (filter out invalid records)
  const expenseCategoryData: CategoryChartData[] = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    expenses
      .filter(
        (expense) =>
          expense.type === "Expense" &&
          expense.amount > 0 &&
          expense.description &&
          expense.description.trim() !== "" &&
          expense.description !== "No description" &&
          expense.category !== "Other",
      )
      .forEach((expense) => {
        const existing = categoryMap.get(expense.category) || {
          amount: 0,
          count: 0,
        };
        categoryMap.set(expense.category, {
          amount: existing.amount + expense.amount,
          count: existing.count + 1,
        });
      });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Monthly expenses tracking (last 12 months)
  const monthlyData: MonthlyChartData[] = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    // Calculate date range for last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.type === "Expense" &&
          expenseDate >= twelveMonthsAgo &&
          expense.amount > 0 &&
          expense.description &&
          expense.description.trim() !== "" &&
          expense.description !== "No description"
        );
      })
      .forEach((expense) => {
        const month = new Date(expense.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });

        const existing = monthMap.get(month) || { income: 0, expenses: 0 };
        existing.expenses += expense.amount;
        monthMap.set(month, existing);
      });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
      }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
      );
  }, [expenses]);

  // Top spending categories for pie chart
  const topCategories = expenseCategoryData.slice(0, 8);
  const otherCategories = expenseCategoryData.slice(8);
  const pieData = [
    ...topCategories,
    ...(otherCategories.length > 0
      ? [
          {
            category: "Other",
            amount: otherCategories.reduce((sum, cat) => sum + cat.amount, 0),
            count: otherCategories.reduce((sum, cat) => sum + cat.count, 0),
          },
        ]
      : []),
  ];

  // Sub-category breakdown by category
  const subCategoryData = useMemo(() => {
    const categorySubMap = new Map<string, Map<string, { amount: number; count: number }>>();

    expenses
      .filter(
        (expense) =>
          expense.type === "Expense" &&
          expense.amount > 0 &&
          expense.description &&
          expense.description.trim() !== "" &&
          expense.description !== "No description" &&
          expense.category !== "Other" &&
          expense.subCategory &&
          expense.subCategory.trim() !== ""
      )
      .forEach((expense) => {
        if (!categorySubMap.has(expense.category)) {
          categorySubMap.set(expense.category, new Map());
        }

        const subMap = categorySubMap.get(expense.category)!;
        const existing = subMap.get(expense.subCategory) || { amount: 0, count: 0 };
        subMap.set(expense.subCategory, {
          amount: existing.amount + expense.amount,
          count: existing.count + 1,
        });
      });

    // Convert to array format for charts
    const result: { category: string; subCategories: { subCategory: string; amount: number; count: number; fill: string }[] }[] = [];

    Array.from(categorySubMap.entries()).forEach(([category, subMap], categoryIndex) => {
      const subCategories = Array.from(subMap.entries())
        .map(([subCategory, data], subIndex) => ({
          subCategory,
          amount: data.amount,
          count: data.count,
          fill: COLORS[(categoryIndex * 3 + subIndex) % COLORS.length],
        }))
        .sort((a, b) => b.amount - a.amount);

      if (subCategories.length > 0) {
        result.push({ category, subCategories });
      }
    });

    return result.sort((a, b) => {
      const totalA = a.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
      const totalB = b.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
      return totalB - totalA;
    });
  }, [expenses]);

  // Daily spending trend (last 30 days)
  const dailyTrend = useMemo(() => {
    const dailyMap = new Map<string, number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    expenses
      .filter(
        (expense) =>
          expense.type === "Expense" &&
          new Date(expense.date) >= thirtyDaysAgo &&
          expense.amount > 0 &&
          expense.description &&
          expense.description.trim() !== "" &&
          expense.description !== "No description",
      )
      .forEach((expense) => {
        const date = expense.date;
        const existing = dailyMap.get(date) || 0;
        dailyMap.set(date, existing + expense.amount);
      });

    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.category}</p>
          <p>Amount: {formatCurrency(data.amount)}</p>
          <p>Transactions: {data.count}</p>
          <p>
            Percentage:{" "}
            {(
              (data.amount /
                expenseCategoryData.reduce((sum, cat) => sum + cat.amount, 0)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  if (expenses.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-slate-500">No data available for charts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Expenses Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses Tracking</CardTitle>
          <CardDescription>
            Track your spending patterns over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Categories Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>
            Breakdown of your spending categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) =>
                  `${category} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="amount"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sub-Category Breakdown by Category */}
      {subCategoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sub-Category Breakdown by Category</CardTitle>
            <CardDescription>
              Detailed breakdown of spending within each category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subCategoryData.slice(0, 6).map((categoryData) => {
                const totalCategoryAmount = categoryData.subCategories.reduce(
                  (sum, sub) => sum + sub.amount,
                  0
                );

                return (
                  <div key={categoryData.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800">
                        {categoryData.category}
                      </h4>
                      <span className="text-sm text-slate-600 font-medium">
                        {formatCurrency(totalCategoryAmount)}
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={categoryData.subCategories}
                        layout="horizontal"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          tickFormatter={formatCurrency}
                          domain={[0, 'dataMax']}
                        />
                        <YAxis
                          type="category"
                          dataKey="subCategory"
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            "Amount"
                          ]}
                          labelFormatter={(label) => `${label}`}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                          }}
                        />
                        <Bar
                          dataKey="amount"
                          fill={(entry: any) => entry.fill}
                          radius={[0, 4, 4, 0]}
                        >
                          {categoryData.subCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap gap-2">
                      {categoryData.subCategories.map((sub, index) => {
                        const percentage = (sub.amount / totalCategoryAmount) * 100;
                        return (
                          <div
                            key={sub.subCategory}
                            className="flex items-center space-x-2 text-xs"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sub.fill }}
                            />
                            <span className="text-slate-600">
                              {sub.subCategory}: {formatCurrency(sub.amount)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {subCategoryData.length > 6 && (
                <div className="text-center text-sm text-slate-500 pt-4 border-t">
                  Showing top 6 categories. {subCategoryData.length - 6} more categories available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Spending Trend */}
      {dailyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending Trend (Last 30 Days)</CardTitle>
            <CardDescription>Your daily expense patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Spent",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {expenseCategoryData[0]?.category || "N/A"}
            </div>
            <p className="text-sm text-slate-600">
              {expenseCategoryData[0]
                ? formatCurrency(expenseCategoryData[0].amount)
                : "$0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(
                expenses.length > 0
                  ? expenses.reduce((sum, exp) => sum + exp.amount, 0) /
                      expenses.length
                  : 0,
              )}
            </div>
            <p className="text-sm text-slate-600">
              Across {expenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {expenseCategoryData.length}
            </div>
            <p className="text-sm text-slate-600">Unique spending categories</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
