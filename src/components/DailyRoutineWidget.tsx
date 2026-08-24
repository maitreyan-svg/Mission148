import React from 'react';
import { Utensils, Droplets, CheckCircle2, Circle, Plus, Minus } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';

interface DailyRoutineWidgetProps {
  dayNumber: number;
}

export const DailyRoutineWidget: React.FC<DailyRoutineWidgetProps> = ({ dayNumber }) => {
  const { user } = useAuth();
  const { dayLogs, updateMealRoutine, updateWaterIntake } = useMission();

  const currentLog = dayLogs[dayNumber] || {
    dayNumber,
    date: `2026-08-${String(23 + dayNumber).padStart(2, '0')}`,
    targetHours: user?.targets?.dailyStudyHoursGoal || 10,
    actualHours: 0,
    status: 'not_started',
    meals: { breakfast: false, lunch: false, dinner: false },
    waterMl: 0,
    subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
  };

  const meals = currentLog.meals || { breakfast: false, lunch: false, dinner: false };
  const waterMl = currentLog.waterMl || 0;
  const targetWater = user?.targets?.dailyWaterGoalMl || 3000;
  const waterPercent = Math.min(100, Math.round((waterMl / targetWater) * 100));

  const mealItems: { key: 'breakfast' | 'lunch' | 'dinner'; label: string; time: string }[] = [
    { key: 'breakfast', label: 'Breakfast', time: 'Morning Energy' },
    { key: 'lunch', label: 'Lunch', time: 'Midday Refuel' },
    { key: 'dinner', label: 'Dinner', time: 'Evening Nutrition' },
  ];

  return (
    <div id="daily-routine-widget" className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-xl space-y-5">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <span className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
          <Utensils className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Daily Routine & Hydration</h3>
          <p className="text-xs text-slate-400 font-mono">Day {dayNumber} Vital Log</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meals Section */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Meals Tracker
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {[meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).length} / 3 Logged
            </span>
          </div>

          <div className="space-y-2">
            {mealItems.map((meal) => {
              const isChecked = meals[meal.key];
              return (
                <button
                  key={meal.key}
                  id={`meal-btn-${meal.key}`}
                  onClick={() => updateMealRoutine(dayNumber, meal.key, !isChecked)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                    <span className="font-semibold text-white">{meal.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{meal.time}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Water Section */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Water Hydration</span>
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {(waterMl / 1000).toFixed(2)} / {(targetWater / 1000).toFixed(1)}L
              </span>
            </div>

            {/* Water Progress Indicator */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-3">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Buttons (+250ml / -250ml) */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-water-minus"
                onClick={() => updateWaterIntake(dayNumber, -250)}
                disabled={waterMl <= 0}
                className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 text-rose-400" />
                <span>− 250 ml</span>
              </button>
              <button
                id="btn-water-plus"
                onClick={() => updateWaterIntake(dayNumber, 250)}
                className="py-2.5 px-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ 250 ml</span>
              </button>
            </div>

            <p className="text-[10px] font-mono text-slate-500 text-center">
              {waterPercent >= 100 ? '✓ Daily hydration goal reached!' : `${Math.max(0, targetWater - waterMl)} ml remaining`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
