import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchPage from '@/app/search/page';

const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('../src/app/Components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

jest.mock('../src/app/Components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('../src/app/Components/dashboardSkeletonCampaignCards', () => {
  return function MockCampaignCardSkeleton() {
    return <div data-testid="campaign-skeleton">Loading</div>;
  };
});

jest.mock('../src/app/Components/DashboardCampaignCard', () => ({
  DashboardCampaignCard: ({ title, category }: { title: string; category: string }) => (
    <article>
      <h3>{title}</h3>
      <p>{category}</p>
    </article>
  ),
}));

const campaignsFixture = [
  {
    id: '1',
    title: 'Green Skills Bootcamp',
    org: 'Future VCSE',
    category: 'Environment',
    deadline: '2026-12-31',
    raised: 1000,
    goal: 5000,
    imageUrl: '',
  },
  {
    id: '2',
    title: 'Youth Sports Mentoring',
    org: 'Active Change',
    category: 'Sports and Athletic Coaching',
    deadline: '2026-12-31',
    raised: 500,
    goal: 3000,
    imageUrl: '',
  },
];

const categoriesFixture = ['Environment', 'Sports and Athletic Coaching'];

describe('Search & Filter Matches', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          campaigns: campaignsFixture,
          categories: categoriesFixture,
        },
      }),
    });
  });

  it('shows only campaigns matching keyword query from URL', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('q=green'),
    );

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Green Skills Bootcamp')).toBeInTheDocument();
    });

    expect(screen.queryByText('Youth Sports Mentoring')).not.toBeInTheDocument();
    expect(screen.getByText('1 campaign found')).toBeInTheDocument();
  });

  it('filters campaigns by selected category checkbox', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(''),
    );

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Green Skills Bootcamp')).toBeInTheDocument();
      expect(screen.getByText('Youth Sports Mentoring')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Environment' }));

    await waitFor(() => {
      expect(screen.getByText('Green Skills Bootcamp')).toBeInTheDocument();
      expect(screen.queryByText('Youth Sports Mentoring')).not.toBeInTheDocument();
    });

    expect(screen.getByText('1 campaign found')).toBeInTheDocument();
  });
});
