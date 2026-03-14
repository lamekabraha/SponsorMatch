import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders the main landing page image', () => {
    render(<HomePage />);
    const img = screen.getByRole('img', { name: 'Side Image' });
    const heading = screen.getByText('How it works:');
    
    expect(img).toHaveAttribute('src', '/LandingPageImage2.png');
    expect(heading).toBeInTheDocument();
  });

});


it('renders homepage unchanged', () => {
  const {container} = render(<HomePage />);
  expect(container).toMatchSnapshot();
});

