import React, { useState } from 'react';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';

const ProjectPage = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleProjectCreated = () => {
    setIsCreating(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              New Project
            </button>
          )}
        </div>

        {isCreating ? (
          <div className="mb-6">
            <ProjectForm
              onSubmit={handleProjectCreated}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : (
          <ProjectList />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
