
import React, { useState, useEffect, useCallback } from 'react';
import type { Meeting, Contact } from '../types';
import { generateEmailInvitation } from '../services/geminiService';
import Modal from './Modal';
import { EmailIcon, CopyIcon } from './icons';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  contacts: Contact[];
}

const EmailComposer: React.FC<EmailComposerProps> = ({ isOpen, onClose, meeting, contacts }) => {
  const [generatedBody, setGeneratedBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmailBody = useCallback(async () => {
    if (!meeting) return;

    setIsLoading(true);
    setError(null);
    try {
      const participants = contacts.filter(c => meeting.participantIds.includes(c.id));
      const body = await generateEmailInvitation(meeting, participants);
      setGeneratedBody(body);
    } catch (err) {
      setError('Failed to generate email content.');
      setGeneratedBody('There was an error generating the email. Please write your own message.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [meeting, contacts]);

  useEffect(() => {
    if (isOpen && meeting) {
      fetchEmailBody();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, meeting]);

  if (!meeting) return null;

  const participants = contacts.filter(c => meeting.participantIds.includes(c.id));
  const recipientEmails = participants.map(p => p.email).join(',');
  const subject = `Invitation: ${meeting.topic}`;
  
  const formattedDateTime = new Date(meeting.dateTime).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const getFullBody = () => {
    return `${generatedBody}
    
---
Meeting Details:
Topic: ${meeting.topic}
Date & Time: ${formattedDateTime} (${Intl.DateTimeFormat().resolvedOptions().timeZone})
Location: ${meeting.locationType} - ${meeting.location}

Join Link: ${meeting.shareableLink}
---`;
  };

  const fullBodyForMailto = encodeURIComponent(getFullBody());

  const handleOpenInEmailClient = () => {
    const mailtoLink = `mailto:${recipientEmails}?subject=${encodeURIComponent(subject)}&body=${fullBodyForMailto}`;
    
    if (mailtoLink.length > 2000) {
        navigator.clipboard.writeText(getFullBody());
        alert("The email content is too long for a direct link. The body has been copied to your clipboard. Please paste it into your email client manually.");
        return;
    }

    // Edge specific handling
    if (navigator.userAgent.indexOf("Edg/") > -1) {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmails)}&su=${encodeURIComponent(subject)}&body=${fullBodyForMailto}`;
        window.open(gmailUrl, '_blank');
    } else {
        window.location.href = mailtoLink;
    }
  };

  const handleCopyToClipboard = () => {
    const clipboardText = `To: ${recipientEmails}\nSubject: ${subject}\n\n${getFullBody()}`;
    navigator.clipboard.writeText(clipboardText);
    alert('Email details copied to clipboard!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose Invitation Email">
      <div className="space-y-4 text-light-text dark:text-dark-text">
        <div>
          <label className="font-semibold">To:</label>
          <p className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1 break-all">{recipientEmails || 'No participants selected'}</p>
        </div>
        <div>
          <label className="font-semibold">Subject:</label>
          <p className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1">{subject}</p>
        </div>
        <div>
          <label htmlFor="emailBody" className="font-semibold">Body:</label>
          {isLoading ? (
            <div className="w-full h-32 mt-1 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
              <p className="text-gray-500">Generating with AI...</p>
            </div>
          ) : (
            <textarea
              id="emailBody"
              value={generatedBody}
              onChange={(e) => setGeneratedBody(e.target.value)}
              rows={6}
              className="mt-1 block w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          )}
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm space-y-2">
          <p><strong>Topic:</strong> {meeting.topic}</p>
          <p><strong>Date & Time:</strong> {formattedDateTime}</p>
          <p><strong>Location:</strong> {meeting.locationType} - <a href={meeting.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{meeting.location}</a></p>
          <p><strong>Join Link:</strong> <a href={meeting.shareableLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{meeting.shareableLink}</a></p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            <CopyIcon /> Copy
          </button>
          <button onClick={handleOpenInEmailClient} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark shadow transition-colors">
            <EmailIcon /> Open in Email Client
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailComposer;
