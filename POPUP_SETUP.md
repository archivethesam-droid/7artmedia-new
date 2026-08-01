# 7Art Session Lead Popup

The website includes a reusable lead form popup matching the dark purple-orange 7Art visual system.

## Behaviour

- Opens automatically about 1.1 seconds after a visitor enters a public page.
- The visitor is marked as dismissed only after using X, Skip, backdrop, Escape, or after a successful submission.
- After dismissal, it stays hidden while the current browser session remains active.
- It appears again after the browser session is fully closed and a new one starts.
- It works on localhost and also has a sessionStorage fallback for direct file testing.
- It is intentionally disabled on `thank-you.html` and the CMS admin.
- Submissions use the same Web3Forms access key as the existing contact form.

## Testing

Open any public page normally for a clean-session test.

To force the popup to display even when the session has already been dismissed, add:

`?popup=1`

Example:

`http://localhost:3000/index.html?popup=1`

To clear the current popup session and force it open, use:

`?popup=reset`

Example:

`http://localhost:3000/index.html?popup=reset`

You can also run this in the browser console before refreshing:

`SevenArtLeadPopup.reset()`

## Files

- `lead-popup.css` - popup styling and responsive layout.
- `lead-popup.js` - popup markup, session handling, accessibility, and form submission.
