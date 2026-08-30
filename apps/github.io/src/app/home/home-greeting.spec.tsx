import { act, fireEvent, render } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HomeGreeting } from './home-greeting';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  sessionStorage.clear();
  document.getElementById('dora-capabilities-title')?.remove();
  vi.useRealTimers();
});

describe('HomeGreeting', () => {
  it('reveals the complete conversation within the configured sequence duration', () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <HomeGreeting />
      </Theme>,
    );

    act(() => vi.advanceTimersByTime(1_050));

    expect(getByRole('link', { name: 'Explore skills' })).toBeTruthy();
  });

  it('shows the complete accessible conversation immediately when motion is reduced', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { getByRole, getByText } = render(
      <Theme theme={neutralTheme}>
        <HomeGreeting />
      </Theme>,
    );

    expect(getByRole('region', { name: 'Welcome message' })).toBeTruthy();
    expect(
      document.querySelectorAll('.astryx-chat-message-bubble'),
    ).toHaveLength(3);
    expect(getByText("G'day, mate 👋")).toBeTruthy();
    expect(
      getByText(
        'Welcome to my engineering practice. Browse the skills and evidence behind my work.',
      ),
    ).toBeTruthy();
    expect(getByRole('list').children).toHaveLength(2);
    expect(
      getByRole('link', { name: 'Explore skills' }).getAttribute('href'),
    ).toBe('/skills');
    expect(
      getByRole('link', { name: 'View DORA capabilities' }).getAttribute('href'),
    ).toBe('#dora-capabilities-title');
  });

  it('presents the greeting as a contained conversation with assistant identity', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { container, getByRole, getByText } = render(
      <Theme theme={neutralTheme}>
        <HomeGreeting />
      </Theme>,
    );

    const card = container.querySelector('.astryx-card');

    expect(card).toBeTruthy();
    expect(card?.getAttribute('data-variant')).toBe('muted');
    expect(getByRole('img', { name: 'Gunwoo Ben Kim' })).toBeTruthy();
    expect(getByText('Gunwoo Ben Kim')).toBeTruthy();
  });

  it('uses Astryx links for the capability navigation', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <HomeGreeting />
      </Theme>,
    );

    expect(
      getByRole('link', { name: 'Explore skills' }).firstElementChild?.tagName,
    ).toBe('SPAN');
    expect(
      getByRole('link', { name: 'View DORA capabilities' }).firstElementChild
        ?.tagName,
    ).toBe('SPAN');
  });

  it('shows all messages without replaying after the session has seen the greeting', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    sessionStorage.setItem('home-greeting-seen', 'true');

    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <HomeGreeting />
      </Theme>,
    );

    expect(getByRole('link', { name: 'Explore skills' })).toBeTruthy();
  });

  it('scrolls to DORA capabilities when its greeting link is clicked', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const doraHeading = document.createElement('h2');
    doraHeading.id = 'dora-capabilities-title';
    doraHeading.scrollIntoView = vi.fn();
    document.body.append(doraHeading);
    sessionStorage.setItem('home-greeting-seen', 'true');

    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <HomeGreeting />
      </Theme>,
    );

    fireEvent.click(getByRole('link', { name: 'View DORA capabilities' }));

    expect(doraHeading.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
