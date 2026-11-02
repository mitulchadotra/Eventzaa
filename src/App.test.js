import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const renderApp = (initialEntries) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
  window.fetch = jest.fn();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('signup, login, and loads the current user from Home on button click', async () => {
  window.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        name: 'Ava Example',
        email: 'ava@example.com',
        phone: '555-0100',
      },
    }),
  });

  renderApp(['/signup']);

  fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
    target: { value: 'Ava Example' },
  });
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'ava@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Create a password'), {
    target: { value: 'secret123' },
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
    target: { value: 'secret123' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText('Welcome Back')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBeNull();

  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'ava@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
    target: { value: 'secret123' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(screen.getByRole('button', { name: 'Load My Profile' })).toBeInTheDocument();
  expect(window.fetch).not.toHaveBeenCalledWith(
    'http://localhost:5000/api/get-user',
    expect.anything()
  );

  fireEvent.click(screen.getByRole('button', { name: 'Load My Profile' }));

  expect(await screen.findByText('Ava Example')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe('user-token');
  expect(window.fetch).toHaveBeenCalledWith(
    'http://localhost:5000/api/get-user',
    expect.objectContaining({
      method: 'GET',
      headers: { Authorization: 'Bearer user-token' },
    })
  );
  expect(screen.getByText('ava@example.com')).toBeInTheDocument();
  expect(screen.getByText('555-0100')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

  await waitFor(() => {
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });
});

test('clears the session and redirects to Login when the token is rejected', async () => {
  localStorage.setItem('token', 'expired-token');
  localStorage.setItem('loggedInUser', JSON.stringify({ name: 'Ava Example' }));
  localStorage.setItem('isLoggedIn', 'true');
  window.fetch.mockResolvedValue({ ok: false, status: 401 });

  renderApp(['/']);
  fireEvent.click(screen.getByRole('button', { name: 'Load My Profile' }));

  expect(await screen.findByText('Welcome Back')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('loggedInUser')).toBeNull();
});
