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
- **Alert Options**: Multi-select field to configure:
  - **Type**: Select either "Banner Type" or "Message Type"
  - **Theme**: Select one of Neutral, Warning, Information, Success, or Error
  - **Close Button**: Enable "Show Close Button" for dismissable alerts

### Configuring Alerts

Use the **Alert Options** multi-select field to configure your alert:

1. **Choose Type:**
   - Select "Banner Type" for full-width alerts with CTA buttons
   - Select "Message Type" for inline alerts without CTAs

2. **Choose Theme:**
   - "Neutral Theme" - General information
   - "Warning Theme" - Caution messages
   - "Information Theme" - Helpful information
   - "Success Theme" - Success confirmations
   - "Error Theme" - Error messages

3. **Optional Close Button:**
   - Check "Show Close Button" to allow users to dismiss the alert
   - Dismissed alerts are remembered via localStorage

**Example selections:**
- Banner with warning: Select "Banner Type" + "Warning Theme"
- Dismissable success message: Select "Message Type" + "Success Theme" + "Show Close Button"

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
