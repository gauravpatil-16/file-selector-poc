import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import BottomTabBar from "@/components/molecules/BottomTabBar";
import ApperIcon from "@/components/ApperIcon";
import { useAuth } from "@/layouts/Root";
import React from "react";

const Layout = () => {
  const { user, isAuthenticated } = useSelector(state => state.user)
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar with Logout */}
      {isAuthenticated && (
        <div className="sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-gray-200 z-sticky">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user?.FirstName || user?.Name || 'User'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="LogOut" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-16 md:pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomTabBar />
    </div>
  )
}

export default Layout
