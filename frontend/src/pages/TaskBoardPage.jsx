import React, { useState, useEffect } from 'react';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskForm from '../components/tasks/TaskForm';
import axios from 'axios';

const TaskBoardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    todo: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/tasks/dashboard_stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleTaskCreated = () => {
    fetchStats();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h1>
          <div className="flex space-x-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
              <span className="ml-2 font-bold text-gray-900 dark:text-white">{stats.total}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">In Progress:</span>
              <span className="ml-2 font-bold text-yellow-600 dark:text-yellow-400">{stats.in_progress}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Completed:</span>
              <span className="ml-2 font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
            </div>
          </div>
        </div>
        <TaskForm onTaskCreated={handleTaskCreated} />
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <TaskBoard />
      </div>
    </div>
  );
};

export default TaskBoardPage;
