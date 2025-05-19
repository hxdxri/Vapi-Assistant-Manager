import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Assistant {
  id: string;
  name: string;
  voiceProvider: string;
  languageCode: string;
  transcriptionEnabled: boolean;
  recordingEnabled: boolean;
}

interface AssistantListProps {
  vapiKey: string;
}

const AssistantList: React.FC<AssistantListProps> = ({ vapiKey }) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('https://api.vapi.ai/assistants', {
          headers: {
            'Authorization': `Bearer ${vapiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch assistants from Vapi API');
        }
        const data = await response.json();
        setAssistants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchAssistants();
  }, [vapiKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Assistants</h3>
        <Link
          to="/assistants/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Assistant
        </Link>
      </div>
      <ul className="divide-y divide-gray-200">
        {assistants.map((assistant) => (
          <li key={assistant.id}>
            <Link
              to={`/assistants/${assistant.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {assistant.name}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {assistant.voiceProvider}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Language: {assistant.languageCode}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p className="mr-4">
                      Transcription: {assistant.transcriptionEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p>
                      Recording: {assistant.recordingEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssistantList; 