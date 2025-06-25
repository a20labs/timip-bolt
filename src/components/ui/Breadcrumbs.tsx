import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { currentWorkspace } = useWorkspaceStore();

  const allItems = [
    { label: currentWorkspace?.name || 'Workspace', href: '/' },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Home className="w-4 h-4" />
      {allItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          {item.href && index < allItems.length - 1 ? (
            <Link
              to={item.href}
              className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === allItems.length - 1 ? 'text-gray-900 dark:text-white font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}