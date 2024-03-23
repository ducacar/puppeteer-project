import puppeteer, { Page } from "puppeteer";
import fs = require("fs");

async function scrapeEtsy() {
  // Launch a headless browser instance
  const browser = await puppeteer.launch({ headless: true }); //change to true latter
  const page = await browser.newPage();

  try {
    // Navigate to the Etsy search page for adidas sport shoes
    await page.goto("https://www.etsy.com/search?q=sport+shoes&ref=search_bar");
    await page.waitForSelector(".js-merch-stash-check-listing");

    // Extract information for the first 10 products
    const products = await page.evaluate(() => {
      const productList = Array.from(
        document.querySelectorAll(".js-merch-stash-check-listing")
      ).slice(0, 10);

      return productList.map((product) => {
        const nameElement = product.querySelector(
          ".wt-text-caption.streamline-seller-shop-name__line-height"
        );
        let name = "N/A";

        // Extract product name
        if (nameElement && nameElement.textContent) {
          const textContent = nameElement.textContent.trim();
          const lines = textContent.split("\n");

          if (lines.length >= 3) {
            name = lines[2].trim();
          }
        }

        // Extract product price
        const priceElement = product.querySelector(".currency-value");
        const price = priceElement?.textContent?.trim() || "N/A";

        // Extract product URL
        const urlElement = product.querySelector(
          "a.listing-link"
        ) as HTMLAnchorElement;
        const url = urlElement?.href || "N/A";

        return { name, price, url };
      });
    });

    console.log("First 10 products:", products);

    // Write the product information to a JSON file
    fs.writeFile("products.json", JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("Product information saved to products.json");
      }
    });

    // Define an array to store detailed product information
    const productsWithDetails: any[] = [];

    // Loop through each product and extract detailed information
    for (const product of products) {
      if (product.url !== "N/A") {
        await page.goto(product.url);
        await page.waitForSelector(".wt-mb-xs-2");

        // Extract product description, image URL, and available sizes
        const details = await page.evaluate(() => {
          const descriptionElement = document.querySelector(".wt-text-body-01");
          const description = descriptionElement?.textContent?.trim() || "N/A";
          const imageUrlElement = document.querySelector("img.carousel-image");
          const imageUrl = imageUrlElement?.getAttribute("src") || "N/A";

          // Extract available sizes
          const sizeOptions = Array.from(
            document.querySelectorAll("#variation-selector-0 option")
          );
          const sizes = sizeOptions
            .map((option) => option.textContent?.trim())
            .filter((text) => text && text !== "Select an option");

          return { description, imageUrl, sizes };
        });
        // Merge detailed information with existing product data
        Object.assign(product, details);

        console.log("Detailed product information:", product);

        // Push the combined product information into the array
        productsWithDetails.push(product);

        // Function to select dropdown option
        async function selectDropdownOption(page: Page, selector: string) {
          const dropdownHandles = await page.$$(selector);
          for (const dropdownHandle of dropdownHandles) {
            const options = await dropdownHandle.$$("option[value]");
            if (options.length > 1) {
              const optionValue = await options[1].evaluate(
                (node) => node.value
              );
              await dropdownHandle.select(optionValue);
              console.log("Selected option in dropdown:", optionValue);
            } else {
              throw new Error("Dropdown has insufficient options.");
            }
          }
        }

        // Function to fill textarea
        async function fillTextarea(
          page: Page,
          selector: string,
          message: string
        ) {
          try {
            const textarea = await page.$(selector);
            if (textarea) {
              await textarea.type(message);
              console.log("Filled textarea.");
            } else {
              console.log("Textarea not found.");
              // Handle the absence of the textarea here if needed
            }
          } catch (error) {
            console.error(
              "An error occurred while filling the textarea:",
              error
            );
          }
        }

        // Usage of selectDropdownOption and fillTextarea functions
        try {
          await selectDropdownOption(page, "#variation-selector-0");
          await delay(500);
          await selectDropdownOption(page, "#variation-selector-1");

          await fillTextarea(
            page,
            "#listing-page-personalization-textarea",
            "My custom message"
          );
        } catch (error) {
          console.error("An error occurred while filling the textarea:", error);
        }

        // Click the "Add to cart" button
        await page.waitForSelector(
          "div[data-add-to-cart-button] button.wt-btn--filled:not([disabled])"
        );
        const addButtonHandle = await page.$(
          "div[data-add-to-cart-button] button.wt-btn--filled:not([disabled])"
        );
        if (addButtonHandle) {
          await addButtonHandle.click();
          console.log("Clicked the Add to cart button ");
        } else {
          throw new Error("Add to cart button not clickable.");
        }

        await page.waitForSelector(".proceed-to-checkout");
        console.log(
          "Added to cart and proceeded to checkout for:",
          product.name
        );
      }
      // Write the array containing all product information to the JSON file
      fs.writeFile(
        "products.json",
        JSON.stringify(productsWithDetails, null, 2),
        (err) => {
          if (err) {
            console.error("Error writing to file:", err);
          } else {
            console.log("Product information saved to products.json");
          }
        }
      );
    }

    // Navigate to the cart page
    await page.goto("https://www.etsy.com/cart");
    await page.waitForSelector(".proceed-to-checkout");
    await page.click(".proceed-to-checkout");

    // Click the "Continue as a guest" button
    await page.waitForSelector(
      '.wt-btn.wt-btn--secondary.wt-width-full[data-join-neu-button=""]'
    );
    await page.click(
      '.wt-btn.wt-btn--secondary.wt-width-full[data-join-neu-button=""]'
    );
    console.log("Clicked the Continue as a guest button.");

    // Wait for the checkout page to load
    await page.waitForNavigation();
    console.log("Proceeded to checkout page.");

    // Fill out the shipping information
    await page.type("#shipping-form-email-input", "example@example.com");
    await page.type("#shipping-form-email-confirmation", "example@example.com");
    await page.type("#name11-input", "John Doe");
    await page.type("#first_line12-input", "123 Main St");
    await page.type("#city15-input", "New York");
    console.log("Filled in shipping information.");

    // Click the "Continue to payment" button
    await page.click(
      '.wt-btn.wt-btn--filled.wt-width-full[data-selector-save-btn=""]'
    );
    console.log("Clicked the Continue to payment button.");

    // Wait for the payment page to load
    await page.waitForNavigation();
    console.log("Proceeded to payment page.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the browser instance
    await browser.close();
  }
}

// Function to introduce a delay
function delay(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, time);
  });
}

// Call the function to start the scraping process
scrapeEtsy();
