from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5000")

    # Force an error by submitting a message that will be rejected by the API
    page.get_by_placeholder("Ask a question...").fill("force-error")
    page.get_by_role("button", name="Send").click()

    # Wait for the error dialog to appear and take a screenshot
    page.wait_for_selector("text=An Error Occurred")
    page.screenshot(path="jules-scratch/verification/error-dialog.png")

    # # Verify the toast notification for file upload
    page.set_input_files('input[type="file"]', 'README.md')
    page.get_by_role("button", name="Send").click()
    page.wait_for_selector("text=File uploaded successfully!")
    page.screenshot(path="jules-scratch/verification/toast-notification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
