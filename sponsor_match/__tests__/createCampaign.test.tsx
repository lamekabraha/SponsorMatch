import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewCampaignPage from '@/app/newcampaign/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const pushMock = jest.fn();
const refreshMock = jest.fn();

describe('Create Sponsorship Campaign', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockReset();
    refreshMock.mockReset();

    window.localStorage.setItem('nc_newcampaign_tutorial_seen_v1', '1');

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      refresh: refreshMock,
    });

    (global.fetch as jest.Mock) = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === '/api/newCampaign' && (!init || !init.method || init.method === 'GET')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              packageTypes: [
                { PackageTypeId: 5, PackageType: 'Bronze' },
                { PackageTypeId: 6, PackageType: 'Silver' },
                { PackageTypeId: 7, PackageType: 'Gold' },
              ],
              benefits: [{ BenefitId: 21, Name: 'Social media recognition', Description: '' }],
            },
          }),
        } as Response;
      }

      if (url === '/api/getAccountData') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: [{ Name: 'Sarah VCSE', Address: 'Leeds', Website: 'https://vcse.org' }],
          }),
        } as Response;
      }

      if (url === '/api/newCampaign' && init?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ success: true, campaignId: 123 }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    });
  });

  it('allows adding multiple sponsorship tiers', async () => {
    render(<NewCampaignPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/newCampaign');
      expect(global.fetch).toHaveBeenCalledWith('/api/getAccountData');
    });

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    expect(screen.getByRole('heading', { name: /Funding Goal & Sponsorship Packages/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add Package/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Package/i }));

    const tierNameInputs = screen.getAllByPlaceholderText(/Package title/i);
    expect(tierNameInputs).toHaveLength(3);

    fireEvent.change(tierNameInputs[0], { target: { value: 'Bronze Supporter' } });
    fireEvent.change(tierNameInputs[1], { target: { value: 'Silver Supporter' } });
    fireEvent.change(tierNameInputs[2], { target: { value: 'Gold Supporter' } });

    expect(screen.getByDisplayValue('Bronze Supporter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Silver Supporter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Gold Supporter')).toBeInTheDocument();
  });

  it('submits campaign payload successfully', async () => {
    render(<NewCampaignPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/newCampaign');
      expect(global.fetch).toHaveBeenCalledWith('/api/getAccountData');
    });

    const basicsPanel = screen.getByRole('heading', { name: 'Basics' }).closest('section');
    const basicsInputs = basicsPanel?.querySelectorAll('input.nc-input');
    const categorySelect = basicsPanel?.querySelector('select.nc-input') as HTMLSelectElement | null;

    expect(basicsInputs?.[0]).toBeTruthy();
    expect(categorySelect).toBeTruthy();

    fireEvent.change(basicsInputs![0], { target: { value: 'Community Sports Program' } });
    fireEvent.change(categorySelect!, { target: { value: 'Community Event / Local Activations' } });

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    const numericInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numericInputs[0], { target: { value: '5000' } });
    fireEvent.change(screen.getByPlaceholderText(/Package title/i), { target: { value: 'Bronze Supporter' } });

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.change(screen.getByPlaceholderText(/One-line value proposition/i), {
      target: { value: 'Support youth opportunities in sport and mentoring.' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe the need, beneficiaries, and impact\./i), {
      target: { value: 'We need sponsorship to expand coaching and wellbeing activities.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/newCampaign',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    expect(pushMock).toHaveBeenCalledWith('/VCSE/dashboard');
    expect(refreshMock).toHaveBeenCalled();
  });
});