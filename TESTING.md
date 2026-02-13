# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests once (for CI/CD)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui
```

## Test Files Structure

```
src/
├── hooks/
│   ├── useCart.ts
│   └── useCart.test.ts          # Cart hook tests (12 tests)
├── components/
│   ├── Cart.tsx
│   ├── Cart.test.tsx            # Cart component tests (15 tests)
│   ├── PosterCard.tsx
│   └── PosterCard.test.tsx      # PosterCard tests (12 tests)
├── App.tsx
├── App.test.tsx                 # Integration tests (10 tests)
└── test/
    └── setup.ts                 # Test configuration
```

## What's Being Tested

### Happy Flow Coverage

Our test suite focuses on the primary user journey:

1. **Browse Products** → User views poster collection
2. **Add to Cart** → User selects posters to purchase
3. **Review Cart** → User opens cart and reviews selections
4. **Modify Quantities** → User adjusts item quantities
5. **Proceed to Checkout** → User can checkout when ready

### Test Categories

#### Unit Tests
- `useCart.test.ts` - Cart state management logic
- `PosterCard.test.tsx` - Product card rendering and interactions
- `Cart.test.tsx` - Cart UI component behavior

#### Integration Tests
- `App.test.tsx` - End-to-end user flows

## Example Test Scenarios

### Scenario 1: Adding Items to Cart
```typescript
// User adds a poster to cart
await user.click(addToCartButton);

// Cart count increases
expect(totalItems).toBe(1);

// Price is calculated correctly
expect(totalPrice).toBe(29.99);
```

### Scenario 2: Managing Quantities
```typescript
// Add same item twice
await user.click(addToCartButton);
await user.click(addToCartButton);

// Quantity aggregates (not 2 separate items)
expect(items).toHaveLength(1);
expect(items[0].quantity).toBe(2);
```

### Scenario 3: Complete Shopping Flow
```typescript
// 1. Add multiple items
await user.click(addToCartButtons[0]);
await user.click(addToCartButtons[1]);

// 2. Open cart
await user.click(cartButton);

// 3. Modify quantities
await user.click(increaseButton);

// 4. Verify checkout is enabled
expect(checkoutButton).toBeEnabled();
```

## Writing New Tests

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.ts`
- Place test files next to the code they test

### Test Structure
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component Name - Happy Flow', () => {
  it('should do something when user interacts', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    // Arrange - setup initial state
    // Act - perform user actions
    // Assert - verify expected outcome
  });
});
```

### Best Practices

1. **Test User Behavior, Not Implementation**
   ```typescript
   // ✅ Good - tests what user sees
   expect(screen.getByText('Add to Cart')).toBeInTheDocument();
   
   // ❌ Bad - tests implementation details
   expect(component.state.isVisible).toBe(true);
   ```

2. **Use Accessible Queries**
   ```typescript
   // ✅ Good - accessible queries
   screen.getByRole('button', { name: 'Add to Cart' });
   screen.getByLabelText('Email');
   
   // ⚠️ Use sparingly - less accessible
   screen.getByTestId('cart-button');
   ```

3. **Simulate Real User Interactions**
   ```typescript
   // ✅ Good - realistic user interaction
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, 'text');
   
   // ❌ Bad - direct state manipulation
   component.setState({ value: 'text' });
   ```

4. **Test Happy Flows First**
   - Focus on the primary user journey
   - Ensure core functionality works
   - Add edge case tests later

## Debugging Tests

### View Test Output
```bash
# Run specific test file
npm test -- useCart.test.ts

# Run tests matching pattern
npm test -- --grep "should add item"

# Run with verbose output
npm test -- --reporter=verbose
```

### Common Issues

**Issue**: Test can't find element
```typescript
// Solution: Use screen.debug() to see rendered output
render(<Component />);
screen.debug(); // Prints current DOM
```

**Issue**: Async operations not completing
```typescript
// Solution: Use waitFor or findBy queries
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Or use findBy (automatically waits)
const element = await screen.findByText('Loaded');
```

**Issue**: Multiple elements found
```typescript
// Solution: Use getAllBy and select specific element
const buttons = screen.getAllByText('Add to Cart');
await user.click(buttons[0]); // Click first button
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run"
    }
  }
}
```

## Test Results

Current Status: **All 49 tests passing** ✅

- useCart Hook: 12/12 ✅
- Cart Component: 15/15 ✅
- PosterCard Component: 12/12 ✅
- App Integration: 10/10 ✅

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro)

## Support

For questions or issues with tests:
1. Check test output for specific error messages
2. Use `screen.debug()` to inspect rendered DOM
3. Review existing test files for examples
4. Consult the documentation links above
