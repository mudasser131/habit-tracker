'use client';

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { 
  Activity, 
  Droplet, 
  Moon, 
  Smartphone, 
  Calendar, 
  Check, 
  Award, 
  TrendingUp,
  Flame,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Habit {
  key: 'water' | 'sleep' | 'screen';
  name: string;
  unit: string;
  icon: JSX.Element;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

interface DataPoint {
  day: string;
  water: number;
  sleep: number;
  screen: number;
}

interface Goals {
  water: number;
  sleep: number;
  screen: number;
}

interface TodayLog {
  water: number;
  sleep: number;
  screen: number;
}

const HabitTracker: React.FC = () => {
  const habits: Habit[] = [
    { 
      key: 'water', 
      name: 'Water Intake', 
      unit: 'liters', 
      icon: <Droplet className="text-blue-500" />, 
      color: '#3B82F6', 
      gradientFrom: '#60A5FA',
      gradientTo: '#3B82F6'
    },
    { 
      key: 'sleep', 
      name: 'Sleep', 
      unit: 'hours', 
      icon: <Moon className="text-indigo-500" />, 
      color: '#6366F1', 
      gradientFrom: '#818CF8',
      gradientTo: '#6366F1'
    },
    { 
      key: 'screen', 
      name: 'Screen Time', 
      unit: 'hours', 
      icon: <Smartphone className="text-violet-500" />, 
      color: '#8B5CF6', 
      gradientFrom: '#A78BFA',
      gradientTo: '#8B5CF6'
    }
  ];

  const initialData: DataPoint[] = [
    { day: 'Mon', water: 2.5, sleep: 7.5, screen: 6.0 },
    { day: 'Tue', water: 3.0, sleep: 8.0, screen: 5.5 },
    { day: 'Wed', water: 2.8, sleep: 7.0, screen: 6.5 },
    { day: 'Thu', water: 3.2, sleep: 8.5, screen: 4.5 },
    { day: 'Fri', water: 2.0, sleep: 6.5, screen: 7.0 },
    { day: 'Sat', water: 3.5, sleep: 8.0, screen: 5.0 },
    { day: 'Sun', water: 2.7, sleep: 7.8, screen: 5.8 }
  ];

  const [data, setData] = useState<DataPoint[]>(initialData);
  const [goals, setGoals] = useState<Goals>({ water: 3, sleep: 8, screen: 5 });
  const [todayLog, setTodayLog] = useState<TodayLog>({ water: 0, sleep: 0, screen: 0 });
  const [streak, setStreak] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'track' | 'analytics' | 'achievements'>('track');
  const [isClient, setIsClient] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoals, setTempGoals] = useState<Goals>({ water: 3, sleep: 8, screen: 5 });
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const currentStreak = data.reduce((count, d) => {
      return (d.water >= goals.water && d.sleep >= goals.sleep && d.screen <= goals.screen)
        ? count + 1
        : count;
    }, 0);
    setStreak(currentStreak);
  }, [data, goals, isClient]);

  // Reminder System
  useEffect(() => {
    if (!isClient) return;
    const checkReminder = () => {
      const now = new Date();
      const today = now.toLocaleDateString('en-US');
      const hours = now.getHours();
      // Check at 10 PM (22:00) if no check-in today
      if (hours >= 22 && lastCheckInDate !== today) {
        setShowReminder(true);
      }
    };
    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isClient, lastCheckInDate]);

  const handleCheckIn = useCallback(() => {
    if (!isClient) return;
    const today = new Date().toLocaleDateString('en-US');
    const newEntry: DataPoint = {
      day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
      water: todayLog.water,
      sleep: todayLog.sleep,
      screen: todayLog.screen,
    };
    setData(prev => [...prev.slice(1), newEntry]);
    setTodayLog({ water: 0, sleep: 0, screen: 0 });
    setLastCheckInDate(today);
    setShowReminder(false);
  }, [todayLog, isClient]);

  const calculateProgress = useCallback((habit: Habit): number => {
    const current = todayLog[habit.key] || 0;
    const target = goals[habit.key] || 1;
    if (habit.key === 'screen') {
      return Math.min(100, (target / Math.max(current, 0.1)) * 100);
    }
    return Math.min(100, (current / target) * 100);
  }, [todayLog, goals]);

  const achievementStatus = habits.map(habit => {
    const lastEntry = data[data.length - 1] || { water: 0, sleep: 0, screen: 0 };
    const achievedToday = habit.key === 'screen'
      ? lastEntry[habit.key] <= goals[habit.key]
      : lastEntry[habit.key] >= goals[habit.key];
    return { ...habit, achieved: achievedToday };
  });

  const weeklyAverages = habits.reduce((acc, habit) => {
    const sum = data.reduce((total, day) => total + (day[habit.key] || 0), 0);
    acc[habit.key] = (sum / Math.max(data.length, 1)).toFixed(1);
    return acc;
  }, {} as Record<Habit['key'], string>);

  const performanceTrends = habits.reduce((acc, habit) => {
    const avg = parseFloat(weeklyAverages[habit.key]);
    const target = goals[habit.key];
    const percentage = habit.key === 'screen'
      ? ((target / Math.max(avg, 0.1)) * 100).toFixed(1)
      : ((avg / target) * 100).toFixed(1);
    acc[habit.key] = percentage;
    return acc;
  }, {} as Record<Habit['key'], string>);

  const handleGoalSave = () => {
    setGoals(tempGoals);
    setShowGoalModal(false);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-slate-800 flex flex-col font-sans">
      <style jsx global>{`
        :root {
          --blue: #3B82F6;
          --blue-light: #60A5FA;
          --indigo: #6366F1;
          --indigo-light: #818CF8;
          --violet: #8B5CF6;
          --violet-light: #A78BFA;
          --emerald: #10B981;
          --emerald-light: #34D399;
          --black: #0F172A;
          --white: #FFFFFF;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--blue);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--blue);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                <Sparkles size={20} className="mr-2 text-blue-500" />
                Don’t Forget to Check In!
              </h3>
              <p className="text-slate-600 mb-6">
                You haven’t logged your habits for today. Here’s your progress:
              </p>
              <div className="space-y-4 mb-6">
                {habits.map(habit => {
                  const progress = calculateProgress(habit);
                  const isBelowGoal = habit.key === 'screen'
                    ? todayLog[habit.key] > goals[habit.key]
                    : todayLog[habit.key] < goals[habit.key];
                  return (
                    <div key={habit.key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {habit.icon}
                        <span className="ml-2 text-sm font-medium text-slate-700">{habit.name}</span>
                      </div>
                      <span className={`text-sm font-medium ${isBelowGoal ? 'text-red-500' : 'text-emerald-500'}`}>
                        {todayLog[habit.key].toFixed(1)} / {goals[habit.key]} {habit.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab('track');
                  setShowReminder(false);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center"
              >
                <Check size={20} className="mr-2" />
                Log Now
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Setting Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                <Settings size={20} className="mr-2 text-blue-500" />
                Set Daily Goals
              </h3>
              <div className="space-y-6">
                {habits.map(habit => (
                  <div key={habit.key} className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-slate-700">
                      {habit.icon}
                      <span className="ml-2">{habit.name} ({habit.unit})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={habit.key === 'water' ? 10 : 24}
                      step={0.5}
                      value={tempGoals[habit.key]}
                      onChange={(e) => setTempGoals({ ...tempGoals, [habit.key]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                    />
                  </div>
                ))}
              </div>
              <div className="flex space-x-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 bg-slate-200 text-slate-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-slate-300 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoalSave}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Save Goals
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg px-6 py-4 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md bg-white/90"
      >
        <div className="flex items-center space-x-2">
          <Activity className="text-blue-500" size={26} />
          <h1 className="text-xl font-bold text-slate-800">Habit Flow</h1>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-1"
        >
          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold shadow-sm flex items-center">
            <Flame className="text-blue-500 mr-2" size={16} />
            {streak} Day Streak
          </span>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <header className="px-6 py-16 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/30"></div>
          <div className="absolute bottom-10 right-10 w-36 h-36 rounded-full bg-white/30"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-white/30 transform -translate-x-1/2 -translate-y-1/2"></div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Track Your Journey</h2>
          <p className="text-white/90 max-w-md mx-auto text-lg">Cultivate habits with style and insight</p>
        </motion.div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white px-6 py-3 shadow-sm flex justify-center sticky top-[68px] z-10 backdrop-blur-md bg-white/90">
        <div className="flex space-x-4 border-b border-slate-200 w-full max-w-lg">
          {[
            { id: 'track', icon: <Check size={16} className="mr-2" />, label: 'Track' },
            { id: 'analytics', icon: <BarChart3 size={16} className="mr-2" />, label: 'Analytics' },
            { id: 'achievements', icon: <Award size={16} className="mr-2" />, label: 'Achievements' }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'track' | 'analytics' | 'achievements')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 font-semibold text-sm flex items-center transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-8 md:grid-cols-2"
            >
              {/* Today's Check-in */}
              <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center text-slate-800">
                    <Calendar size={20} className="mr-2 text-blue-500" />
                    Today's Check-In
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setTempGoals(goals);
                      setShowGoalModal(true);
                    }}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Settings size={16} className="mr-1" />
                    Set Goals
                  </motion.button>
                </div>
                
                <div className="space-y-8">
                  {habits.map((habit) => {
                    const progress = calculateProgress(habit);
                    return (
                      <motion.div 
                        key={habit.key} 
                        className="space-y-3"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center">
                          <label className="flex items-center text-sm font-medium text-slate-700">
                            {habit.icon}
                            <span className="ml-2">{habit.name} ({habit.unit})</span>
                          </label>
                          <span className="text-sm font-medium bg-blue-50 px-3 py-1 rounded-full text-blue-700">
                            {todayLog[habit.key].toFixed(1)} / {goals[habit.key]} {habit.unit}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max={habit.key === 'water' ? 6 : 12}
                            step={0.5}
                            value={todayLog[habit.key]}
                            onChange={(e) => setTodayLog({ ...todayLog, [habit.key]: parseFloat(e.target.value) })}
                            className="w-full h-3 rounded-full appearance-none cursor-pointer bg-slate-200 transition-all duration-200"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${habit.color} ${progress}%, #e2e8f0 ${progress}%)`
                            }}
                          />
                          <span className="text-sm font-medium w-12 text-right text-slate-600">{todayLog[habit.key].toFixed(1)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheckIn}
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center"
                  >
                    <Check size={20} className="mr-2" />
                    Save Progress
                  </motion.button>
                </div>
              </section>

              {/* Stats Summary Cards */}
              <div className="space-y-8">
                <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center text-slate-800">
                    <Target size={20} className="mr-2 text-blue-500" />
                    Weekly Overview
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {habits.map(habit => (
                      <motion.div 
                        key={habit.key} 
                        className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-blue-50 shadow-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex justify-center mb-3">{habit.icon}</div>
                        <div className="text-3xl font-bold text-slate-800">{weeklyAverages[habit.key]}</div>
                        <div className="text-sm text-slate-500 mt-1">Avg {habit.unit}</div>
                      </motion.div>
                    ))}
                  </div>
                </section>
                
                <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center text-slate-800">
                    <TrendingUp size={20} className="mr-2 text-blue-500" />
                    Streak Stats
                  </h3>
                  
                  <motion.div 
                    className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="text-6xl font-extrabold text-white">{streak}</div>
                      <div className="text-base text-blue-100 font-semibold mt-2">Day Streak</div>
                      <div className="text-sm text-blue-200 mt-3 flex items-center justify-center">
                        <Flame size={16} className="mr-1" /> You're unstoppable!
                      </div>
                    </div>
                  </motion.div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-10">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                  <BarChart3 size={20} className="mr-2 text-blue-500" />
                  Weekly Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#334155' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#334155' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#fff' }} />
                      <Legend />
                      <Area type="monotone" dataKey="water" name="Water (L)" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                      <Area type="monotone" dataKey="sleep" name="Sleep (hrs)" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="screen" name="Screen (hrs)" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
              
              <div className="grid gap-12 grid-cols-1 lg:grid-cols-3">
                {habits.map(habit => (
                  <motion.section 
                    key={habit.key} 
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-10 min-w-0"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg flex items-center text-slate-800">
                        {habit.icon}
                        <span className="ml-2">{habit.name}</span>
                      </h3>
                      <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                        Goal: {goals[habit.key]} {habit.unit}
                      </span>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#334155' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#334155' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#fff' }} />
                          <Line 
                            type="monotone" 
                            dataKey={habit.key} 
                            stroke={habit.color} 
                            strokeWidth={2}
                            dot={{ stroke: habit.color, strokeWidth: 2, r: 4, fill: 'white' }}
                            activeDot={{ r: 6, stroke: habit.color, strokeWidth: 2, fill: habit.color }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.section>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                  <Target size={20} className="mr-2 text-blue-500" />
                  Daily Goals Status
                </h3>
                
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                  {achievementStatus.map(habit => (
                    <motion.div 
                      key={habit.key} 
                      className={`p-6 rounded-xl border transition-all duration-200 ${
                        habit.achieved 
                          ? 'border-emerald-200 bg-emerald-50/50' 
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {habit.icon}
                          <span className="ml-2 font-semibold text-slate-800">{habit.name}</span>
                        </div>
                        {habit.achieved ? (
                          <span className="flex items-center text-emerald-600 text-sm font-medium">
                            <Check size={16} className="mr-1" /> Achieved
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm font-medium">In progress</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-500 mb-3">
                        Goal: {habit.key === 'screen' ? 'Max' : 'Min'} {goals[habit.key]} {habit.unit}
                      </div>
                      
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${habit.achieved ? 'bg-emerald-500' : 'bg-gradient-to-r from-' + habit.gradientFrom + ' to-' + habit.gradientTo}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress(habit)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
              
              <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                  <Sparkles size={20} className="mr-2 text-blue-500" />
                  Streak Milestones
                </h3>
                
                <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                  {[3, 7, 14, 30].map(milestone => {
                    const achieved = streak >= milestone;
                    return (
                      <motion.div 
                        key={milestone}
                        className={`p-6 rounded-xl text-center transition-all duration-200 ${
                          achieved 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-slate-50 text-slate-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className={`text-4xl font-extrabold mb-2 ${achieved ? 'text-white' : 'text-slate-800'}`}>
                          {milestone}
                        </div>
                        <div className={`text-sm ${achieved ? 'text-white/90' : 'text-slate-500'}`}>
                          Day Streak
                        </div>
                        <div className="mt-3">
                          {achieved ? (
                            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                              <Check size={12} className="mr-1" /> Achieved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">
                              {milestone - streak} days left
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-50 p-8">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                  <TrendingUp size={20} className="mr-2 text-blue-500" />
                  Performance Trends
                </h3>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                  {habits.map(habit => (
                    <motion.div 
                      key={habit.key}
                      className="p-6 rounded-xl bg-gradient-to-br from-white to-blue-50 shadow-md text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex justify-center mb-3">{habit.icon}</div>
                      <div className="text-2xl font-bold text-slate-800">{performanceTrends[habit.key]}%</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {habit.name} vs Goal
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-blue-50 text-slate-600 py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-blue-200/30"></div>
          <div className="absolute bottom-10 right-10 w-36 h-36 rounded-full bg-indigo-200/30"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Brand Section */}
            <motion.div 
              className="flex flex-col items-center md:items-start"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center mb-4">
                <Activity className="text-blue-500 mr-2" size={24} />
                <span className="text-2xl font-bold text-slate-800">Habit Flow</span>
              </div>
              <p className="text-sm text-slate-500 text-center md:text-left">
                Empowering you to build lasting habits with style and ease.
              </p>
            </motion.div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Built By Khaja Shija Uddin | © {new Date().getFullYear()} Habit Flow
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HabitTracker;