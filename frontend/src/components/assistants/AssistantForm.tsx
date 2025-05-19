import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface AssistantFormData {
  name: string;
  availability?: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
  voice?: {
    provider: string;
    language: string;
  };
  firstMessage?: string;
  webhookUrl?: string;
  transcriptionEnabled?: boolean;
  recordingEnabled?: boolean;
  metadata?: {
    businessId?: string;
    [key: string]: any;
  };
}

const defaultAvailability = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [],
  sunday: [],
};

const AssistantForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<AssistantFormData>({
    name: '',
    availability: defaultAvailability,
    voice: {
      provider: 'elevenlabs',
      language: 'en-US',
    },
    firstMessage: '',
    webhookUrl: '',
    transcriptionEnabled: true,
    recordingEnabled: true,
  });

  useEffect(() => {
    if (id) {
      fetchAssistant();
    }
  }, [id]);

  const fetchAssistant = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/assistants/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assistant: ${response.status} ${response.statusText}`);
      }

      const assistant = await response.json();
      
      // Convert Vapi assistant to form data format
      setFormData({
        name: assistant.name || '',
        availability: assistant.availability || defaultAvailability,
        voice: assistant.voice || { provider: 'elevenlabs', language: 'en-US' },
        firstMessage: assistant.initial_message || assistant.firstMessage || '',
        webhookUrl: assistant.webhook?.url || '',
        transcriptionEnabled: assistant.transcriber?.enabled !== false,
        recordingEnabled: assistant.recording_enabled !== false,
      });
    } catch (err) {
      console.error('Error fetching assistant:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Format data for Vapi API
      const apiData = {
        name: formData.name,
        availability: formData.availability,
        voice: formData.voice,
        initial_message: formData.firstMessage,
        webhook: formData.webhookUrl ? { url: formData.webhookUrl } : undefined,
        transcriber: {
          enabled: formData.transcriptionEnabled
        },
        recording_enabled: formData.recordingEnabled,
      };

      const url = id ? `/api/assistants/${id}` : '/api/assistants';
      const method = id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save assistant: ${response.status}`);
      }

      setSuccess('Assistant saved successfully!');
      setTimeout(() => {
        navigate('/assistants');
      }, 1500);
    } catch (err) {
      console.error('Error saving assistant:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (
    day: string,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || defaultAvailability),
        [day]: (prev.availability?.[day] || []).map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || defaultAvailability),
        [day]: [...(prev.availability?.[day] || []), { start: '09:00', end: '17:00' }],
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || defaultAvailability),
        [day]: (prev.availability?.[day] || []).filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white shadow sm:rounded-md px-6 py-8">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {id ? 'Edit Assistant' : 'Create New Assistant'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure your voice assistant settings.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="firstMessage"
                className="block text-sm font-medium text-gray-700"
              >
                First Message
              </label>
              <div className="mt-1">
                <textarea
                  id="firstMessage"
                  name="firstMessage"
                  rows={3}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.firstMessage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstMessage: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="voiceProvider"
                className="block text-sm font-medium text-gray-700"
              >
                Voice Provider
              </label>
              <div className="mt-1">
                <select
                  id="voiceProvider"
                  name="voiceProvider"
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.voice?.provider}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voice: { ...prev.voice, provider: e.target.value },
                    }))
                  }
                >
                  <option value="elevenlabs">ElevenLabs</option>
                  <option value="azure">Azure</option>
                  <option value="google">Google</option>
                  <option value="openai">OpenAI</option>
                  <option value="playht">PlayHT</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <div className="mt-1">
                <select
                  id="language"
                  name="language"
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.voice?.language}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voice: { ...prev.voice, language: e.target.value },
                    }))
                  }
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="webhookUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Webhook URL (optional)
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="webhookUrl"
                  id="webhookUrl"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.webhookUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      webhookUrl: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="transcriptionEnabled"
                    name="transcriptionEnabled"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={formData.transcriptionEnabled}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        transcriptionEnabled: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="transcriptionEnabled"
                    className="font-medium text-gray-700"
                  >
                    Enable Transcription
                  </label>
                  <p className="text-gray-500">
                    Allow the assistant to transcribe conversations.
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="recordingEnabled"
                    name="recordingEnabled"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={formData.recordingEnabled}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        recordingEnabled: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="recordingEnabled"
                    className="font-medium text-gray-700"
                  >
                    Enable Recording
                  </label>
                  <p className="text-gray-500">
                    Allow the assistant to record conversations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Availability Schedule
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Set when your assistant is available to take calls.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {Object.entries(formData.availability || defaultAvailability).map(([day, slots]) => (
              <div key={day} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {day}
                  </h4>
                  <button
                    type="button"
                    onClick={() => addTimeSlot(day)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Time Slot
                  </button>
                </div>
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start
                      </label>
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            day,
                            index,
                            'start',
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End
                      </label>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            day,
                            index,
                            'end',
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(day, index)}
                      className="mt-6 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/assistants')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AssistantForm; 