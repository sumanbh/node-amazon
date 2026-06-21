import { test, expect } from '@playwright/test';
import { Navbar } from './pages/navbar';
import { HomePage } from './pages/home.page';
import { ProductPage } from './pages/product.page';
import { LoginPage } from './pages/login.page';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';
import { OrdersPage } from './pages/orders.page';

test.describe('Order Flow Scenario', () => {
  test('should complete the order flow workflow', async ({ page }) => {
    const navbar = new Navbar(page);
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const loginPage = new LoginPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const ordersPage = new OrdersPage(page);

    // --- Step 4.3: Navigate to Product Detail Page ---
    await homePage.navigate();
    await homePage.clickProduct(0);
    await expect(page).toHaveURL(/\/demo\/product\/[A-Za-z0-9_-]+/);
    
    const productName = await productPage.getProductName();
    expect(productName.length).toBeGreaterThan(0);
    const productPrice = await productPage.getPrice();
    expect(productPrice).toContain('$');

    // --- Step 4.4: Add to Cart (Unauthenticated -> Login Redirect) ---
    await productPage.setQuantity(2);
    await productPage.addToCart();
    
    // Should redirect to login with returnUrl
    await loginPage.verifyOnLoginPage();
    await expect(page).toHaveURL(/.*returnUrl=%2Fproduct%2F[A-Za-z0-9_-]+/);

    // --- Step 4.5: Login with Default User ---
    await expect(loginPage.emailInput).toHaveValue('demo@sumanb.com');
    await expect(loginPage.passwordInput).toHaveValue('hunter2');
    await loginPage.login();
    
    // Redirect back to product page
    await expect(page).toHaveURL(/\/demo\/product\/[A-Za-z0-9_-]+/);
    await navbar.verifyLoggedIn('Johnny');

    // --- Step 4.6: Add to Cart (Authenticated) ---
    // Make sure we select quantity 2 again since page reloaded
    await productPage.setQuantity(2);
    await productPage.addToCart();
    await productPage.waitForToast();
    await navbar.verifyCartCount(2);

    // --- Step 4.7: Navigate to Cart & Verify Contents ---
    await navbar.clickCart();
    await expect(page).toHaveURL(/\/demo\/user\/cart/);
    
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(page.locator('.cart-container .is-flex .name-container a')).toHaveText(productName);
    await expect(page.locator('.cart-container .is-flex .quantity-container b')).toHaveText('Qty: 2');

    // --- Step 4.8: Delete from Cart ---
    await cartPage.deleteItem(0);
    await expect(page.locator('button.cart-remove')).toHaveCount(0);
    await cartPage.verifyEmptyCart();
    await expect(cartPage.subtotalText).toHaveText('$0.00');

    // --- Step 4.9: Re-add a Product for Checkout ---
    await homePage.navigate();
    await homePage.clickProduct(0);
    await expect(page).toHaveURL(/\/demo\/product\/[A-Za-z0-9_-]+/);
    const checkoutProdName = await productPage.getProductName();
    const checkoutProdPrice = await productPage.getPrice();
    await productPage.setQuantity(1);
    await productPage.addToCart();
    await productPage.waitForToast();
    await navbar.verifyCartCount(1);

    // --- Step 4.10: Checkout ---
    await navbar.clickCart();
    await expect(page).toHaveURL(/\/demo\/user\/cart/);
    await expect(cartPage.cartItems).toHaveCount(1);

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/\/demo\/user\/checkout/);
    
    await checkoutPage.verifyPrefilledName('Johnny Utah');
    await checkoutPage.fillShippingInfo({
      address: '123 Test Street',
      city: 'Seattle',
      state: 'WA',
      zip: '98101'
    });
    
    await expect(checkoutPage.reviewItemsHeader).toBeVisible();
    const checkoutProdNameInReview = await page.locator('.orders-container .checkout-elements .name-container a').textContent();
    expect(checkoutProdNameInReview?.trim()).toEqual(checkoutProdName);
    
    const checkoutTotal = await checkoutPage.getOrderTotal();
    expect(checkoutTotal).toContain(checkoutProdPrice);
    
    await checkoutPage.placeOrder();

    // --- Step 4.11: Verify Order on Orders Page ---
    await expect(page).toHaveURL(/\/demo\/user\/orders/);
    await expect(ordersPage.pageTitle).toBeVisible();
    await ordersPage.verifyOrderExists();
    await expect(ordersPage.orderCards.first()).toBeVisible();
    await ordersPage.verifyOrderContainsProduct(checkoutProdName);
    
    // Order total check
    const totalElem = ordersPage.orderCards.first().locator('.total-container .child-one');
    await expect(totalElem).toContainText(checkoutProdPrice);

    // Shipping info dropdown check
    const shipToLink = page.locator('.orders-container .shipto-container a').first();
    await shipToLink.click();
    
    const shipToMenu = page.locator('.orders-container .shipto-container ul.dropdown-menu').first();
    await expect(shipToMenu).toBeVisible();
    await expect(shipToMenu.locator('b')).toHaveText('Johnny Utah');
    await expect(shipToMenu).toContainText('123 Test Street');
    await expect(shipToMenu).toContainText('Seattle, WA, 98101');
  });
});
