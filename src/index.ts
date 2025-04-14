import fetch from 'node-fetch';
import { createInterface } from 'readline/promises';
import { CheerioAPI, load } from 'cheerio';
import notifier from 'node-notifier';

// CLI prompt setup
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Config
const outOfStockKeywords = [
  'sold out',
  'unavailable',
  'notify me',
  'out of stock',
  'backorder',
  'currently unavailable',
  'not available',
  'discontinued',
];
const inStockKeywords = [
  'add to cart',
  'buy now',
  'in stock',
  'available',
  'purchase',
  'shop now',
  'order now',
  'add to bag',
];
const checkIntervalMs = 5 * 60 * 1000; // 5 minutes
let wasOutOfStock = false;

// Prompt for URL
async function promptUrl(): Promise<string> {
  const url = await rl.question('Enter the product URL: ');
  if (url.startsWith('http')) {
    return url;
  }
  console.log('Please enter a valid URL (e.g., https://example.com).');
  return promptUrl();
}

// Countdown timer
function startCountdown(): void {
  let timeLeft = checkIntervalMs / 1000;
  process.stdout.write('Next check in: ');

  const timer = setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Next check in: ${timeLeft}s`);
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
  }, 1000);
}

// Notify with error handling
async function sendNotification(title: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    notifier.notify(
      {
        title,
        message,
        sound: true,
        wait: false,
      },
      (err, response) => {
        if (err) {
          console.error('Notification error:', err);
          reject(err);
        } else {
          console.log('Notification sent:', response);
          resolve();
        }
      }
    );
  });
}

// Check stock
async function checkStock(url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const text = await response.text();
    const $: CheerioAPI = load(text);

    const stockSection = $(
      'form[action*="/cart"] button, ' +
      'form[action*="/cart"] input[type="submit"], ' +
      'button, ' +
      'span, ' +
      'div[class*="stock"], ' +
      'div[class*="sold"], ' +
      'div[class*="available"], ' +
      'div[class*="product"], ' +
      'input[value*="cart"], ' +
      'input[value*="buy"]'
    ).text().toLowerCase();

    const isOutOfStock = outOfStockKeywords.some((kw) => stockSection.includes(kw));
    const isInStock = inStockKeywords.some((kw) => stockSection.includes(kw));

    if (isOutOfStock) {
      console.log('Item is OUT of stock.');
      console.log('Matched keyword:', outOfStockKeywords.find((kw) => stockSection.includes(kw)));
      wasOutOfStock = true;
    } else if (isInStock) {
      console.log('Item is IN stock.');
      console.log('Matched keyword:', inStockKeywords.find((kw) => stockSection.includes(kw)));
      if (wasOutOfStock) {
        console.log('🎉 Item is BACK IN STOCK!');
        await sendNotification('Stock Alert', `Item is back in stock at ${url}`);
        wasOutOfStock = false;
        setTimeout(() => process.exit(0), 1000); // Delay exit
      }
    } else {
      console.log('Stock status unclear (keywords not found).');
      console.log('Debug stockSection:', stockSection || 'No text found');
      console.log(
        'Debug elements:',
        $('form, button, span, div[class*="product"], input')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter((t) => t)
          .join(' | ')
      );
    }

    startCountdown();
    setTimeout(() => checkStock(url), checkIntervalMs);
  } catch (error: unknown) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    startCountdown();
    setTimeout(() => checkStock(url), checkIntervalMs);
  }
}

// Start
(async () => {
  // Test notification
  console.log('Testing notification...');
  try {
    await sendNotification('Test Notification', 'Checking if notifications work');
  } catch (err) {
    console.error('Test notification failed:', err);
  }

  console.log('Starting stock checker...');
  const url = await promptUrl();
  console.log(`Monitoring: ${url}`);
  await checkStock(url);
})();