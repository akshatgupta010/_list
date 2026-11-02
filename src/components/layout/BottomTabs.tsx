import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Trophy, Sparkles, BarChart2 } from 'lucide-react';

export function BottomTabs() {
  const tabs = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/list', label: 'List', icon: ListTodo },
    { to: '/completed', label: 'Done', icon: Trophy },
    { to: '/explore', label: 'Inspire', icon: Sparkles },
    { to: '/stats', label: 'Stats', icon: BarChart2 },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-line/80 backdrop-blur-lg px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors duration-150 min-w-[56px] ${
                  isActive
                    ? 'text-ink font-semibold'
                    : 'text-muted hover:text-ink'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono tracking-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
