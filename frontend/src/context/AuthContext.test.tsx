import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent = () => {
  const { token, userName, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token || 'no-token'}</span>
      <span data-testid="username">{userName || 'no-user'}</span>
      <button onClick={() => login('header.eyJmaXJzdF9uYW1lIjoiQWhtZWQifQ==.signature', 'refresh123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides default values and handles login/logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('token')).toHaveTextContent('no-token');

    await userEvent.click(screen.getByText('Login'));
    
    expect(screen.getByTestId('token')).not.toHaveTextContent('no-token');
    expect(screen.getByTestId('username')).toHaveTextContent('Ahmed');
    expect(localStorage.getItem('access_token')).toBeDefined();
    expect(localStorage.getItem('refresh_token')).toBe('refresh123');

    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});