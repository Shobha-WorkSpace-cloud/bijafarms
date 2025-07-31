import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Calculator, 
  Clipboard, 
  IndianRupee, 
  Heart, 
  Users, 
  TrendingUp,
  ChevronRight,
  Beef,
  Stethoscope
} from "lucide-react";

export default function MainPage() {
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
            <p className="text-green-600 text-lg">Integrated farming solutions for modern agriculture</p>
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
                    <CardTitle className="text-2xl text-slate-800">Bija Expense Tracker</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Track farm finances and manage budgets
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Calculator className="h-4 w-4" />
                  <span className="text-sm">Financial calculations</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Expense analytics</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Features:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Track income and expenses</li>
                  <li>• Categorize farm-related costs</li>
                  <li>• Generate financial reports</li>
                  <li>• Export data to Excel/CSV</li>
                </ul>
              </div>

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
                    <CardTitle className="text-2xl text-slate-800">Bija Work Tracker</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Manage goat & sheep health tasks
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Stethoscope className="h-4 w-4" />
                  <span className="text-sm">Health monitoring</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Beef className="h-4 w-4" />
                  <span className="text-sm">Livestock care</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Features:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Schedule health checkups</li>
                  <li>• Track completed tasks</li>
                  <li>• Monitor animal wellness</li>
                  <li>• Set vaccination reminders</li>
                </ul>
              </div>

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

        {/* Quick Stats Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-green-200 p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Farm Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <IndianRupee className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-800 mb-1">Financial Management</h3>
              <p className="text-blue-600 text-sm">Track expenses and revenue</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 mb-1">Animal Health</h3>
              <p className="text-green-600 text-sm">Monitor livestock wellness</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-800 mb-1">Farm Management</h3>
              <p className="text-purple-600 text-sm">Organize daily operations</p>
            </div>
          </div>
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
          <p className="text-green-200">© 2024 Bija Farms. Integrated farming solutions for sustainable agriculture.</p>
        </div>
      </footer>
    </div>
  );
}
