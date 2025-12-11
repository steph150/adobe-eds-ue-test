# Alert Block

Displays alert messages in banner or message format with various themes based on the RHYCM06 requirements.

## Features

- **Two Alert Types:**
  - **Banner**: Full-width alerts with CTA button support
  - **Message**: Inline, compact alerts without CTA

- **Five Theme Options:**
  - Neutral - For general information
  - Warning - For warnings and cautions
  - Information - For helpful tips and updates
  - Success - For positive confirmations
  - Error - For error messages and failures

- **Optional Elements:**
  - Title (can be omitted)
  - Description (rich text supported)
  - CTA button (banner type only, always styled as primary)
  - Close button (optional, alert reappears on page reload)

## Universal Editor Configuration

This block uses Universal Editor with the following field structure:

1. **Alert Type** (required) - Select between Banner or Message
2. **Alert Theme** (required) - Select from Neutral, Warning, Information, Success, or Error
3. **Alert Title** (optional) - Short heading for the alert
4. **Description** (optional) - Rich text description
5. **CTA Link** (optional) - URL for the call-to-action (banner only)
6. **CTA Text** (optional) - Button text (banner only)
7. **Show Close Button** (optional) - Toggle to show/hide close button

## Business Rules

- **BR01**: Can be inserted anywhere between header and footer by content authors
- **BR02**: Banner includes title, description, CTA button, and optional close button. Message includes title, description, and optional close button
- **BR03**: Theme affects colors and icon
- **BR04**: CTA button (banner only) is always styled as Primary and navigates to configured URL
- **BR05**: Close button dismisses the alert, but it reappears on page reload

## Accessibility

- Proper ARIA roles (`alert` for error/warning, `status` for others)
- ARIA live regions for dynamic content
- Keyboard accessible close button
- Screen reader friendly

## Test Content

Test content is available at `/drafts/alert-test.html` demonstrating all variants and themes.
