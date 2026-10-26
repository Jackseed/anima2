import type { Texts } from '../core/texts';

// Maps Firebase Auth error codes to a message for the player.
export function authErrorText(error: unknown, texts: Texts): string {
  const code = (error as { code?: string })?.code ?? '';
  if (code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('user-not-found')) {
    return texts.errors.wrongPassword;
  }
  if (code.includes('email-already-in-use') || code.includes('credential-already-in-use')) return texts.errors.emailInUse;
  if (code.includes('weak-password')) return texts.errors.weakPassword;
  if (code.includes('invalid-email')) return texts.errors.invalidEmail;
  if (code.includes('requires-recent-login')) return texts.account.reauth;
  if (code.includes('network')) return texts.errors.network;
  return texts.errors.generic;
}
