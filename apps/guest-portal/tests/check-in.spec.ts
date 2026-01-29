import { test, expect } from '@playwright/test';

test.describe('Check-in Flow', () => {

    test('Complete check-in flow with local payment', async ({ page }) => {
        // 1. Visit Check-in page with Booking ID (Simulate QR scan)
        // Note: This relies on the mock data in page.tsx matching ID=1
        await page.goto('/check-in?id=1');

        // 2. Verify Step (Assumes auto-transition from ID step if ID is present)
        // Wait for validation loader to disappear and "Verify" step to appear
        await expect(page.getByText('予約内容の確認')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Guest User')).toBeVisible();

        // Proceed
        await page.getByRole('button', { name: 'はい、間違いありません' }).click();

        // 3. Register Step
        await expect(page.getByRole('heading', { name: '宿泊者名簿' })).toBeVisible();

        // Register step is currently an external link + confirmation button
        // We verify the link exists
        await expect(page.getByRole('link', { name: '名簿入力フォームを開く' })).toBeVisible();

        // Click "I have completed registration" (Mocking the user completion)
        // Wait for button to be clickable
        await page.getByRole('button', { name: '入力完了（次へ）' }).click();

        // 4. Payment Step
        // Note: Register step has a mock delay (1500ms), so we increase timeout
        await expect(page.getByRole('heading', { name: '宿泊者名簿' })).not.toBeVisible({ timeout: 10000 });

        // 4. Payment Step
        await expect(page.getByText('宿泊税のお支払い')).toBeVisible();

        // Choose "Pay at Front Desk" (Local Payment)
        await page.getByRole('button', { name: 'フロントで支払う' }).click();

        // 5. Complete Step
        await expect(page.getByText('チェックイン完了！')).toBeVisible();
        await expect(page.getByText('入室情報')).toBeVisible();
    });

    test('Facility Scoping - ID filtering', async ({ page }) => {
        // Test that scoping logic doesn't crash the page
        // (Actual filtering needs mocked API response, but checking basic load here)
        await page.goto('/check-in?fid=999');

        // Should land on Identify step
        await expect(page.getByText('予約の検索')).toBeVisible();
    });

    test('Online Payment Flow (Stripe)', async ({ page }) => {
        await page.goto('/check-in?id=1');

        // Verify Step
        await expect(page.getByText('予約内容の確認')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'はい、間違いありません' }).click();

        // Register Step
        await expect(page.getByRole('heading', { name: '宿泊者名簿' })).toBeVisible();
        await page.getByRole('button', { name: '入力完了（次へ）' }).click();

        // Payment Step
        // Payment Step
        await expect(page.getByText('宿泊税のお支払い')).toBeVisible();

        // Fill Stripe Element
        // Note: Stripe Elements are in iframes. We need to locate them carefully.
        // We calculate current MM/YY for expiry
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const cvc = Math.floor(100 + Math.random() * 900).toString(); // Random 3 digit

        // Wait for the iframe to load (Payment Element)
        // Usually it has a title like 'Secure payment input frame'
        const frame = page.frameLocator('iframe[title^="Secure payment input frame"]').first();

        // Ensure "Card" tab is selected (if multiple payment methods are shown)
        const cardButton = frame.getByRole('button', { name: 'Card' });
        if (await cardButton.count() > 0) { // Check if button exists (multi-payment mode)
            await cardButton.click();
        }

        // Fill Card Number
        await frame.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242'); // Repeated 4242...

        // Fill Expiry
        await frame.getByPlaceholder('MM / YY').fill(mm + yy);

        // Fill CVC
        await frame.getByPlaceholder('CVC').fill(cvc);

        // Submit
        // Note: The button text contains '支払う' and dynamic price (e.g., '支払う ¥400')
        // We use a regex that matches '支払う' at the start of the string to differentiate from 'フロントで支払う'
        await page.getByRole('button', { name: /^支払う/ }).click();

        // Complete Step
        await expect(page.getByText('チェックイン完了！')).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('入室情報')).toBeVisible();
    });

});
