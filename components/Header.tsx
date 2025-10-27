
import React, { useRef } from 'react';
import type { View, Theme } from '../types';
import {
  ContactsIcon,
  MeetingsIcon,
  SunIcon,
  MoonIcon,
  SaveIcon,
  UploadIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
} from './icons';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  theme: Theme;
  onThemeChange: () => void;
  onSaveToFile: () => void;
  onRestoreFromFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  theme,
  onThemeChange,
  onSaveToFile,
  onRestoreFromFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const navButtonClasses = (view: View) =>
    `flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
      currentView === view
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card'
    }`;
    
  const iconButtonClasses = "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300";

  return (
    <header className="sticky top-0 z-30 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg shadow-sm px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: App Title and Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">
            Scheduler
          </h1>
          <nav className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button className={navButtonClasses('contacts')} onClick={() => onViewChange('contacts')}>
              <ContactsIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Contacts</span>
            </button>
            <button className={navButtonClasses('meetings')} onClick={() => onViewChange('meetings')}>
              <MeetingsIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Meetings</span>
            </button>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className={iconButtonClasses} onClick={onSaveToFile} title="Save to File">
            <SaveIcon />
          </button>
          <button className={iconButtonClasses} onClick={handleRestoreClick} title="Restore from File">
            <UploadIcon />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={onRestoreFromFile}
            />
          </button>
          <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1"></div>
          <button className={iconButtonClasses} onClick={() => alert('Server backup is a placeholder feature.')} title="Save to Cloud (Placeholder)">
            <CloudUploadIcon />
          </button>
          <button className={iconButtonClasses} onClick={() => alert('Server restore is a placeholder feature.')} title="Restore from Cloud (Placeholder)">
            <CloudDownloadIcon />
          </button>
          <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1"></div>
          <button className={iconButtonClasses} onClick={onThemeChange} title="Toggle Theme">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
