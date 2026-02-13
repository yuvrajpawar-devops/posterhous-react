import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterCard } from './PosterCard';
import type { Poster } from '../data/posters';

describe('PosterCard Component - Happy Flow', () => {
  const mockPoster: Poster = {
    id: 1,
    title: 'NEON DREAMS',
    category: 'Abstract',
    price: 29.99,
    originalPrice: 49.99,
    image: 'https://example.com/poster.jpg',
    isBestseller: true,
  };

  const mockOnAddToCart = vi.fn();

  it('should render poster card with all details', () => {
    render(
      <PosterCard
        poster={mockPoster}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('NEON DREAMS')).toBeInTheDocument();
    expect(screen.getByText('Abstract')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('should display poster image with correct alt text', () => {
    render(
      <PosterCard
        poster={mockPoster}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    const image = screen.getByAltText('NEON DREAMS');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/poster.jpg');
  });

  it('should show bestseller badge when isBestseller is true', () => {
    render(
      <PosterCard
        poster={mockPoster}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Bestseller')).toBeInTheDocument();
  });

  it('should show new badge when isNew is true', () => {
    const newPoster = { ...mockPoster, isNew: true, isBestseller: false };
    
    render(
      <PosterCard
        poster={newPoster}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should prioritize New badge over Bestseller badge', () => {
    const newBestsellerPoster = { ...mockPoster, isNew: true, isBestseller: true };
    
    render(
      <PosterCard
        poster={newBestsellerPoster}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.queryByText('Bestseller')).not.toBeInTheDocument();
  });

  it('should not show original price when not provided', () => {
    const posterWithoutDiscount = {
      ...mockPoster,
      originalPrice: undefined,
    };

    render(
      <PosterCard
        poster={posterWithoutDiscount}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.queryByText('$49.99')).not.toBeInTheDocument();
  });

  it('should call onAddToCart when Add to Cart button is clicked', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();

    render(
      <PosterCard
        poster={mockPoster}
        index={0}
        onAddToCart={onAddToCart}
      />
    );

    const addButton = screen.getByText('Add to Cart');
    await user.click(addButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(mockPoster);
  });

  it('should render Quick View button', () => {
    render(
      <PosterCard
        poster={mockPoster}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Quick View')).toBeInTheDocument();
  });

  it('should format price with two decimal places', () => {
    const posterWithWholePrice = {
      ...mockPoster,
      price: 30,
    };

    render(
      <PosterCard
        poster={posterWithWholePrice}
        index={0}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('$30.00')).toBeInTheDocument();
  });

  describe('Multiple Add to Cart Interactions', () => {
    it('should handle multiple clicks on Add to Cart button', async () => {
      const user = userEvent.setup();
      const onAddToCart = vi.fn();

      render(
        <PosterCard
          poster={mockPoster}
          index={0}
          onAddToCart={onAddToCart}
        />
      );

      const addButton = screen.getByText('Add to Cart');
      
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      expect(onAddToCart).toHaveBeenCalledTimes(3);
      expect(onAddToCart).toHaveBeenCalledWith(mockPoster);
    });
  });

  describe('Different Poster Variants', () => {
    it('should render poster without any badges', () => {
      const regularPoster: Poster = {
        id: 2,
        title: 'REGULAR POSTER',
        category: 'Urban',
        price: 24.99,
        image: 'https://example.com/regular.jpg',
      };

      render(
        <PosterCard
          poster={regularPoster}
          index={0}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.queryByText('New')).not.toBeInTheDocument();
      expect(screen.queryByText('Bestseller')).not.toBeInTheDocument();
    });

    it('should render poster with discount', () => {
      render(
        <PosterCard
          poster={mockPoster}
          index={0}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });
  });
});
