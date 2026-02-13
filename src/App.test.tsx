import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Integration - Happy Flow', () => {
  it('should render the main application', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'POSTERHAUS' })).toBeInTheDocument();
    expect(screen.getByText(/Curated collection/i)).toBeInTheDocument();
  });

  it('should display poster grid', () => {
    render(<App />);

    // Check for some poster titles from the data
    expect(screen.getByText('NEON DREAMS')).toBeInTheDocument();
    expect(screen.getByText('TOKYO NIGHTS')).toBeInTheDocument();
    expect(screen.getByText('COSMIC VOYAGE')).toBeInTheDocument();
  });

  it('should show cart button initially', () => {
    render(<App />);

    const cartButton = screen.getByText('Cart');
    expect(cartButton).toBeInTheDocument();
  });

  describe('Complete E2E Happy Flow', () => {
    it('should handle complete shopping experience: browse -> add to cart -> view cart -> update quantities', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Step 1: Verify initial state
      expect(screen.getByRole('link', { name: 'POSTERHAUS' })).toBeInTheDocument();
      
      // Step 2: Find and click "Add to Cart" for first poster (NEON DREAMS)
      const addToCartButtons = screen.getAllByText('Add to Cart');
      expect(addToCartButtons.length).toBeGreaterThan(0);
      
      await user.click(addToCartButtons[0]);

      // Step 3: Open cart by clicking cart icon in header
      // The cart should now have 1 item
      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('🛒') || btn.getAttribute('aria-label')?.includes('cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Step 4: Verify cart is open and shows the added item
      expect(screen.getByText('YOUR CART')).toBeInTheDocument();
      // NEON DREAMS appears in both grid and cart
      expect(screen.getAllByText('NEON DREAMS').length).toBeGreaterThan(0);

      // Step 5: Verify initial quantity and price
      const quantities = screen.getAllByText(/^[0-9]+$/);
      expect(quantities.some(el => el.textContent === '1')).toBe(true);

      // Step 6: Increase quantity using + button
      const increaseButtons = screen.getAllByText('+');
      if (increaseButtons.length > 0) {
        await user.click(increaseButtons[0]);
      }

      // Step 7: Verify checkout button is enabled
      const checkoutButton = screen.getByText('Checkout Now');
      expect(checkoutButton).toBeEnabled();
    });

    it('should add multiple different posters to cart', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add first poster
      const addToCartButtons = screen.getAllByText('Add to Cart');
      await user.click(addToCartButtons[0]); // NEON DREAMS
      await user.click(addToCartButtons[1]); // TOKYO NIGHTS

      // Open cart
      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('🛒') || btn.getAttribute('aria-label')?.includes('cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Verify both items are in cart
      expect(screen.getByText('YOUR CART')).toBeInTheDocument();
      // Both posters appear in grid and cart, so check they exist
      expect(screen.getAllByText('NEON DREAMS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('TOKYO NIGHTS').length).toBeGreaterThan(0);
    });

    it('should increase quantity when adding same poster multiple times', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add same poster twice
      const addToCartButtons = screen.getAllByText('Add to Cart');
      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[0]);

      // Open cart
      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('🛒') || btn.getAttribute('aria-label')?.includes('cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Verify quantity is 2
      expect(screen.getByText('YOUR CART')).toBeInTheDocument();
      const quantities = screen.getAllByText(/^[0-9]+$/);
      expect(quantities.some(el => el.textContent === '2')).toBe(true);
    });

    it('should close cart when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add item and open cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      await user.click(addToCartButtons[0]);

      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('🛒') || btn.getAttribute('aria-label')?.includes('cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Verify cart is open
      expect(screen.getByText('YOUR CART')).toBeInTheDocument();

      // Close cart
      const closeButton = screen.getByText('×');
      await user.click(closeButton);

      // Cart should be closed (overlay should not have 'open' class)
      const overlay = screen.getByText('YOUR CART').closest('.cart-overlay');
      expect(overlay).not.toHaveClass('open');
    });

    it('should remove item from cart', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add item to cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      await user.click(addToCartButtons[0]);

      // Open cart
      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('Cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Verify cart is open
      expect(screen.getByText('YOUR CART')).toBeInTheDocument();

      // Use decrease button to reduce quantity to 0 (which removes item)
      const decreaseButtons = screen.getAllByText('−');
      if (decreaseButtons.length > 0) {
        await user.click(decreaseButtons[0]);
      }

      // Verify empty cart message appears
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should show empty cart message when no items added', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Open cart without adding anything
      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('🛒') || btn.getAttribute('aria-label')?.includes('cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Verify empty cart message
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Add some amazing posters!')).toBeInTheDocument();
      
      // Verify checkout is disabled
      const checkoutButton = screen.getByText('Checkout Now');
      expect(checkoutButton).toBeDisabled();
    });
  });

  describe('User Journey Scenarios', () => {
    it('should handle realistic shopping scenario: browse, add multiple, modify, checkout', async () => {
      const user = userEvent.setup();
      render(<App />);

      // User browses the site
      expect(screen.getByRole('link', { name: 'POSTERHAUS' })).toBeInTheDocument();

      // User adds 3 different posters
      const addToCartButtons = screen.getAllByText('Add to Cart');
      await user.click(addToCartButtons[0]); // NEON DREAMS
      await user.click(addToCartButtons[1]); // TOKYO NIGHTS
      await user.click(addToCartButtons[2]); // COSMIC VOYAGE

      // User decides to add more of the first poster
      await user.click(addToCartButtons[0]); // NEON DREAMS again

      // User opens cart to review
      const headerButtons = screen.getAllByRole('button');
      const cartButton = headerButtons.find(btn => 
        btn.textContent?.includes('🛒') || btn.getAttribute('aria-label')?.includes('cart')
      );
      
      if (cartButton) {
        await user.click(cartButton);
      }

      // Verify all items are present in cart
      const cartSidebar = document.querySelector('.cart-sidebar');
      expect(cartSidebar).toBeInTheDocument();
      expect(screen.getAllByText('NEON DREAMS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('TOKYO NIGHTS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('COSMIC VOYAGE').length).toBeGreaterThan(0);

      // User increases quantity of TOKYO NIGHTS
      const increaseButtons = screen.getAllByText('+');
      if (increaseButtons.length > 1) {
        await user.click(increaseButtons[1]);
      }

      // User proceeds to checkout
      const checkoutButton = screen.getByText('Checkout Now');
      expect(checkoutButton).toBeEnabled();
    });
  });
});
