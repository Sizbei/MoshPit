/**
 * React error boundary that catches rendering errors and displays
 * a rave-themed fallback UI with a retry button.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BACKGROUND, RAVE_COLORS } from './colors';

// ── Types ───────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

// ── Component ───────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (__DEV__) {
      // In development, log the full error for debugging
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    }

    // In production this is where you would send the error to a
    // crash reporting service (e.g. Sentry, Bugsnag).
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>:(</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          An unexpected error occurred. Tap below to try again.
        </Text>
        {__DEV__ && this.state.error && (
          <Text style={styles.devError} numberOfLines={6}>
            {this.state.error.message}
          </Text>
        )}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={this.handleRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
    color: RAVE_COLORS.hotPink,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: RAVE_COLORS.white,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: RAVE_COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  devError: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: RAVE_COLORS.laserRed,
    backgroundColor: BACKGROUND.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  retryButton: {
    backgroundColor: RAVE_COLORS.hotPink,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: RAVE_COLORS.white,
  },
});
