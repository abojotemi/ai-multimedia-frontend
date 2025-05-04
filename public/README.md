# Public Directory

This directory contains static assets and configuration files that are copied as-is to the build output directory.

## Files

### _redirects

The `_redirects` file is specifically for deployment platforms like Netlify and Render. It configures the server to handle client-side routing properly.

```
/* /index.html 200
```

This rule tells the server to serve the `index.html` file for any route (`/*`) with a 200 status code, allowing the React Router to handle client-side routing.

### static.json

The `static.json` file is an alternative configuration for platforms like Heroku or others that support this format. It serves the same purpose as the _redirects file.

```json
{
  "root": "./dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

## Why This Is Needed

In a single-page application (SPA), routing is handled on the client side by JavaScript. When a user refreshes the page or enters a URL directly, the server needs to know to serve the main HTML file instead of looking for a file at that path.

This configuration ensures that all routes are properly handled by the client-side router.

Without these files, when you navigate to a route like `/dashboard` directly or refresh the page while on such a route, you would get a 404 error because the server would try to find a file at that path, which doesn't exist.