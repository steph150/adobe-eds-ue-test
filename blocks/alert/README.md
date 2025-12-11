# Alert Block

Displays alert messages with different types (banner/message) and themes (neutral/warning/information/success/error).

## Usage

The alert block is designed for Universal Editor and provides two types of alerts:

### Message Type
- Compact alert with icon, title, and description
- Optional close button
- No CTA button

### Banner Type
- Larger alert with icon, title, description, and CTA button
- Optional close button
- Green primary button with chevron icon

## Themes

Five color themes available:

1. **Neutral** - Light gray background, general information
2. **Warning** - Light yellow/beige background, warnings and cautions
3. **Information** - Light blue background, helpful information
4. **Success** - Light green background, success messages
5. **Error** - Light pink background, error messages

## Content Model

The block uses element grouping to optimize the authoring experience:

- **classes** - Alert type (banner/message)
- **classes_theme** - Color theme
- **classes_closeable** - Show/hide close button
- **content_title** - Alert title
- **content_description** - Alert description (rich text)
- **cta_link** - CTA button link (banner only)
- **cta_linkText** - CTA button text (banner only)
- **cta_linkTitle** - CTA button title attribute (banner only)

## Visual Structure

### Message Alerts
```
[Border] [Icon] [Title + Description] [Close]
```

### Banner Alerts
```
[Border] [Icon] [Title + Description + CTA] [Close]
```

## Features

- **Responsive Design** - Adapts to mobile, tablet, and desktop
- **Accessible** - ARIA labels, keyboard navigation, semantic HTML
- **Dismissible** - Optional close button that hides the alert
- **Flexible Content** - Title and description are both optional

## Design Specifications

Based on RHYCM06 - Alert specifications:

- **Border Accent**: 4px colored left border
- **Icon**: 40px circle with person/info symbol
- **Typography**: 
  - Title: 18px bold (desktop), 16px (mobile)
  - Description: 16px regular (desktop), 14px (mobile)
- **Spacing**:
  - Message: 14-16px padding
  - Banner: 16-24px padding
- **CTA Button**: Green primary button with right chevron

## Browser Compatibility

Works in all modern browsers that support:
- CSS Grid and Flexbox
- SVG
- ES6 JavaScript

## Testing

Test page available at `/drafts/alert-test.html` demonstrating all variations:
- All 5 themes (message type)
- Banner types with CTA
- Alerts with/without close button
- Title-only and description-only variants
