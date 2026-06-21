import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import * as api from '../api/client';
import { AuthProvider } from '../context/AuthContext';

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button>Mock Google Login</button>
}));

vi.mock('../api/client', () => ({
  login: vi.fn(),
  googleLogin: vi.fn(),
}));

describe('Login Component', () => {
  test('shows error on failed login', async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error('Invalid req'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/EMAIL ADDRESS/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/PASSWORD/i), 'wrongpass');
    
    await userEvent.click(screen.getByRole('button', { name: /^Login$/i }));
    expect(await screen.findByText(/Invalid/i)).toBeInTheDocument();
  });
});