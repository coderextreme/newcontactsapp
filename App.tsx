
import React, { useState, useEffect } from 'react';
import type { Contact, Meeting, View, Theme } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import ContactList from './components/ContactList';
import MeetingList from './components/MeetingList';
import ContactForm from './components/ContactForm';
import MeetingForm from './components/MeetingForm';
import EmailComposer from './components/EmailComposer';

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [contacts, setContacts] = useLocalStorage<Contact[]>('contacts', []);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', []);
  const [currentView, setCurrentView] = useState<View>('contacts');

  // State for modals
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [meetingForEmail, setMeetingForEmail] = useState<Meeting | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Contact CRUD
  const handleAddContact = () => {
    setContactToEdit(null);
    setIsContactFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsContactFormOpen(true);
  };
  
  const handleSaveContact = (contact: Contact) => {
    setContacts(prev => {
        const exists = prev.some(c => c.id === contact.id);
        return exists ? prev.map(c => c.id === contact.id ? contact : c) : [...prev, contact];
    });
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact? This will also remove them from any meetings.')) {
        setContacts(prev => prev.filter(c => c.id !== contactId));
        // Also remove from meetings
        setMeetings(prevMeetings => prevMeetings.map(m => ({
            ...m,
            participantIds: m.participantIds.filter(id => id !== contactId)
        })));
    }
  };

  // Meeting CRUD
  const handleScheduleMeeting = () => {
    setMeetingToEdit(null);
    setIsMeetingFormOpen(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setMeetingToEdit(meeting);
    setIsMeetingFormOpen(true);
  };

  const handleSaveMeeting = (meeting: Meeting) => {
    setMeetings(prev => {
        const exists = prev.some(m => m.id === meeting.id);
        return exists ? prev.map(m => m.id === meeting.id ? meeting : m) : [...prev, meeting];
    });
  };

  const handleDeleteMeeting = (meetingId: string) => {
     if (window.confirm('Are you sure you want to delete this meeting?')) {
        setMeetings(prev => prev.filter(m => m.id !== meetingId));
    }
  };
  
  const handleComposeEmail = (meeting: Meeting) => {
    setMeetingForEmail(meeting);
    setIsEmailComposerOpen(true);
  };

  // Data Management
  const handleSaveToFile = () => {
    const data = JSON.stringify({ contacts, meetings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduler-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.confirm("Are you sure you want to restore from this file? This will overwrite all current data.")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    const { contacts: newContacts, meetings: newMeetings } = JSON.parse(result);
                    if (Array.isArray(newContacts) && Array.isArray(newMeetings)) {
                        setContacts(newContacts);
                        setMeetings(newMeetings);
                        alert("Data restored successfully!");
                    } else {
                        throw new Error("Invalid file format");
                    }
                }
            } catch (error) {
                alert("Failed to restore data. The file might be corrupted or in the wrong format.");
            }
        };
        reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  };


  return (
    <div className="min-h-screen text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onThemeChange={toggleTheme}
        onSaveToFile={handleSaveToFile}
        onRestoreFromFile={handleRestoreFromFile}
      />
      <main className="max-w-7xl mx-auto pb-12">
        {currentView === 'contacts' ? (
          <ContactList 
            contacts={contacts} 
            onAddContact={handleAddContact} 
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />
        ) : (
          <MeetingList 
            meetings={meetings} 
            contacts={contacts}
            onScheduleMeeting={handleScheduleMeeting}
            onEditMeeting={handleEditMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onComposeEmail={handleComposeEmail}
          />
        )}
      </main>
      
      <ContactForm 
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
      />
      
      <MeetingForm
        isOpen={isMeetingFormOpen}
        onClose={() => setIsMeetingFormOpen(false)}
        onSave={handleSaveMeeting}
        meetingToEdit={meetingToEdit}
        contacts={contacts}
      />
      
      <EmailComposer
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        meeting={meetingForEmail}
        contacts={contacts}
      />
    </div>
  );
};

export default App;
