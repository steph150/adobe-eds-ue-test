# Alert Block

The Alert block provides alert messages on the website in various themes and types.

## Features

- **Two types:** Banner (full-width with CTA) and Message (inline, no CTA)
- **Five themes:** Neutral, Warning, Information, Success, Error
- **Optional close button** with localStorage persistence
- **Accessible** with proper ARIA attributes
- **Responsive** design for mobile, tablet, and desktop

## Universal Editor Fields

- **Alert Title** (optional): Heading for the alert
- **Description**: Rich text content with formatting
- **CTA Link** (Banner only): Call-to-action button URL
- **CTA Text** (Banner only): Button text

## Block Variants

Use block variants to control alert appearance:

- **Type variants:** `banner` (default) or `message`
- **Theme variants:** `neutral` (default), `warning`, `information`, `success`, `error`
- **Close button:** Add `close` variant to enable dismissal

### Examples

```
Banner + Information + Close:
alert (banner, information, close)

Message + Error:
alert (message, error)
```

## Behavior

- **Close button:** When enabled, closing an alert saves dismissal state in localStorage
- **Persistence:** Dismissed alerts remain hidden on page reload
- **Unique keys:** Each alert generates a unique key based on its content
- **Accessibility:** Alerts use `role="alert"` and appropriate `aria-live` values

## Styling

The alert block includes responsive styling:
- Mobile: Stacked layout, full-width CTA buttons
- Tablet/Desktop: Horizontal layout with inline CTAs
- Banner type: Full-width, no border radius
- Message type: Max-width with border radius

Theme colors follow standard alert color conventions with left border accent and themed buttons.

## Test Content

See `/drafts/alert-examples.html` for comprehensive examples of all alert types and themes.
