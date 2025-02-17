import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TaskBoard = () => {
  const [columns, setColumns] = useState({
    todo: {
      title: 'To Do',
      items: []
    },
    in_progress: {
      title: 'In Progress',
      items: []
    },
    completed: {
      title: 'Completed',
      items: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/');
      const tasks = response.data;
      
      // Group tasks by status
      const newColumns = {
        todo: { title: 'To Do', items: [] },
        in_progress: { title: 'In Progress', items: [] },
        completed: { title: 'Completed', items: [] }
      };

      tasks.forEach(task => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        }
      });

      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const column = columns[source.droppableId];
      const items = Array.from(column.items);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items
        }
      });
    } else {
      // Move between columns
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });

      // Update task status in the backend
      try {
        await axios.patch(`/api/tasks/${draggableId}/`, {
          status: destination.droppableId
        });
      } catch (error) {
        console.error('Error updating task status:', error);
        // Revert the UI state if the API call fails
        fetchTasks();
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 h-[calc(100vh-12rem)] overflow-hidden">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="flex-1 flex flex-col min-w-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-300">
              {column.title} ({column.items.length})
            </h2>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto rounded-lg space-y-2 p-2 ${
                    snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                >
                  {column.items.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm ${
                            getPriorityColor(task.priority)
                          } ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {task.priority}
                            </span>
                            {task.due_date && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
