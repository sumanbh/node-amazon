import { test, expect } from '@playwright/test';
import { Navbar } from './pages/navbar';
import { LoginPage } from './pages/login.page';

test.describe('Auth Page Refresh Scenario', () => {
  test('should keep session and not redirect to login page on page refresh', async ({ page }) => {
    const navbar = new Navbar(page);
    const loginPage = new LoginPage(page);

    // Navigate to login
    await page.goto('/demo/login');
    await loginPage.verifyOnLoginPage();

    // Log in
    await loginPage.login('demo@sumanb.com', 'hunter2');

    // After login, we should be on the main page
    await expect(page).toHaveURL(/\/demo\//);
    await navbar.verifyLoggedIn('Johnny');

    // Go to the orders page (behind auth)
    await page.goto('/demo/user/orders');
    await expect(page).toHaveURL(/\/demo\/user\/orders/);

    // Refresh the page
    await page.reload();

    // Verify we remain on the orders page and are not redirected to login
    await expect(page).toHaveURL(/\/demo\/user\/orders/);
    await navbar.verifyLoggedIn('Johnny');

    // Go to user settings page (behind auth)
    await page.goto('/demo/user/settings');
    await expect(page).toHaveURL(/\/demo\/user\/settings/);

    // Refresh settings page
    await page.reload();

    // Verify we remain on the settings page and are not redirected to login
    await expect(page).toHaveURL(/\/demo\/user\/settings/);
    await navbar.verifyLoggedIn('Johnny');
  });
});
