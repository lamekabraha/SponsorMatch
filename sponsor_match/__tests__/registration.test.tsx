import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterPage from '@/app/register/page';
import { signIn } from 'next-auth/react';

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('RegisterPage AUTH-001', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers with valid details and redirects to onboarding', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    render(<RegisterPage />);

    fireEvent.click(screen.getByRole('button', { name: /community organisation/i }));

    fireEvent.change(screen.getByPlaceholderText(/enter your first name/i), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your organisations name/i), {
      target: { value: 'Community Aid Group' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'SecurePass1!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'SecurePass1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Doe',
          accountName: 'Community Aid Group',
          email: 'jane@example.com',
          password: 'SecurePass1!',
          accountType: 'vcse',
        }),
      }),
    );

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'jane@example.com',
        password: 'SecurePass1!',
        redirect: false,
      }),
    );

    expect(pushMock).toHaveBeenCalledWith('/register/onboarding');
    expect(refreshMock).toHaveBeenCalled();
  });
});
