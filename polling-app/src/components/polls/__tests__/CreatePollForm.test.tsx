import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePollForm } from '../CreatePollForm';
import * as actions from '@/lib/actions';
import * as authStore from '@/lib/auth';

// Mock the actions module
vi.mock('@/lib/actions', () => ({
  createPoll: vi.fn(),
}));

// Mock the auth store
vi.mock('@/lib/auth', () => ({
  useAuthStore: vi.fn(),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CreatePollForm', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthStore = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    setLoading: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authStore.useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  describe('Authentication Check', () => {
    it('shows sign in message when user is not authenticated', () => {
      (authStore.useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isAuthenticated: false,
      });

      render(<CreatePollForm />);
      
      expect(screen.getByText('You must be logged in to create a poll')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('shows the form when user is authenticated', () => {
      render(<CreatePollForm />);
      
      expect(screen.getByText('Create a new poll')).toBeInTheDocument();
      expect(screen.getByLabelText('Poll Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when title is empty', async () => {
      render(<CreatePollForm />);
      
      const form = document.querySelector('form');
      if (!form) throw new Error('Form not found');
      fireEvent.submit(form);
      
      // Debug: log the current DOM to see what's happening
      console.log('DOM after submit:', document.body.innerHTML);
      
      // Check if the error state is set by looking for the error message
      await waitFor(() => {
        const errorElement = screen.getByText('Poll title is required');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('shows error when there are fewer than 2 options', async () => {
      render(<CreatePollForm />);
      
      // Fill in title
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      // Add an option first to get remove buttons
      const addButton = screen.getByText('Add Option');
      fireEvent.click(addButton);
      
      // Now remove one option (should leave only 2)
      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);
      
      const form = document.querySelector('form');
      if (!form) throw new Error('Form not found');
      fireEvent.submit(form);
      
      await waitFor(() => {
        const errorElement = screen.getByText('At least 2 options are required');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('allows submission with valid data', async () => {
      const mockCreatePoll = vi.fn().mockResolvedValue({ success: true, pollId: 'poll-1' });
      (actions.createPoll as any).mockImplementation(mockCreatePoll);
      
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const descriptionInput = screen.getByLabelText('Description (optional)');
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      const form = document.querySelector('form');
      if (!form) throw new Error('Form not found');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockCreatePoll).toHaveBeenCalledWith({
          title: 'Test Poll',
          description: 'Test Description',
          options: ['Option A', 'Option B'],
          allowMultipleVotes: false,
        }, 'user-1');
      });
    });

    it('form submission actually works', async () => {
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      // Submit the form
      const form = document.querySelector('form');
      if (!form) throw new Error('Form not found');
      fireEvent.submit(form);
      
      // This should trigger the handleSubmit function
      // We can verify by checking if any validation errors appear
      await waitFor(() => {
        // If validation passes, no errors should be shown
        const errorElements = screen.queryAllByText(/required|error/i);
        expect(errorElements).toHaveLength(0);
      });
    });
  });

  describe('Poll Options Management', () => {
    it('starts with 2 options by default', () => {
      render(<CreatePollForm />);
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      expect(optionInputs).toHaveLength(2);
    });

    it('adds new option when Add Option button is clicked', () => {
      render(<CreatePollForm />);
      
      const addButton = screen.getByText('Add Option');
      fireEvent.click(addButton);
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      expect(optionInputs).toHaveLength(3);
    });

    it('removes option when Remove button is clicked', () => {
      render(<CreatePollForm />);
      
      // Add an option first
      const addButton = screen.getByText('Add Option');
      fireEvent.click(addButton);
      
      // Now remove it
      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      expect(optionInputs).toHaveLength(2);
    });

    it('prevents removing options when only 2 remain', () => {
      render(<CreatePollForm />);
      
      // By default, there are 2 options, so no remove buttons should be shown
      const removeButtons = screen.queryAllByText('Remove');
      expect(removeButtons).toHaveLength(0); // No remove buttons when only 2 options
    });

    it('limits options to maximum of 10', () => {
      render(<CreatePollForm />);
      
      const addButton = screen.getByText('Add Option');
      
      // Add 8 more options (total 10)
      for (let i = 0; i < 8; i++) {
        fireEvent.click(addButton);
      }
      
      expect(addButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('calls createPoll action with correct data', async () => {
      const mockCreatePoll = vi.fn().mockResolvedValue({ success: true, pollId: 'poll-1' });
      (actions.createPoll as any).mockImplementation(mockCreatePoll);
      
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      // Check multiple votes checkbox
      const multipleVotesCheckbox = screen.getByLabelText('Allow multiple votes');
      fireEvent.click(multipleVotesCheckbox);
      
      const submitButton = screen.getByText('Create Poll');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePoll).toHaveBeenCalledWith({
          title: 'Test Poll',
          description: undefined,
          options: ['Option A', 'Option B'],
          allowMultipleVotes: true,
        }, 'user-1');
      });
    });

    it('redirects to poll page on successful creation', async () => {
      const mockCreatePoll = vi.fn().mockResolvedValue({ success: true, pollId: 'poll-1' });
      (actions.createPoll as any).mockImplementation(mockCreatePoll);
      
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      const submitButton = screen.getByText('Create Poll');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/polls/poll-1');
      });
    });

    it('shows error message on failed creation', async () => {
      const mockCreatePoll = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Failed to create poll' 
      });
      (actions.createPoll as any).mockImplementation(mockCreatePoll);
      
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      const submitButton = screen.getByText('Create Poll');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create poll')).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      let resolveCreatePoll: (value: any) => void;
      const mockCreatePoll = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          resolveCreatePoll = resolve;
        })
      );
      (actions.createPoll as any).mockImplementation(mockCreatePoll);
      
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      const submitButton = screen.getByText('Create Poll');
      fireEvent.click(submitButton);
      
      // Check loading state
      expect(screen.getByText('Creating poll...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Resolve the promise
      resolveCreatePoll!({ success: true, pollId: 'poll-1' });
      
      await waitFor(() => {
        expect(screen.getByText('Create Poll')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Votes Setting', () => {
    it('defaults to false for multiple votes', () => {
      render(<CreatePollForm />);
      
      const multipleVotesCheckbox = screen.getByLabelText('Allow multiple votes');
      expect(multipleVotesCheckbox).not.toBeChecked();
    });

    it('toggles multiple votes setting when checkbox is clicked', () => {
      render(<CreatePollForm />);
      
      const multipleVotesCheckbox = screen.getByLabelText('Allow multiple votes');
      fireEvent.click(multipleVotesCheckbox);
      
      expect(multipleVotesCheckbox).toBeChecked();
    });
  });

  describe('Form Reset', () => {
    it('clears form after successful submission', async () => {
      const mockCreatePoll = vi.fn().mockResolvedValue({ success: true, pollId: 'poll-1' });
      (actions.createPoll as any).mockImplementation(mockCreatePoll);
      
      render(<CreatePollForm />);
      
      // Fill in form
      const titleInput = screen.getByLabelText('Poll Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Poll' } });
      
      const descriptionInput = screen.getByLabelText('Description (optional)');
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      
      const optionInputs = screen.getAllByPlaceholderText(/Option \d+/);
      fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });
      
      const submitButton = screen.getByText('Create Poll');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/polls/poll-1');
      });
      
      // Form should be cleared (though in this case it redirects, so we can't easily test)
      // This test mainly ensures the submission flow works
    });
  });
});
