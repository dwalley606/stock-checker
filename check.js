import fetch from 'node-fetch';
import readline from 'readline';

// CLI prompt setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Config
const outOfStockKeywords = ['out of stock', 'currently unavailable', 'sold out'];
const inStockKeywords = ['add to cart', 'in stock'];
const checkIntervalMs = 5 * 60 * 1000; // 5 minutes
let wasOutOfStock = false;

// Prompt for URL
function promptUrl() {
  return new Promise((resolve) => {
    rl.question('Enter the product URL: ', (url) => {
      if (url.startsWith('http')) {
        resolve(url);
      } else {
        console.log('Please enter a valid URL (e.g., https://example.com).');
        resolve(promptUrl()); // Retry on invalid input
      }
    });
  });
}

// Countdown timer
function startCountdown() {
  let timeLeft = checkIntervalMs / 1000; // Seconds
  process.stdout.write('Next check in: ');

  const timer = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Next check in: ${timeLeft}s`);
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }
  }, 1000);
}

// Check stock
async function checkStock(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      },
    });
    const text = await response.text();
    const lowerText = text.toLowerCase();

    const isOutOfStock = outOfStockKeywords.some((kw) => lowerText.includes(kw));
    const isInStock = inStockKeywords.some((kw) => lowerText.includes(kw));

    if (isOutOfStock) {
      console.log('Item is OUT of stock.');
      wasOutOfStock = true;
    } else if (isInStock) {
      console.log('Item is IN stock.');
      if (wasOutOfStock) {
        console.log('🎉 Item is BACK IN STOCK!');
        wasOutOfStock = false;
        process.exit(0); // Stop script
      }
    } else {
      console.log('Stock status unclear (keywords not found).');
    }

    startCountdown();
    setTimeout(() => checkStock(url), checkIntervalMs);
  } catch (error) {
    console.error('Error:', error.message);
    startCountdown();
    setTimeout(() => checkStock(url), checkIntervalMs);
  }
}

// Start
(async () => {
  console.log('Starting stock checker...');
  const url = await promptUrl();
  console.log(`Monitoring: ${url}`);
  checkStock(url);
})();