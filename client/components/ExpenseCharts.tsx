import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseRecord, CategoryChartData, MonthlyChartData } from "@shared/expense-types";

interface ExpenseChartsProps {
  expenses: ExpenseRecord[];
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Category breakdown for expenses
  const expenseCategoryData: CategoryChartData[] = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    expenses
      .filter(expense => expense.type === 'Expense')
      .forEach(expense => {
        const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
        categoryMap.set(expense.category, {
          amount: existing.amount + expense.amount,
          count: existing.count + 1
        });
      });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Income vs Expenses by month
  const monthlyData: MonthlyChartData[] = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();
    
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      const existing = monthMap.get(month) || { income: 0, expenses: 0 };
      
      if (expense.type === 'Income') {
        existing.income += expense.amount;
      } else {
        existing.expenses += expense.amount;
      }
      
      monthMap.set(month, existing);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [expenses]);

  // Top spending categories for pie chart
  const topCategories = expenseCategoryData.slice(0, 8);
  const otherCategories = expenseCategoryData.slice(8);
  const pieData = [
    ...topCategories,
    ...(otherCategories.length > 0 ? [{
      category: 'Other',
      amount: otherCategories.reduce((sum, cat) => sum + cat.amount, 0),
      count: otherCategories.reduce((sum, cat) => sum + cat.count, 0)
    }] : [])
  ];

  // Daily spending trend (last 30 days)
  const dailyTrend = useMemo(() => {
    const dailyMap = new Map<string, number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    expenses
      .filter(expense => 
        expense.type === 'Expense' && 
        new Date(expense.date) >= thirtyDaysAgo
      )
      .forEach(expense => {
        const date = expense.date;
        const existing = dailyMap.get(date) || 0;
        dailyMap.set(date, existing + expense.amount);
      });

    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
          <p>Percentage: {((data.amount / expenseCategoryData.reduce((sum, cat) => sum + cat.amount, 0)) * 100).toFixed(1)}%</p>
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
      {/* Monthly Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income vs Expenses</CardTitle>
          <CardDescription>Track your financial trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of your spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Spending Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your highest expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={expenseCategoryData.slice(0, 6)} 
                layout="horizontal"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  formatter={(value: number) => [formatCurrency(value), 'Spent']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444' }}
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
              {expenseCategoryData[0]?.category || 'N/A'}
            </div>
            <p className="text-sm text-slate-600">
              {expenseCategoryData[0] ? formatCurrency(expenseCategoryData[0].amount) : '$0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(
                expenses.length > 0 
                  ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length
                  : 0
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
            <p className="text-sm text-slate-600">
              Unique spending categories
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
