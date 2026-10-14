import { useId, useState, type ReactNode } from 'react';
import { formatAmount, parseAmount } from '../../lib/money';
import './AmountInput.css';

export interface AmountInputProps {
  label: string;
  /** Whole dollars, or null when empty. */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Upper bound, e.g. the account's unreserved balance. Exceeding it shows an error. */
  max?: number;
  /** Shown under the field when there is no error, e.g. "從中信未預留可用 9,450 撥出". */
  help?: ReactNode;
  /** Error text when value > max. Defaults to "超過可用金額 X，無法送出". */
  overMaxMessage?: (max: number) => string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function AmountInput({ label, value, onChange, max, help, overMaxMessage, placeholder = '0', autoFocus }: AmountInputProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? (value === null ? '' : formatAmount(value));
  const over = max !== undefined && value !== null && value > max;
  const message = over ? (overMaxMessage ?? ((m) => `超過可用金額 ${formatAmount(m)}，無法送出`))(max) : help;

  return (
    <div className="fl-field">
      <label htmlFor={id} className="fl-field__label">
        {label}
      </label>
      <input
        id={id}
        className={`fl-input fl-input--amount num${over ? ' fl-input--error' : ''}`}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={display}
        autoFocus={autoFocus}
        aria-invalid={over || undefined}
        aria-describedby={message ? helpId : undefined}
        onChange={(e) => {
          const raw = e.target.value;
          const parsed = parseAmount(raw);
          if (raw.trim() === '') {
            setDraft('');
            onChange(null);
          } else if (parsed !== null) {
            setDraft(formatAmount(parsed));
            onChange(parsed);
          }
        }}
        onBlur={() => setDraft(null)}
      />
      {message && (
        <span id={helpId} className={`fl-field__help${over ? ' fl-field__help--error' : ''}`} role={over ? 'alert' : undefined}>
          {message}
        </span>
      )}
    </div>
  );
}
