import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCard from '../../components/GlassCard';
import '@testing-library/jest-dom';

describe('GlassCard Component', () => {
  it('renders children correctly', () => {
    render(
      <GlassCard>
        <div data-testid="test-content">Test Content</div>
      </GlassCard>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies additional class names when provided', () => {
    const { container } = render(
      <GlassCard className="test-class">
        Test Content
      </GlassCard>
    );
    
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('test-class');
    expect(cardElement).toHaveClass('rounded-xl');
    expect(cardElement).toHaveClass('border-glassBorder');
    expect(cardElement).toHaveClass('bg-glassBg');
  });

  it('applies backdrop filter styles', () => {
    const { container } = render(
      <GlassCard>
        Test Content
      </GlassCard>
    );
    
    const cardElement = container.firstChild;
    expect(cardElement).toHaveStyle('backdrop-filter: blur(20px)');
  });
});
