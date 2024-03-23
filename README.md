Puppeteer Project README
Etsy Scraper
This script automates data extraction and interaction with the Etsy website. It navigates through the site, extracts product information, and simulates a user journey from product discovery to checkout.

Project Setup Instructions
To set up the project, follow these steps:

Install Node.js if not already installed.
Clone the repository to your local machine.
Ensure you have Node.js installed on your system.
Install the necessary dependencies using npm:
npm install
Make sure you have a stable internet connection.
Run the project using the following command:
node index.js
Assumptions Made During Development
Website Structure: It is assumed that the structure of the Etsy website, particularly the search results page and product detail pages, remains consistent during the scraping process.
Data Availability: The assumption is made that all required data, including product names, prices, URLs, descriptions, image URLs, and available sizes, is accessible and consistent across different product listings.
Error Handling: It is assumed that error scenarios, such as missing elements or network issues, are handled gracefully within the codebase to prevent script failures.
## Project Overview

### Challenges Faced:

1. **Familiarity with Puppeteer and TypeScript**: Lack of prior experience with Puppeteer and TypeScript posed initial hurdles. This was mitigated by studying the documentation and referring to tutorials to grasp the fundamentals.

2. **Handling Platform Differences**: Realization that selectors and processes varied between desktop and mobile platforms required adaptation. To address this, the application was run and pages were inspected dynamically.

3. **Inconsistent Product Display**: The Etsy homepage did not consistently display ten products, which affected the scraping process. This was resolved by initiating the scrape from pages with a higher number of products.

4. **Duplicate Product Names**: A challenge arose when it was discovered that both product descriptions and names were identical. The decision was made to use the name of the product sharer as the product name to differentiate.

5. **Complexity of HTML `<select>` Tags**: Dealing with variations in HTML `<select>` tags, such as having one or two tags or a combination with a textarea, presented a significant challenge. A delay function was implemented, with a 500-millisecond interval between tags, to handle this complexity effectively.

## Additional features or improvements

Dynamic Content Handling: My script waits for specific selectors to appear before proceeding with data extraction, ensuring that all relevant information is captured, even if it's loaded asynchronously.
Code Refactoring and Modularity: I've put effort into refactoring and modularization to improve readability and maintainability. This involves breaking down complex functions into smaller, reusable components and adhering to established design patterns.
I've added comprehensive comments throughout the codebase to explain the logic, decision-making process, and implementation details. This documentation helps in understanding and maintaining the script.
