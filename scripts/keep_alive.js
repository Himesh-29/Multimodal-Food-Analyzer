const puppeteer = require('puppeteer');

const TARGET_URL = 'https://multimodal-food-analyzer-himesh.streamlit.app/?heartbeat=1';
const TIMEOUT = 60000; // 60 seconds

async function run() {
    console.log(`[INFO] Launching browser to check: ${TARGET_URL}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const page = await browser.newPage();
        
        // Capture browser console logs
        page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
        
        page.setDefaultNavigationTimeout(TIMEOUT);
        page.setDefaultTimeout(TIMEOUT);

        console.log('[INFO] Navigating to page...');
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

        // Helper to check text across all frames
        const checkTextInFrames = async (text) => {
            for (const frame of page.frames()) {
                try {
                    const content = await frame.content();
                    if (content.includes(text)) return true;
                } catch (e) { /* ignore detached frames */ }
            }
            return false;
        };

        // 1. Wait for "App is alive" (Success)
        try {
            console.log('[INFO] Checking for success marker...');
            await page.waitForFunction(
                async () => {
                    // This function runs in browser context, but we need to check frames from Node context usually.
                    // Puppeteer waitForFunction is tricky with frames. 
                    // Simpler approach: poller loop in Node.
                    return false; 
                }, 
                { timeout: 100 } // fast fail to enter custom poller
            ).catch(() => {});

            // Custom poller for frames
            const startTime = Date.now();
            while (Date.now() - startTime < TIMEOUT) {
                if (await checkTextInFrames("App is alive")) {
                    console.log('SUCCESS: App is explicitly reporting alive!');
                    return;
                }
                await new Promise(r => setTimeout(r, 2000));
            }
            console.log('[DEBUG] Success marker not found within timeout.');
        } catch (e) {
            console.log('[DEBUG] Error checking for success marker:', e);
        }

        // 2. Check for "Wake up" button (Hibernation)
        try {
            console.log('[INFO] Checking for Wake Up button...');
            // Check all frames for button
            for (const frame of page.frames()) {
                const wakeUpButton = await frame.$("button");
                if (wakeUpButton) {
                    const text = await frame.evaluate(el => el.innerText, wakeUpButton);
                    if (text.includes("Yes, get this app back up") || text.includes("Wake app up")) {
                        console.log('[ALERT] FOUND WAKE UP BUTTON! Clicking it...');
                        await wakeUpButton.click();
                        // Wait for reboot
                        await new Promise(r => setTimeout(r, 60000)); 
                        if (await checkTextInFrames("App is alive")) {
                            console.log('SUCCESS: App woke up!');
                            return;
                        }
                    }
                }
            }
        } catch (e) {
            console.log('[DEBUG] No wake up button found:', e.message);
        }

        // Final Verification
        if (await checkTextInFrames("App is alive") || await checkTextInFrames("Recipe & Nutrition")) {
             console.log('SUCCESS: App seems to be running normal UI.');
        } else {
            console.error('FAILURE: Could NOT verify app state.');
            // Dump root HTML to see what IS rendered
            try {
                const rootHtml = await page.$eval('#root', el => el.innerHTML);
                console.error('--- #ROOT HTML START ---');
                console.error(rootHtml.substring(0, 1000));
                console.error('--- #ROOT HTML END ---');
            } catch(e) {
                console.error('Could not dump #root:', e.message);
            }
            throw new Error('App down or not responding with expected content');
        }

    } catch (error) {
        console.error('FATAL ERROR:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

run();
