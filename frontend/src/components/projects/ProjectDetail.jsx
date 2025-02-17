import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import ProjectForm from './ProjectForm';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const [projectResponse, tasksResponse] = await Promise.all([
        api.get(`/projects/${id}/`),
        api.get(`/projects/${id}/tasks/`)
      ]);
      setProject(projectResponse.data);
      setTasks(tasksResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch project details');
      console.error('Error fetching project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = async (updatedProject) => {
    setProject(updatedProject);
    setIsEditing(false);
    await fetchProjectDetails();
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}/`);
      navigate('/projects');
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same status
      const newTasks = Array.from(tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);
      setTasks(newTasks);
    } else {
      // Move to different status
      try {
        const taskId = parseInt(draggableId.split('-')[1]);
        await api.patch(`/tasks/${taskId}/`, {
          status: destination.droppableId
        });
        await fetchProjectDetails();
      } catch (err) {
        console.error('Error updating task status:', err);
        // Revert to original position
        await fetchProjectDetails();
      }
    }
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

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <ProjectForm
          project={project}
          onSubmit={handleProjectUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{project.description}</p>
            <div className="mt-4 flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tasks.length} tasks ({tasks.filter(t => t.status === 'completed').length} completed)
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Team Members */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</h3>
          <div className="mt-2 flex -space-x-2">
            {project.team_members.map((member) => (
              <img
                key={member.id}
                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=random`}
                alt={member.username}
                title={member.username}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Project Tasks */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tasks</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['todo', 'in_progress', 'completed'].map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-lg ${
                      snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {status.replace('_', ' ').toUpperCase()}
                    </h3>
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={`task-${task.id}`}
                          draggableId={`task-${task.id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 mb-2 rounded-md bg-white dark:bg-gray-800 shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {task.description}
                                </p>
                              )}
                              {task.due_date && (
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ProjectDetail;
