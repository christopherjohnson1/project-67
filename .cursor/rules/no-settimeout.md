# No setTimeout Rule

## Overview
Do NOT use `setTimeout`, `setInterval`, or any timer-based delays in the codebase, especially for UI interactions and mobile keyboard handling.

## Why This Rule Exists
1. **Mobile Reliability**: setTimeout is unreliable on mobile devices, especially iOS
2. **Race Conditions**: Timing-based code creates race conditions
3. **Unpredictable Behavior**: Network delays and device performance affect timing
4. **Poor UX**: Users experience delays and unresponsive interfaces

## Alternatives

### ❌ Bad - Using setTimeout
```typescript
setTimeout(() => {
  this.focusInput();
}, 500);

setTimeout(() => {
  this.router.navigate(['/welcome']);
}, 1500);
```

### ✅ Good - Use RxJS and Browser APIs
```typescript
// For animations and delays
import { interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interval(500).pipe(takeUntil(this.destroy$)).subscribe(() => {
  this.showCursor = !this.showCursor;
});

// For DOM operations
requestAnimationFrame(() => {
  this.focusInput();
});

// For immediate navigation
this.router.navigate(['/welcome']);

// For CSS animations
// Use Angular animations or CSS transitions instead
```

## Approved Patterns

### 1. Focus Management
```typescript
// ✅ Good
ngAfterViewInit(): void {
  requestAnimationFrame(() => {
    this.inputElement.nativeElement.focus();
  });
}

// ❌ Bad
ngAfterViewInit(): void {
  setTimeout(() => {
    this.inputElement.nativeElement.focus();
  }, 100);
}
```

### 2. Animations
```typescript
// ✅ Good - Use CSS transitions
.element {
  transition: opacity 0.3s ease-in-out;
}

// ✅ Good - Use Angular animations
animations: [
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms', style({ opacity: 1 }))
    ])
  ])
]

// ❌ Bad
setTimeout(() => {
  this.showElement = true;
}, 300);
```

### 3. Observable Streams
```typescript
// ✅ Good - Use RxJS operators
this.authService.login(credentials).subscribe({
  next: () => {
    requestAnimationFrame(() => {
      this.router.navigate(['/welcome']);
    });
  }
});

// ❌ Bad
this.authService.login(credentials).subscribe({
  next: () => {
    setTimeout(() => {
      this.router.navigate(['/welcome']);
    }, 1000);
  }
});
```

### 4. Scroll Operations
```typescript
// ✅ Good
requestAnimationFrame(() => {
  this.scrollContainer.nativeElement.scrollTop = 
    this.scrollContainer.nativeElement.scrollHeight;
});

// ❌ Bad
setTimeout(() => {
  this.scrollContainer.nativeElement.scrollTop = 
    this.scrollContainer.nativeElement.scrollHeight;
}, 10);
```

## Exceptions

The ONLY acceptable use cases for setTimeout/setInterval:

1. **Testing**: Mock timers in unit tests
2. **Third-party Integration**: When a library explicitly requires it
3. **Polling**: Server polling (use RxJS interval instead when possible)

Even in these cases, document WHY setTimeout is necessary.

## Enforcement

- Code reviews should catch setTimeout usage
- Consider adding ESLint rule to warn on setTimeout
- This rule applies to:
  - TypeScript files
  - JavaScript files
  - Component templates (avoid timer-based animations)

## Related Best Practices

1. Use `requestAnimationFrame` for DOM operations
2. Use RxJS `interval`, `timer`, `delay` operators for timing
3. Use CSS transitions/animations for visual delays
4. Use Angular lifecycle hooks properly
5. Handle focus with proper event binding and attributes

## Mobile-Specific Considerations

On mobile devices:
- Use `inputmode` attribute for keyboard hints
- Use `enterkeyhint` for submit button labels
- Rely on browser focus events, not timers
- Test on actual devices, not just simulators
- Use proper ARIA labels for accessibility

## Migration Guide

If you find setTimeout in existing code:

1. **Identify the purpose**: What is setTimeout trying to accomplish?
2. **Choose alternative**: Pick from the patterns above
3. **Test thoroughly**: Especially on mobile devices
4. **Document**: Add comments explaining the new approach

## Examples from This Codebase

See these files for correct implementations:
- `frontend/src/app/features/auth/terminal-login/terminal-login.component.ts`
- `frontend/src/app/features/auth/welcome/welcome.component.ts`
- `frontend/src/app/core/interceptors/auth.interceptor.ts`

