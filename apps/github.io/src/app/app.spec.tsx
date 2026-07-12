import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the generic app shell', () => {
    const { getByLabelText, getByRole, getByText } = render(<App />);

    expect(
      getByRole('heading', { level: 1, name: 'Generic Layout Skeleton' })
    ).toBeTruthy();
    expect(getByRole('link', { name: 'Home' }).textContent).toBe('App Shell');
    expect(getByLabelText('Primary navigation')).toBeTruthy();
    expect(getByText('Footer Region')).toBeTruthy();
  });
});
