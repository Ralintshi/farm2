import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import './FarmPlanner.css';

// Constants
const CROPS = [
  {
    id: 1,
    name: 'Maize',
    soil: 'Loamy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [300, 800],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 2,
    name: 'Sorghum',
    soil: 'Sandy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [200, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Maize',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 3,
    name: 'Wheat',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Winter',
    plantingTime: 'April-May',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 4,
    name: 'Beans',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Cereals',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 5,
    name: 'Peas',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Cereals',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 6,
    name: 'Potatoes',
    soil: 'Sandy-Loamy',
    soilPh: [4.8, 7.0],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'High'
  },
  {
    id: 7,
    name: 'Cabbage',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'Root Crops',
    yield: 'High',
    demand: 'High'
  },
  {
    id: 8,
    name: 'Tomatoes',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'High'
  },
  {
    id: 9,
    name: 'Spinach',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'Root Crops',
    yield: 'High',
    demand: 'High'
  },
  {
    id: 10,
    name: 'Barley',
    soil: 'Clay',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Winter',
    plantingTime: 'April-May',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Low'
  },
  {
    id: 11,
    name: 'Carrots',
    soil: 'Sandy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 12,
    name: 'Green Beans',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Cereals',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 13,
    name: 'Pumpkins',
    soil: 'Sandy-Loamy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 14,
    name: 'Sunflower',
    soil: 'Sandy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Cereals',
    yield: 'Moderate',
    demand: 'Low'
  },
  {
    id: 15,
    name: 'Oats',
    soil: 'Clay',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Winter',
    plantingTime: 'April-May',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Low'
  },
  {
    id: 16,
    name: 'Lucerne (Alfalfa)',
    soil: 'Loamy',
    soilPh: [6.0, 8.0],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'Cereals',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 17,
    name: 'Mushrooms',
    soil: 'Organic Compost',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [0, 0],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'None',
    yield: 'High',
    demand: 'High'
  },
  {
    id: 18,
    name: 'Asparagus',
    soil: 'Sandy',
    soilPh: [6.0, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 19,
    name: 'Green Peppers',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'High'
  },
  {
    id: 20,
    name: 'Butternut Squash',
    soil: 'Sandy-Loamy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 21,
    name: 'Onions',
    soil: 'Sandy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 22,
    name: 'Beets',
    soil: 'Sandy-Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 23,
    name: 'Apples',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 24,
    name: 'Peaches',
    soil: 'Sandy-Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 25,
    name: 'Cherries',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 26,
    name: 'Lettuce',
    soil: 'Silty',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'Root Crops',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 27,
    name: 'Kale',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'Root Crops',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 28,
    name: 'Swiss Chard',
    soil: 'Silty',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'All Seasons',
    plantingTime: 'Year-Round',
    rotation: 'Root Crops',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 29,
    name: 'Radishes',
    soil: 'Sandy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 30,
    name: 'Turnips',
    soil: 'Sandy-Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 31,
    name: 'Cauliflower',
    soil: 'Clay',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 32,
    name: 'Broccoli',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 33,
    name: 'Eggplant',
    soil: 'Sandy-Loamy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 34,
    name: 'Cucumbers',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 35,
    name: 'Zucchini',
    soil: 'Sandy-Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'High',
    demand: 'Stable'
  },
  {
    id: 36,
    name: 'Garlic',
    soil: 'Sandy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 37,
    name: 'Leeks',
    soil: 'Silty',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Leafy Greens',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 38,
    name: 'Sweet Potatoes',
    soil: 'Sandy',
    soilPh: [4.8, 7.0],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 39,
    name: 'Groundnuts',
    soil: 'Sandy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Cereals',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 40,
    name: 'Cowpeas',
    soil: 'Sandy-Loamy',
    soilPh: [5.0, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Cereals',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 41,
    name: 'Okra',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 42,
    name: 'Watermelon',
    soil: 'Sandy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 43,
    name: 'Pears',
    soil: 'Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 44,
    name: 'Plums',
    soil: 'Sandy-Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 45,
    name: 'Apricots',
    soil: 'Sandy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 46,
    name: 'Grapes',
    soil: 'Sandy-Loamy',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'Stable'
  },
  {
    id: 47,
    name: 'Strawberries',
    soil: 'Loamy',
    soilPh: [5.0, 7.0],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'Legumes',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 48,
    name: 'Blueberries',
    soil: 'Sandy',
    soilPh: [4.0, 5.5],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 49,
    name: 'Raspberries',
    soil: 'Loamy',
    soilPh: [5.0, 7.0],
    climate: 'Temperate',
    rainfall: [400, 700],
    season: 'Summer',
    plantingTime: 'October-November',
    rotation: 'None',
    yield: 'Moderate',
    demand: 'High'
  },
  {
    id: 50,
    name: 'Fodder Beet',
    soil: 'Clay',
    soilPh: [5.5, 7.5],
    climate: 'Temperate',
    rainfall: [300, 600],
    season: 'Summer',
    plantingTime: 'October-December',
    rotation: 'Cereals',
    yield: 'High',
    demand: 'Stable'
  }
];
const RECURRING_INTERVALS = {
  daily: { label: 'daily', days: 1 },
  weekly: { label: 'weekly', days: 7 },
  monthly: { label: 'monthly', days: 30 }, // Approximation
};

const localizer = momentLocalizer(moment);

function FarmPlanner() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  // Task Scheduler State
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('farmTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [newTask, setNewTask] = useState({
    name: '',
    date: '',
    recurring: false,
    recurringInterval: 'weekly',
    alert: false,
  });

  const [taskSearch, setTaskSearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [errors, setErrors] = useState({});

  // Crop Selection State
  const [farmProfile, setFarmProfile] = useState({
    soilType: '',
    soilPh: '',
    climate: '',
    rainfall: '',
    landSize: '',
    irrigation: '',
    location: '',
    pastCrops: '',
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('farmTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Task Functions
  const validateTask = () => {
    const newErrors = {};
    if (!newTask.name.trim()) newErrors.name = t('nameRequired');
    if (!newTask.date) newErrors.date = t('dateRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateRecurringTasks = (baseTask) => {
    const tasks = [];
    let currentDate = new Date(baseTask.date);
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    while (currentDate <= endDate) {
      tasks.push({
        ...baseTask,
        id: baseTask.id + tasks.length,
        date: currentDate.toISOString().split('T')[0],
        start: new Date(currentDate),
        end: new Date(currentDate),
        title: baseTask.name,
      });

      const interval = RECURRING_INTERVALS[baseTask.recurringInterval];
      currentDate.setDate(currentDate.getDate() + interval.days);
    }

    return tasks;
  };

  const addTask = () => {
    if (!validateTask()) return;

    const task = {
      ...newTask,
      id: Date.now(),
      completed: false,
      start: new Date(newTask.date),
      end: new Date(newTask.date),
      title: newTask.name,
    };

    let tasksToAdd = [task];

    if (newTask.recurring) {
      tasksToAdd = generateRecurringTasks(task);
    }

    setTasks([...tasks, ...tasksToAdd]);

    if (newTask.alert) {
      const timeToTask = new Date(newTask.date).getTime() - Date.now();
      if (timeToTask > 0) {
        setTimeout(() => {
          alert(t('taskReminder', { name: newTask.name, date: newTask.date }));
        }, timeToTask);
      }
    }

    setNewTask({
      name: '',
      date: '',
      recurring: false,
      recurringInterval: 'weekly',
      alert: false,
    });
    setErrors({});
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Crop Functions
  const handleFarmProfileChange = (e) => {
    const { name, value } = e.target;
    setFarmProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const recommendations = useMemo(() => {
    return CROPS.filter(crop =>
      (!farmProfile.soilType || crop.soil === farmProfile.soilType) &&
      (!farmProfile.climate || crop.climate === farmProfile.climate) &&
      (!farmProfile.soilPh || (
        crop.soilPh[0] <= parseFloat(farmProfile.soilPh) && 
        parseFloat(farmProfile.soilPh) <= crop.soilPh[1]
      )) &&
      (!farmProfile.rainfall || (
        crop.rainfall[0] <= parseInt(farmProfile.rainfall) && 
        parseInt(farmProfile.rainfall) <= crop.rainfall[1]
      )) &&
      (!farmProfile.pastCrops || !farmProfile.pastCrops.includes(crop.name))
    );
  }, [farmProfile]);

  // Memoized filtered tasks and calendar events
  const filteredTasks = useMemo(() => 
    tasks.filter(task =>
      task.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.date.includes(taskSearch)
  ), [tasks, taskSearch]);

  const calendarEvents = useMemo(() => 
    filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.start,
      end: task.end,
      completed: task.completed,
    }))
  , [filteredTasks]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="farm-planner-container">
      <h2 className="farm-planner-title">{t('farmPlannerTitle')}</h2>
      
      <div className="tab-navigation">
        {['tasks', 'crops'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            aria-pressed={activeTab === tab}
          >
            {t(`${tab}Tab`)}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="task-scheduler">
          <div className="task-input-container">
            <input
              type="text"
              placeholder={t('taskSearchPlaceholder')}
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="task-search"
              aria-label={t('taskSearchPlaceholder')}
            />
            
            <div className="input-group">
              <input
                type="text"
                placeholder={t('taskNamePlaceholder')}
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className={`task-input ${errors.name ? 'error' : ''}`}
                aria-label={t('taskNamePlaceholder')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="input-group">
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className={`task-input ${errors.date ? 'error' : ''}`}
                aria-label={t('taskDateLabel')}
                aria-invalid={!!errors.date}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newTask.recurring}
                  onChange={(e) => setNewTask({ ...newTask, recurring: e.target.checked })}
                  className="checkbox"
                />
                {t('recurringLabel')}
              </label>

              {newTask.recurring && (
                <select
                  value={newTask.recurringInterval}
                  onChange={(e) => setNewTask({ ...newTask, recurringInterval: e.target.value })}
                  className="task-input"
                >
                  {Object.keys(RECURRING_INTERVALS).map(interval => (
                    <option key={interval} value={interval}>
                      {t(interval)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newTask.alert}
                onChange={(e) => setNewTask({ ...newTask, alert: e.target.checked })}
                className="checkbox"
              />
              {t('alertLabel')}
            </label>

            <button
              onClick={addTask}
              className="add-task-button"
              aria-label={t('addTaskButton')}
            >
              {t('addTaskButton')}
            </button>
          </div>

          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 300 }}
              className="calendar"
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.completed ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  borderRadius: '4px',
                },
              })}
            />
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="history-button"
          >
            {showHistory ? t('hideHistoryButton') : t('showHistoryButton')}
          </button>

          {showHistory && (
            <div className="task-history-container">
              {filteredTasks.length > 0 ? (
                <div className="task-grid">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                        {task.name}
                      </h3>
                      <p><strong>{t('dateLabel')}:</strong> {task.date}</p>
                      <p><strong>{t('recurringLabel')}:</strong> {task.recurring ? t(task.recurringInterval) : t('no')}</p>
                      <p><strong>{t('alertLabel')}:</strong> {task.alert ? t('yes') : t('no')}</p>
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="complete-button"
                        aria-label={task.completed ? t('undoButton') : t('completeButton')}
                      >
                        {task.completed ? t('undoButton') : t('completeButton')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-results">{t('noTasksFound')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'crops' && (
        <div className="crop-guide">
          <div className="crop-input-container">
            {[
              { name: 'soilType', type: 'select', options: ['Loamy', 'Clay', 'Sandy'], placeholder: 'selectSoilType' },
              { name: 'soilPh', type: 'number', step: '0.1', placeholder: 'soilPhPlaceholder' },
              // ... other fields
            ].map(field => (
              <div key={field.name} className="input-group">
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={farmProfile[field.name]}
                    onChange={handleFarmProfileChange}
                    className="crop-input"
                  >
                    <option value="">{t(field.placeholder)}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {t(option.toLowerCase())}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    step={field.step}
                    placeholder={t(field.placeholder)}
                    value={farmProfile[field.name]}
                    onChange={handleFarmProfileChange}
                    className="crop-input"
                  />
                )}
              </div>
            ))}
          </div>

          <h3 className="recommendations-title">{t('recommendedCrops')}</h3>
          
          <div className="recommendations-container">
            {recommendations.length > 0 ? (
              recommendations.map(crop => (
                <div key={crop.id} className="crop-card">
                  <h4 className="crop-title">{crop.name}</h4>
                  {[
                    { label: 'soilLabel', value: crop.soil },
                    { label: 'soilPhLabel', value: `${crop.soilPh[0]} - ${crop.soilPh[1]}` },
                    // ... other fields
                  ].map(item => (
                    <p key={item.label}>
                      <strong>{t(item.label)}:</strong> {item.value}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <p className="no-results">{t('noRecommendations')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmPlanner;