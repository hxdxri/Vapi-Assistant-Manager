import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface AssistantFormData {
  name: string;
  availabilityJson: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
  voiceProvider: string;
  languageCode: string;
  introMessage: string;
  webhookUrl: string;
  transcriptionEnabled: boolean;
  recordingEnabled: boolean;
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
  const [formData, setFormData] = useState<AssistantFormData>({
    name: '',
    availabilityJson: defaultAvailability,
    voiceProvider: 'elevenlabs',
    languageCode: 'en-US',
    introMessage: '',
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:3000/api/assistants/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assistant');
      }

      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = id
        ? `http://localhost:3000/api/assistants/${id}`
        : 'http://localhost:3000/api/assistants';
      const method = id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save assistant');
      }

      navigate('/assistants');
    } catch (err) {
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
      availabilityJson: {
        ...prev.availabilityJson,
        [day]: prev.availabilityJson[day].map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availabilityJson: {
        ...prev.availabilityJson,
        [day]: [...prev.availabilityJson[day], { start: '09:00', end: '17:00' }],
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      availabilityJson: {
        ...prev.availabilityJson,
        [day]: prev.availabilityJson[day].filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
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
                htmlFor="introMessage"
                className="block text-sm font-medium text-gray-700"
              >
                Introduction Message
              </label>
              <div className="mt-1">
                <textarea
                  id="introMessage"
                  name="introMessage"
                  rows={3}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.introMessage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      introMessage: e.target.value,
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
                  value={formData.voiceProvider}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voiceProvider: e.target.value,
                    }))
                  }
                >
                  <option value="elevenlabs">ElevenLabs</option>
                  <option value="azure">Azure</option>
                  <option value="google">Google</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="languageCode"
                className="block text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <div className="mt-1">
                <select
                  id="languageCode"
                  name="languageCode"
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.languageCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      languageCode: e.target.value,
                    }))
                  }
                >
                  <option value="en-US">English (US)</option>
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
            {Object.entries(formData.availabilityJson).map(([day, slots]) => (
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