import { GoogleGenAI } from "@google/genai";
import type { Contact, Meeting } from '../types';

// The prompt guarantees process.env.API_KEY is available.
// This single initialization works for both web and Electron environments.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const generateEmailInvitation = async (meeting: Meeting, participants: Contact[]): Promise<string> => {
  
  const timezonesText = participants.map(p => {
    const participantDateTime = new Date(meeting.dateTime).toLocaleString('en-US', {
      timeZone: p.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
    return `- ${p.name}: ${participantDateTime} (${p.timezone})`;
  }).join('\n');

  const prompt = `
    Write a professional yet friendly email invitation body for a meeting.

    Meeting Topic: "${meeting.topic}"

    The meeting is scheduled at the following times for each participant:
    ${timezonesText}

    Your task is to generate the conversational part of the email. Be concise and welcoming.
    Do NOT include any logistical details like the location, date, time, or joining links. These will be added programmatically later.
    Just write the friendly, human-like message part of the email.
    For example: "Hi team, looking forward to our discussion about [Topic]. I've scheduled some time for us to connect..."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating email invitation:", error);
    return "Hello,\n\nThis is an invitation for our upcoming meeting.\n\nWe will discuss: [Meeting Topic].\n\nLooking forward to seeing you there.\n\nBest,";
  }
};