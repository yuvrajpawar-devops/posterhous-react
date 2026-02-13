import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';
import type { Poster } from '../data/posters';

describe('useCart Hook - Happy Flow', () => {
  const mockPoster1: Poster = {
    id: 1,
    title: 'Test Poster 1',
    category: 'Abstract',
    price: 29.99,
    image: 'https://example.com/poster1.jpg',
  };

  const mockPoster2: Poster = {
    id: 2,
    title: 'Test Poster 2',
    category: 'Urban',
    price: 34.99,
    image: 'https://example.com/poster2.jpg',
  };

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.isOpen).toBe(false);
  });

  it('should add a new item to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      ...mockPoster1,
      quantity: 1,
    });
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(29.99);
  });

  it('should increase quantity when adding same item twice', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
      result.current.addToCart(mockPoster1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(59.98);
  });

  it('should add multiple different items to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
      result.current.addToCart(mockPoster2);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(64.98);
  });

  it('should update quantity correctly', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
    });

    act(() => {
      result.current.updateQuantity(mockPoster1.id, 2);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBe(89.97);
  });

  it('should decrease quantity when updating with negative delta', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
      result.current.addToCart(mockPoster1);
      result.current.addToCart(mockPoster1);
    });

    act(() => {
      result.current.updateQuantity(mockPoster1.id, -1);
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(59.98);
  });

  it('should remove item when quantity reaches zero via updateQuantity', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
    });

    act(() => {
      result.current.updateQuantity(mockPoster1.id, -1);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1);
      result.current.addToCart(mockPoster2);
    });

    act(() => {
      result.current.removeFromCart(mockPoster1.id);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(mockPoster2.id);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(34.99);
  });

  it('should open and close cart', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should calculate correct totals with multiple items and quantities', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockPoster1); // 29.99 x 1
      result.current.addToCart(mockPoster1); // 29.99 x 2
      result.current.addToCart(mockPoster2); // 34.99 x 1
      result.current.addToCart(mockPoster2); // 34.99 x 2
      result.current.addToCart(mockPoster2); // 34.99 x 3
    });

    expect(result.current.totalItems).toBe(5);
    expect(result.current.totalPrice).toBeCloseTo(164.95, 2); // (29.99 * 2) + (34.99 * 3)
  });

  describe('Complete Happy Flow Scenario', () => {
    it('should handle complete shopping flow: browse -> add -> update -> checkout', () => {
      const { result } = renderHook(() => useCart());

      // Step 1: User browses and adds first poster
      act(() => {
        result.current.addToCart(mockPoster1);
      });
      expect(result.current.totalItems).toBe(1);

      // Step 2: User adds another poster
      act(() => {
        result.current.addToCart(mockPoster2);
      });
      expect(result.current.totalItems).toBe(2);

      // Step 3: User decides to add more of the first poster
      act(() => {
        result.current.addToCart(mockPoster1);
      });
      expect(result.current.items.find(item => item.id === 1)?.quantity).toBe(2);

      // Step 4: User opens cart to review
      act(() => {
        result.current.openCart();
      });
      expect(result.current.isOpen).toBe(true);

      // Step 5: User increases quantity of second poster
      act(() => {
        result.current.updateQuantity(mockPoster2.id, 1);
      });
      expect(result.current.items.find(item => item.id === 2)?.quantity).toBe(2);

      // Step 6: User verifies final totals before checkout
      expect(result.current.totalItems).toBe(4); // 2 + 2
      expect(result.current.totalPrice).toBeCloseTo(129.96, 2); // (29.99 * 2) + (34.99 * 2)
      expect(result.current.items).toHaveLength(2);
    });

    it('should handle add, remove, and re-add flow', () => {
      const { result } = renderHook(() => useCart());

      // Add item
      act(() => {
        result.current.addToCart(mockPoster1);
      });
      expect(result.current.totalItems).toBe(1);

      // Remove item
      act(() => {
        result.current.removeFromCart(mockPoster1.id);
      });
      expect(result.current.totalItems).toBe(0);

      // Re-add item (should start fresh with quantity 1)
      act(() => {
        result.current.addToCart(mockPoster1);
      });
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.totalItems).toBe(1);
    });
  });
});
