# Toast Notification System

## Overview
A user-friendly toast notification system that replaces technical error messages with readable notifications.

## Features
- ✅ Automatic error code translation (429 → "Too many requests...")
- ✅ Multiple toast types: success, error, warning, info
- ✅ Auto-dismiss after 5 seconds (configurable)
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Stacked notifications support

## Usage

### 1. Import the hook
```tsx
import { useToast } from '../components/common/ToastContainer';
```

### 2. Use in your component
```tsx
const MyComponent = () => {
  const { showToast } = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      showToast('Action completed successfully!', 'success');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    }
  };
};
```

## Toast Types
- `success` - Green gradient, checkmark icon
- `error` - Red gradient, X icon
- `warning` - Orange gradient, warning icon
- `info` - Blue gradient, info icon

## Error Handler
The `getErrorMessage()` utility automatically translates HTTP status codes:

| Status Code | User-Friendly Message |
|-------------|----------------------|
| 429 | Too many requests. Please wait a moment before trying again. |
| 400 | Invalid request. Please check your input. |
| 401 | You need to be logged in to perform this action. |
| 403 | You do not have permission to perform this action. |
| 404 | The requested resource was not found. |
| 500 | Server error. Please try again later. |
| 503 | Service temporarily unavailable. Please try again later. |

## Examples

### Success notification
```tsx
showToast('Challenge solved!', 'success');
```

### Error with automatic translation
```tsx
import { getErrorMessage } from '../utils/errorHandler';

try {
  await submitFlag(flag);
} catch (err) {
  showToast(getErrorMessage(err), 'error');
}
```

### Warning
```tsx
showToast('Instance will expire in 5 minutes', 'warning');
```

### Info
```tsx
showToast('New challenges available!', 'info');
```
