import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Flame, Trophy, CheckCircle, Clock, Target } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  selectProgress,
  selectStreaks,
  selectBadges,
  selectCategoryProgress,
} from '@/lib/selectors';

export function StatsPage() {
  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);

  const progress = selectProgress(items);
  const streaks = selectStreaks(items);
  const badges = selectBadges(items);
  const catProgress = selectCategoryProgress(items);

  // Category chart data
  const categoryData = useMemo(() => {
    return categories
      .map((cat) => {
        const stats = catProgress[cat.id] || { total: 0, completed: 0, percentage: 0 };
        return {
          name: cat.name,
          Total: stats.total,
          Achieved: stats.completed,
        };
      })
      .filter((d) => d.Total > 0);
  }, [categories, catProgress]);

  // 12-Month Completion Velocity data
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, number> = {};
    const now = new Date();

    // Last 6 months labels
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[key] = 0;
    }

    items.forEach((item) => {
      if (item.status === 'completed' && item.completedAt) {
        const key = item.completedAt.slice(0, 7);
        if (monthsMap[key] !== undefined) {
          monthsMap[key] += 1;
        }
      }
    });

    return Object.entries(monthsMap).map(([key, count]) => {
      const [year, month] = key.split('-');
      const d = new Date(parseInt(year!, 10), parseInt(month!, 10) - 1, 1);
      return {
        month: d.toLocaleString(undefined, { month: 'short' }),
        completed: count,
      };
    });
  }, [items]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
          Life Analytics & Streaks
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mt-0.5">
          Metrics, velocity & milestone achievements
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel corner-brackets rounded-card border border-line p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted uppercase">
            <Target className="w-3.5 h-3.5" />
            <span>Total Goals</span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-ink">{progress.total}</p>
        </div>

        <div className="glass-panel corner-brackets rounded-card border border-line p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-success uppercase">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Achieved</span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-success">
            {progress.completed}
          </p>
        </div>

        <div className="glass-panel corner-brackets rounded-card border border-line p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-warning uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-ink">{progress.pending}</p>
        </div>

        <div className="glass-panel corner-brackets rounded-card border border-line p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-accent uppercase">
            <Flame className="w-3.5 h-3.5" />
            <span>Month Streak</span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-ink">
            {streaks.current} <span className="text-sm font-mono text-muted">months</span>
          </p>
        </div>
      </div>

      {/* Streaks Banner */}
      <div className="glass-panel corner-brackets rounded-card border border-line p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-chrome-gradient border border-line flex items-center justify-center text-xl shrink-0 shadow-sm">
            🔥
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-ink">
              {streaks.current > 0
                ? `${streaks.current}-Month Active Momentum!`
                : 'Start Your Achievement Flow'}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Achieve at least one dream each calendar month to sustain your streak. Personal best:{' '}
              <strong>{streaks.longest} months</strong>.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono uppercase tracking-wider text-muted">
            Completion Rate
          </span>
          <p className="text-2xl font-display font-bold text-ink">{progress.percentage}%</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Completion Bar Chart */}
        <div className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
          <h3 className="font-display font-semibold text-base text-ink">
            Goals by Category
          </h3>

          {categoryData.length > 0 ? (
            <div className="h-64 w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#8A8B91" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8A8B91" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--line)',
                      color: 'var(--text)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="Total" fill="#D1D0D1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Achieved" fill="#1F6B4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-muted">
              No categories data available yet.
            </div>
          )}
        </div>

        {/* Monthly Velocity Line Chart */}
        <div className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
          <h3 className="font-display font-semibold text-base text-ink">
            Achievements Velocity (Last 6 Months)
          </h3>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#8A8B91" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8B91" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--line)',
                    color: 'var(--text)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#2F5D8A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2F5D8A' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Badges Shelf */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-ink" />
          <h2 className="text-lg font-display font-semibold text-ink tracking-tight">
            Milestone Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`glass-panel corner-brackets rounded-card border p-4 space-y-2.5 transition-all ${
                badge.unlocked
                  ? 'border-line shadow-sm'
                  : 'border-line/40 opacity-40 grayscale'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl select-none">{badge.icon}</span>
                {badge.unlocked ? (
                  <span className="text-[10px] font-mono text-success uppercase font-semibold">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted uppercase">Locked</span>
                )}
              </div>

              <div>
                <h4 className="font-display font-semibold text-sm text-ink">{badge.name}</h4>
                <p className="text-xs text-muted mt-0.5 leading-snug">{badge.description}</p>
              </div>

              {badge.progressText && (
                <div className="text-[10px] font-mono text-muted/80 pt-1 border-t border-line/40">
                  Progress: {badge.progressText}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Screen Reader Accessible Data Table (PRD Section 14.1) */}
      <div className="sr-only">
        <table>
          <caption>Summary of Goals by Category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Total Goals</th>
              <th scope="col">Completed Goals</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.Total}</td>
                <td>{row.Achieved}</td>
                <td>
                  {row.Total > 0 ? Math.round((row.Achieved / row.Total) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
