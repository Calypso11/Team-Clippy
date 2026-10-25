import { describe, expect, it } from "vitest";
import { isListingPage, looksLikeStore } from "./tavily";

describe("isListingPage", () => {
  it.each([
    "https://www.walmart.com/c/kp/sip-lids?page=2&affinityOverride=store_led",
    "https://www.walmart.com/browse/party-occasions/paper-cups/2637_1102429",
    "https://www.walmart.com/search?q=12+oz+hot+cups",
    "https://www.amazon.com/s?k=12+oz+paper+hot+cups",
    "https://www.amazon.com/b?node=12345",
    "https://www.webstaurantstore.com/search/hot-cups.html",
    "https://www.target.com/c/disposable-cups/-/N-4y8ph",
    "https://shop.example.com/collections/hot-cups",
    "https://www.example.com/category/paper-cups",
    "https://www.example.com/catalog?search=flour",
  ])("listing: %s", (url) => expect(isListingPage(url)).toBe(true));

  it.each([
    "https://www.walmart.com/ip/Solo-12-oz-Paper-Hot-Cups-1000-ct/123456789",
    "https://www.amazon.com/Dart-12-oz-Hot-Cups/dp/B0012345",
    "https://www.bakersauthority.com/products/paper-white-hot-cups-12-oz-1000-count",
    "https://shop.example.com/collections/hot-cups/products/12-oz-cup",
    "https://www.target.com/p/solo-cups-12oz/-/A-12345678",
    "https://www.webstaurantstore.com/choice-12-oz-white-paper-hot-cup/50012W.html",
    "https://www.restaurantdepot.com/bread-flour-50-lb",
  ])("product: %s", (url) => expect(isListingPage(url)).toBe(false));
});

describe("looksLikeStore", () => {
  it("drops listing pages and keeps product pages", () => {
    expect(looksLikeStore({ url: "https://www.walmart.com/c/kp/sip-lids", title: "Sip Lids", content: "" })).toBe(false);
    expect(looksLikeStore({ url: "https://www.walmart.com/ip/Sip-Lids/123456", title: "Sip Lids", content: "" })).toBe(true);
  });
});
