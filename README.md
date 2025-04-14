# Stock Checker

A simple Node.js script to monitor the stock status of a product on a webpage.

## Prerequisites

- **Node.js**: You'll need Node.js installed on your system. Download and install it from [nodejs.org](https://nodejs.org/).

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd stock-checker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Run the Script**:
   ```bash
   npm start
   ```

2. **Enter Product URL**:
   -Dismiss the test windows notification
   - When prompted, enter the URL of the product page you want to monitor.

3. **Monitor Stock**:
   - The script will check the stock status every 5 minutes and notify you if the item is back in stock.

## Notes

- Ensure you have the necessary permissions to run the script and access the internet.
- The script uses keywords to determine stock status, which might not work for all websites.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.