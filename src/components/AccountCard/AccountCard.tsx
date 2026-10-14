import { formatAmount } from '../../lib/money';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import './AccountCard.css';

export type CardFace = 'navy' | 'graphite';

export interface AccountCardProps {
  bankName: string;
  /** e.g. "薪資入帳 · 日常暫代" */
  roleLabel: string;
  /** active shows the balance; planned shows a dashed placeholder with an activate action. */
  status?: 'active' | 'planned';
  face?: CardFace;
  balance?: number;
  /** "餘額" for deposit accounts, "現金餘額" for investment accounts. */
  balanceLabel?: string;
  /** Money not reserved for goals or the daily earmark. */
  available?: number;
  /** Replaces the "未預留" line, e.g. "不含 ETF 市值". */
  footnote?: string;
  last4?: string;
  size?: 'md' | 'sm';
  onActivate?: () => void;
}

/** A debit-card shaped account tile (ISO card ratio 1.586). The only place gradients are allowed. */
export function AccountCard({
  bankName,
  roleLabel,
  status = 'active',
  face = 'navy',
  balance = 0,
  balanceLabel = '餘額',
  available,
  footnote,
  last4,
  size = 'md',
  onActivate,
}: AccountCardProps) {
  if (status === 'planned') {
    return (
      <div className={`fl-acct fl-acct--${size} fl-acct--planned`}>
        <div className="fl-acct__top">
          <div>
            <div className="fl-acct__bank fl-acct__bank--planned">{bankName}</div>
            <div className="fl-acct__role">{roleLabel}</div>
          </div>
          <Badge tone="neutral">規劃中</Badge>
        </div>
        <div>
          <p className="fl-acct__note">不計入合計 · 尚不能記帳</p>
          <Button variant="ghost" size="sm" onClick={onActivate} className="fl-acct__activate">
            啟用帳戶 →
          </Button>
        </div>
      </div>
    );
  }

  const foot = footnote ?? (available !== undefined ? `未預留 ${formatAmount(available, { currency: true })}` : '');

  return (
    <div className={`fl-acct fl-acct--${size} fl-acct--${face}`} aria-label={`${bankName}，${balanceLabel} ${formatAmount(balance)} 元`} role="group">
      <svg className="fl-acct__pattern" viewBox="0 0 300 189" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {face === 'navy' ? (
          <g stroke="#ffffff" strokeOpacity="0.08" fill="none">
            <path d="M0 40H300M0 80H300M0 120H300M0 160H300M60 0V189M120 0V189M180 0V189M240 0V189" />
            <circle cx="250" cy="30" r="70" />
            <circle cx="250" cy="30" r="110" />
          </g>
        ) : (
          <g stroke="#7fa6ff" strokeOpacity="0.16" fill="none">
            <path d="M0 150 C 60 120, 110 160, 170 110 S 260 60, 300 40" />
            <path d="M0 170 C 70 140, 120 175, 180 130 S 260 85, 300 70" />
            <path d="M0 130 C 50 100, 100 140, 160 90 S 250 40, 300 15" />
          </g>
        )}
      </svg>
      <div className="fl-acct__top">
        <div>
          <div className="fl-acct__bank">{bankName}</div>
          <div className="fl-acct__role">{roleLabel}</div>
        </div>
        <span className={`fl-acct__chip fl-acct__chip--${face}`} aria-hidden="true" />
      </div>
      <div className="fl-acct__bottom">
        <div className="fl-acct__role">{balanceLabel}</div>
        <div className="fl-acct__balance num">{formatAmount(balance, { currency: true })}</div>
        <div className="fl-acct__foot">
          <span>{foot}</span>
          {last4 && <span className="num">•••• {last4}</span>}
        </div>
      </div>
    </div>
  );
}
