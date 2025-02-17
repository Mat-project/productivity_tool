import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/projects/dashboard_stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching project stats:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{stats.total_projects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
            <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.in_progress_projects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
            <p className="mt-1 text-2xl font-semibold text-green-600">{stats.completed_projects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">On Hold</h3>
            <p className="mt-1 text-2xl font-semibold text-yellow-600">{stats.on_hold_projects}</p>
          </div>
        </div>
      )}

      {/* Project List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h2>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {projects.map((project) => (
            <li key={project.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Link to={`/projects/${project.id}`} className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.task_count} tasks ({project.completed_task_count} completed)
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex -space-x-2">
                    {project.team_members.slice(0, 3).map((member) => (
                      <img
                        key={member.id}
                        className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=random`}
                        alt={member.username}
                      />
                    ))}
                    {project.team_members.length > 3 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          +{project.team_members.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectList;
