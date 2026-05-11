import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should show the portfolio owner and search', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('heading', { name: 'Gunwoo Ben Kim' })).toBeTruthy();
    expect(getByRole('textbox', { name: 'Search skills' })).toBeTruthy();
  });

  it('should render the theme toggle', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('button', { name: /theme/i })).toBeTruthy();
  });

  it('should render contact links', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('link', { name: 'Email' }).getAttribute('href')).toBe(
      'mailto:benkim0414@gmail.com'
    );
    expect(getByRole('link', { name: 'LinkedIn' }).getAttribute('href')).toBe(
      'https://www.linkedin.com/in/gunwoobenkim0414'
    );
  });
});
