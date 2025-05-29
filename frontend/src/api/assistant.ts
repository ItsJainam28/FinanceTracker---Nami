




import api from "./axiosInstance";

// Updated interfaces to match your backend response
export interface ChatSession {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface SessionMessagesResponse {
  success: boolean;
  data: ChatMessage[];
}

export interface SessionsResponse {
  success: boolean;
  data: ChatSession[];
}

export interface CreateSessionResponse {
  success: boolean;
  data: ChatSession;
}

// API Functions
export const createChatSession = (): Promise<{ data: CreateSessionResponse }> => 
  api.post("/ai/sessions");

export const getChatSessions = (): Promise<{ data: SessionsResponse }> => 
  api.get("/ai/sessions");

// Updated to match your backend endpoint for getting messages
export const getChatMessages = (sessionId: string): Promise<{ data: SessionMessagesResponse }> => 
  api.get(`/ai/sessions/${sessionId}/messages`);

// Get a specific session (if you need this endpoint)
export const getChatSession = (sessionId: string): Promise<{ data: ApiResponse<ChatSession> }> => 
  api.get(`/ai/sessions/${sessionId}`);

// Updated streaming function to properly handle SSE
export const streamAssistantReply = async (sessionId: string, message: string) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage (same as axios interceptor does)
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${api.defaults.baseURL}/ai/sessions/${sessionId}/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body available for streaming');
    }

    return {
      data: response.body.getReader()
    };
  } catch (error) {
    console.error('Streaming request failed:', error);
    throw error;
  }
};

// Helper function to update session title
export const updateSessionTitle = (sessionId: string, title: string): Promise<{ data: ApiResponse<ChatSession> }> =>
  api.patch(`/ai/sessions/${sessionId}`, { title });

// Helper function to delete a session
export const deleteSession = (sessionId: string): Promise<{ data: ApiResponse<void> }> =>
  api.delete(`/ai/sessions/${sessionId}`);