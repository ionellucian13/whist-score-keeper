import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Whist Românesc title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /Whist Românesc/i });
  expect(titleElement).toBeInTheDocument();
});
