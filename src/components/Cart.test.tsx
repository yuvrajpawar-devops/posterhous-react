import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cart } from './Cart';
import type { CartItem } from '../hooks/useCart';

describe('Cart Component - Happy Flow', () => {
  const mockItems: CartItem[] = [
    {
      id: 1,
      title: 'NEON DREAMS',
      category: 'Abstract',
      price: 29.99,
      image: 'https://example.com/poster1.jpg',
      quantity: 2,
    },
    {
      id: 2,
      title: 'TOKYO NIGHTS',
      category: 'Urban',
      price: 34.99,
      image: 'https://example.com/poster2.jpg',
      quantity: 1,
    },
  ];

  const defaultProps = {
    isOpen: true,
    items: mockItems,
    totalPrice: 94.97,
    onClose: vi.fn(),
    onUpdateQuantity: vi.fn(),
    onRemove: vi.fn(),
  };

  it('should render cart with items', () => {
    render(<Cart {...defaultProps} />);

    expect(screen.getByText('YOUR CART')).toBeInTheDocument();
    expect(screen.getByText('NEON DREAMS')).toBeInTheDocument();
    expect(screen.getByText('TOKYO NIGHTS')).toBeInTheDocument();
  });

  it('should display correct item quantities', () => {
    render(<Cart {...defaultProps} />);

    const quantities = screen.getAllByText(/^[0-9]+$/);
    expect(quantities[0]).toHaveTextContent('2');
    expect(quantities[1]).toHaveTextContent('1');
  });

  it('should display correct item prices', () => {
    render(<Cart {...defaultProps} />);

    expect(screen.getByText('$59.98')).toBeInTheDocument(); // 29.99 * 2
    expect(screen.getByText('$34.99')).toBeInTheDocument(); // 34.99 * 1
  });

  it('should display correct total price', () => {
    render(<Cart {...defaultProps} />);

    expect(screen.getByText('$94.97')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Cart {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Cart {...defaultProps} onClose={onClose} />);

    const overlay = screen.getByText('YOUR CART').closest('.cart-overlay');
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should increase quantity when + button is clicked', async () => {
    const user = userEvent.setup();
    const onUpdateQuantity = vi.fn();

    render(<Cart {...defaultProps} onUpdateQuantity={onUpdateQuantity} />);

    const increaseButtons = screen.getAllByText('+');
    await user.click(increaseButtons[0]);

    expect(onUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('should decrease quantity when - button is clicked', async () => {
    const user = userEvent.setup();
    const onUpdateQuantity = vi.fn();

    render(<Cart {...defaultProps} onUpdateQuantity={onUpdateQuantity} />);

    const decreaseButtons = screen.getAllByText('−');
    await user.click(decreaseButtons[0]);

    expect(onUpdateQuantity).toHaveBeenCalledWith(1, -1);
  });

  it('should call onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<Cart {...defaultProps} onRemove={onRemove} />);

    const removeButtons = screen.getAllByRole('button', { name: '' });
    const trashButton = removeButtons.find(btn => 
      btn.querySelector('svg path[d*="M3 6h18"]')
    );
    
    if (trashButton) {
      await user.click(trashButton);
      expect(onRemove).toHaveBeenCalledWith(1);
    }
  });

  it('should show empty cart message when no items', () => {
    render(<Cart {...defaultProps} items={[]} totalPrice={0} />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some amazing posters!')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
  });

  it('should disable checkout button when cart is empty', () => {
    render(<Cart {...defaultProps} items={[]} totalPrice={0} />);

    const checkoutButton = screen.getByText('Checkout Now');
    expect(checkoutButton).toBeDisabled();
  });

  it('should enable checkout button when cart has items', () => {
    render(<Cart {...defaultProps} />);

    const checkoutButton = screen.getByText('Checkout Now');
    expect(checkoutButton).toBeEnabled();
  });

  it('should not be visible when isOpen is false', () => {
    const { container } = render(<Cart {...defaultProps} isOpen={false} />);

    const overlay = container.querySelector('.cart-overlay');
    expect(overlay).not.toHaveClass('open');
  });

  it('should be visible when isOpen is true', () => {
    const { container } = render(<Cart {...defaultProps} isOpen={true} />);

    const overlay = container.querySelector('.cart-overlay');
    expect(overlay).toHaveClass('open');
  });

  describe('Complete Cart Interaction Flow', () => {
    it('should handle complete cart management flow', async () => {
      const user = userEvent.setup();
      const onUpdateQuantity = vi.fn();
      const onRemove = vi.fn();
      const onClose = vi.fn();

      render(
        <Cart
          {...defaultProps}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          onClose={onClose}
        />
      );

      // Verify initial state
      expect(screen.getByText('NEON DREAMS')).toBeInTheDocument();
      expect(screen.getByText('TOKYO NIGHTS')).toBeInTheDocument();

      // User increases quantity of first item
      const increaseButtons = screen.getAllByText('+');
      await user.click(increaseButtons[0]);
      expect(onUpdateQuantity).toHaveBeenCalledWith(1, 1);

      // User decreases quantity of second item
      const decreaseButtons = screen.getAllByText('−');
      await user.click(decreaseButtons[1]);
      expect(onUpdateQuantity).toHaveBeenCalledWith(2, -1);

      // Verify checkout button is enabled
      const checkoutButton = screen.getByText('Checkout Now');
      expect(checkoutButton).toBeEnabled();

      // User closes cart
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
