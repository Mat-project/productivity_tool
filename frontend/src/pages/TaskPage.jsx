import React, { useState, useEffect } from 'react';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import axios from 'axios';

const TaskPage = () => {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tasks</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Tasks</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">To Do</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.todo}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.in_progress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Completed</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <TaskForm onTaskCreated={handleTaskCreated} />
        <TaskList />
      </div>
    </div>
  );
};

export default TaskPage;
