import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Basic React test', () => {
  it('should render without crashing', () => {
    render(<div data-testid="test-element">Test Component</div>);
    const element = screen.getByTestId('test-element');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Test Component');
  });
}); 