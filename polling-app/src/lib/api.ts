import { Poll, CreatePollData, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Generic API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Polls API
  async getPolls(): Promise<Poll[]> {
    return this.request<Poll[]>('/polls');
  }

  async getPoll(id: string): Promise<Poll> {
    return this.request<Poll>(`/polls/${id}`);
  }

  async createPoll(data: CreatePollData): Promise<Poll> {
    return this.request<Poll>('/polls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async vote(pollId: string, optionId: string): Promise<void> {
    return this.request<void>(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  }

  // Auth API
  async login(email: string, password: string): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Mock data for development
export const mockPolls: Poll[] = [
  {
    id: '1',
    title: 'What\'s your favorite programming language?',
    description: 'Choose your preferred programming language for web development',
    options: [
      { id: '1', text: 'JavaScript/TypeScript', votes: 45 },
      { id: '2', text: 'Python', votes: 32 },
      { id: '3', text: 'Java', votes: 18 },
      { id: '4', text: 'C#', votes: 15 },
    ],
    createdBy: 'user1',
    isActive: true,
    allowMultipleVotes: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Which framework do you prefer?',
    description: 'Select your favorite frontend framework',
    options: [
      { id: '5', text: 'React', votes: 52 },
      { id: '6', text: 'Vue.js', votes: 28 },
      { id: '7', text: 'Angular', votes: 20 },
    ],
    createdBy: 'user2',
    isActive: true,
    allowMultipleVotes: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];
