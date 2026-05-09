import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getAllByText } = render(<App />);
    expect(getAllByText(/Welcome github\.io/i).length > 0).toBeTruthy();
  });

  it('should render the theme toggle', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('button', { name: /theme/i })).toBeTruthy();
  });
});
