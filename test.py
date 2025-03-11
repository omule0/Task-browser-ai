browser_local = Browser(
    config=BrowserConfig(
        headless=False,
        cdp_url='http://localhost:9222',
    )
)
