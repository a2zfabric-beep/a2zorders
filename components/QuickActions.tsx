'use client';

import Link from 'next/link';
import { Plus, BarChart3, Users } from 'lucide-react';
import Button from './ui/Button';

interface QuickActionsProps {
  onCreateOrder?: () => void;
}

export default function QuickActions({ onCreateOrder }: QuickActionsProps) {
  const actions = [
    {
      icon: <Plus size={16} />,
      label: 'Create Order',
      href: '/orders',
      variant: 'primary' as const,
      onClick: onCreateOrder,
    },
    {
      icon: <BarChart3 size={16} />,
      label: 'Analytics',
      href: '/dashboard',
      variant: 'secondary' as const,
    },
    {
      icon: <Users size={16} />,
      label: 'Add Client',
      href: '/clients',
      variant: 'secondary' as const,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        action.onClick ? (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : (
          <Link key={action.label} href={action.href}>
            <Button variant={action.variant} size="sm" icon={action.icon}>
              {action.label}
            </Button>
          </Link>
        )
      ))}
    </div>
  );
}
