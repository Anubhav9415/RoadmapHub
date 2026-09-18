import React from 'react';
import KanbanColumn from './KanbanColumn';
import './Kanban.css';

/**
 * KanbanBoard Component
 * @param {object} data - { planned: [], inProgress: [], completed: [] }
 */
export default function KanbanBoard({ data = { planned: [], inProgress: [], completed: [] } }) {
  const columns = [
    {
      title: 'Planned',
      status: 'planned',
      posts: data.planned || [],
      color: '#0969da', // Blue
    },
    {
      title: 'In Progress',
      status: 'in_progress',
      posts: data.inProgress || [],
      color: '#d97706', // Amber
    },
    {
      title: 'Completed',
      status: 'completed',
      posts: data.completed || [],
      color: '#16a34a', // Green
    },
  ];

  return (
    <div className="kanban-board-grid">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          posts={col.posts}
          color={col.color}
        />
      ))}
    </div>
  );
}
