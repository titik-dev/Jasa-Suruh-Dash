import React from 'react';
import { motion } from 'framer-motion';
import { User, Truck, Shield, ChevronDown, LogOut } from 'lucide-react';
import type { AppMode } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AppSwitcherProps {
  className?: string;
}

const appConfig: Record<AppMode, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  user: {
    label: 'User App',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  driver: {
    label: 'Driver App',
    icon: Truck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  admin: {
    label: 'Admin Console',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export const AppSwitcher: React.FC<AppSwitcherProps> = ({ className }) => {
  const { appMode, setAppMode, userType, signOut } = useApp();
  const currentConfig = appConfig[appMode];
  const Icon = currentConfig.icon;

  // Determine available modes based on user type
  const availableModes: AppMode[] = userType === 'admin'
    ? ['user', 'driver', 'admin']
    : userType === 'driver'
    ? ['driver']
    : ['user'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
            'hover:shadow-md active:scale-95',
            currentConfig.bgColor,
            className
          )}
        >
          <div className={cn('p-1.5 rounded-lg', currentConfig.bgColor)}>
            <Icon className={cn('w-5 h-5', currentConfig.color)} />
          </div>
          <span className={cn('font-semibold text-sm hidden sm:block', currentConfig.color)}>
            {currentConfig.label}
          </span>
          <ChevronDown className={cn('w-4 h-4', currentConfig.color)} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 text-sm text-gray-500">
          Pilih Aplikasi
        </div>
        {availableModes.map((mode) => {
          const config = appConfig[mode];
          const ModeIcon = config.icon;
          const isActive = mode === appMode;
          
          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => setAppMode(mode)}
              className={cn(
                'flex items-center gap-3 cursor-pointer',
                isActive && 'bg-gray-50'
              )}
            >
              <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                <ModeIcon className={cn('w-4 h-4', config.color)} />
              </div>
              <span className={cn('text-sm', isActive ? 'font-semibold' : 'font-normal')}>
                {config.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-blue-500"
                />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={signOut}
          className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600"
        >
          <div className="p-1.5 rounded-lg bg-red-50">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-sm font-medium">Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppSwitcher;
