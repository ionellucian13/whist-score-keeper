import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // No assertions, just checking that it renders without errors
  expect(true).toBeTruthy();
});
