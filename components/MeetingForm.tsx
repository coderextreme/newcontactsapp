
import React, { useState, useEffect } from 'react';
import type { Meeting, Contact, LocationType } from '../types';
import Modal from './Modal';

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
  meetingToEdit: Meeting | null;
  contacts: Contact[];
}

const initialMeetingState: Omit<Meeting, 'id' | 'shareableLink'> = {
  topic: '',
  dateTime: new Date().toISOString().slice(0, 16),
  locationType: 'URL',
  location: '',
  participantIds: [],
};

const locationTypes: LocationType[] = ['Physical', 'URL', 'Zoom', 'Discord', 'Facebook Messenger'];

const MeetingForm: React.FC<MeetingFormProps> = ({ isOpen, onClose, onSave, meetingToEdit, contacts }) => {
  const [meeting, setMeeting] = useState(initialMeetingState);

  useEffect(() => {
    if (meetingToEdit) {
      setMeeting(meetingToEdit);
    } else {
      setMeeting({
        ...initialMeetingState,
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16) // Default to 1 hour from now
      });
    }
  }, [meetingToEdit, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMeeting(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setMeeting(prev => ({...prev, participantIds: selectedIds}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const meetingId = meetingToEdit ? meetingToEdit.id : crypto.randomUUID();
    // Fix: Explicitly create and type the new meeting object to ensure type safety before saving.
    const newMeeting: Meeting = {
      ...meeting,
      id: meetingId,
      shareableLink: `${window.location.origin}/join?meetingId=${meetingId}`,
    };
    onSave(newMeeting);
    onClose();
  };

  const formFieldClasses = "mt-1 block w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-light-text dark:text-dark-text";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meetingToEdit ? 'Edit Meeting' : 'Schedule New Meeting'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className={labelClasses}>Topic</label>
          <input type="text" id="topic" name="topic" value={meeting.topic} onChange={handleChange} required className={formFieldClasses} />
        </div>
        <div>
          <label htmlFor="dateTime" className={labelClasses}>Date & Time</label>
          <input type="datetime-local" id="dateTime" name="dateTime" value={meeting.dateTime} onChange={handleChange} required className={formFieldClasses} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="locationType" className={labelClasses}>Location Type</label>
            <select id="locationType" name="locationType" value={meeting.locationType} onChange={handleChange} className={formFieldClasses}>
              {locationTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="location" className={labelClasses}>Location Details</label>
            <input type="text" id="location" name="location" value={meeting.location} onChange={handleChange} required className={formFieldClasses} placeholder={meeting.locationType === 'Physical' ? 'Address' : 'URL or Link'} />
          </div>
        </div>
        <div>
          <label htmlFor="participantIds" className={labelClasses}>Participants</label>
          <select id="participantIds" name="participantIds" multiple value={meeting.participantIds} onChange={handleParticipantChange} required className={`${formFieldClasses} h-32`}>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
           <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple participants.</p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark shadow transition-colors">Save Meeting</button>
        </div>
      </form>
    </Modal>
  );
};

export default MeetingForm;