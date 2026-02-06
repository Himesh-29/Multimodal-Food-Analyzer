const puppeteer = require('puppeteer');

const TARGET_URL = 'https://multimodal-food-analyzer-himesh.streamlit.app/?heartbeat=1';
const TIMEOUT = 60000; // 60 seconds

async function run() {
    console.log(`[INFO] Launching browser to check: ${TARGET_URL}`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // extend timeout
        page.setDefaultNavigationTimeout(TIMEOUT);
        page.setDefaultTimeout(TIMEOUT);

        console.log('[INFO] Navigating to page...');
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

        // Check for "App is alive" text (Success case)
        try {
            console.log('[INFO] checking for success marker...');
            // Wait a bit for Streamlit to render
            await new Promise(r => setTimeout(r, 2000));
            
            const content = await page.content();
            if (content.includes("✅ App is alive")) {
                console.log('SUCCESS: App is explicitly reporting alive!');
                return;
            }
        } catch (e) {
            console.log('[DEBUG] exact success marker check failed, continuing generic checks');
        }

        // Check for "Wake up" button (Hibernation case)
        try {
            // Streamlit's "Yes, get this app back up!" button might be in an iframe or main DOM
            // We search for buttons with specific text
            const wakeUpButton = await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.find(b => b.innerText.includes('Yes, get this app back up!') || b.innerText.includes('Wake app up'));
            });

            if (wakeUpButton && wakeUpButton.asElement()) {
                console.log('[ALERT] FOUND WAKE UP BUTTON! Clicking it...');
                await wakeUpButton.asElement().click();
                
                // Wait for wake up
                console.log('[INFO] Waiting for app to wake up (this may take a while)...');
                await page.waitForFunction(
                    () => document.body.innerText.includes('App is alive') || document.body.innerText.includes('Recipe'), 
                    { timeout: 120000 } // Give it 2 mins to boot
                );
                console.log('SUCCESS: App woke up and loaded!');
                return;
            }
        } catch (e) {
            console.log('[DEBUG] No wake up button found or click failed:', e.message);
        }

        // Final Verification
        const content = await page.content();
        if (content.includes("App is alive") || content.includes("Recipe & Nutrition")) {
             console.log('SUCCESS: App seems to be running normal UI.');
        } else {
            console.error('FAILURE: Could NOT verify app state. Dumping content snippet:');
            console.error(content.substring(0, 500));
            throw new Error('App down or not responding with expected content');
        }

    } catch (error) {
        console.error('FATAL ERROR:', error);
        process.exit(1); // Fail the action
    } finally {
        await browser.close();
    }
}

run();
