import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the application title after loading local data', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'TaPago' })).toBeInTheDocument();
});
