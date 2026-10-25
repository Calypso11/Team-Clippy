# Clippy 2.0

**Upload a photo of your supply invoice, and Clippy shows you which stores sell the same items for less, and how much you would save each month.**

Live demo: https://clippy-nu-eight.vercel.app

Code: https://github.com/Calypso11/Team-Clippy

| Chat | Clippy's answer (phone) | Clippy's answer (computer) |
| --- | --- | --- |
| ![Start screen](public/screenshots/input.png) | ![Results on a phone](public/screenshots/results-mobile.png) | ![Results on a computer](public/screenshots/results-desktop.png) |

## How it works

1. **Chat with Clippy.** Attach a photo of a supply invoice or receipt, or just type what you buy (for example "50 lb bread flour, 1000 12 oz cups"), like you would in a chat app.
2. **Clippy reads it.** It finds each item, the pack size, and the price you pay now.
3. **Clippy searches real stores.** It looks up the same items on public store websites.
4. **Clippy compares fairly.** It works out the real price per pound, per cup or per item, including shipping, so a big pack and a small pack can be compared.
5. **You see your savings.** For each item you see the cheapest store, a link to the product, the date the price was checked, and your savings per order, per month and per year.

Clippy never buys anything for you. You decide where to shop.

## Set up your own copy in 3 steps

You do not need to write code or set up a database.

1. **Deploy.** Click the button below and sign in to Vercel (free). Vercel copies the code and asks for the two keys below.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCalypso11%2FTeam-Clippy&env=ANTHROPIC_API_KEY,TAVILY_API_KEY&envDescription=Your%20Anthropic%20and%20Tavily%20API%20keys)

2. **Add your Anthropic key.** Make a key at [console.anthropic.com](https://console.anthropic.com) and paste it into Vercel as `ANTHROPIC_API_KEY`.
3. **Add your Tavily key.** Make a key at [tavily.com](https://tavily.com) and paste it into Vercel as `TAVILY_API_KEY`.

That's it. Open your new site and upload an invoice.

## What it costs

About **$0.35** per invoice check, measured on our 5-item sample invoice: about $0.17 for Claude and about $0.16 for Tavily (20 search credits at the pay-as-you-go price). Tavily's free plan includes 1,000 credits a month, which covers about 50 checks. There is no monthly fee from Clippy.

## Limits

- **Prices behind a login are not seen.** Clippy only reads public store pages, so it cannot see prices that need an account.
- **Member and contract prices are not included.** Warehouse club, wholesale and contract prices may be lower than what Clippy finds.
- **Prices change every day.** Each price shows the date it was checked. Always check the store page before you buy.
- **Clippy never buys.** It only shows you links. Nothing is ordered or paid for.
- If Clippy cannot find a reliable price for an item, it says "No reliable price found." It never guesses.

## What's next

- **Weekly invoice forwarding:** email your invoice to Clippy and get a savings report every week.
- **Price alerts:** get a message when an item you buy gets cheaper.
- **Local stock:** see which stores near you have the item today.

## Built with

[Claude](https://www.anthropic.com/claude) by Anthropic reads invoices and store pages. [Tavily](https://tavily.com) searches the web for store prices.

## License

[MIT](LICENSE)
