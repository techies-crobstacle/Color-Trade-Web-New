'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import TransactionTable from '@/Components/AdminPanelComponents/TransactionScreen';
import { useEffect, useState } from 'react';
import { useLayout } from "@/contexts/LayoutContext";
import {
  User,
  Users,
  CreditCard,
  Gamepad2,
  HelpCircle,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import UsersTable from '@/Components/AdminPanelComponents/UsersScreen';
import ProfileScreen from '@/Components/AdminPanelComponents/ProfileScreen';
import InquiriesScreen from '@/Components/AdminPanelComponents/InquiriesScreen';
import GameHistory from '@/Components/AdminPanelComponents/GameHistory';
import GameStats from '@/Components/AdminPanelComponents/GameStats';
import { useRouter, useSearchParams } from 'next/navigation';

const navItems = [
  { label: 'Profile', icon: <User size={18} /> },
  { label: 'Users', icon: <Users size={18} /> },
  { label: 'Transactions', icon: <CreditCard size={18} /> },
  { label: 'History', icon: <Gamepad2 size={18} /> },
  { label: 'Inquiries', icon: <HelpCircle size={18} /> },
  { label: 'Game Stats', icon: <HelpCircle size={18} /> }
];

const SidebarItem = ({
  label,
  icon,
  active,
  onClick,
  collapsed,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition text-sm font-medium ${
      active ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
    }`}
    onClick={onClick}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </button>
);

export default function DashboardPage() {
  useRequireAuth();

  const { setShowHeaderFooter } = useLayout();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Active section comes from URL
  const activeSection = searchParams.get('section') || 'Profile';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const renderContent = () => {
    switch (activeSection) {
      case 'Profile':
        return <ProfileScreen />;
      case 'Users':
        return <UsersTable />;
      case 'Transactions':
        return <TransactionTable />;
      case 'Inquiries':
        return <InquiriesScreen />;
      case 'History':
        return <GameHistory />;
      case 'Game Stats':
        return <GameStats />;
      default:
        return <div>Select a section</div>;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-md p-4 transition-all duration-300 space-y-4`}
      >
        <div className="flex justify-between items-center mb-6">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <LayoutDashboard size={20} /> Dashboard
            </h2>
          )}
        </div>

        {navItems.map((item) => (
          <SidebarItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={activeSection === item.label}
            onClick={() => router.push(`/dashboard?section=${item.label}`)}
            collapsed={sidebarCollapsed}
          />
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex gap-5">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-500 hover:text-blue-600 mx-auto"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-xl font-semibold">{activeSection}</h1>
          </div>
          <div>
            <button
              onClick={logout}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 text-sm"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Section Content */}
        <div className="flex-1 p-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}