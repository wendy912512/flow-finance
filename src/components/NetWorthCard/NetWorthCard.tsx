import { formatAmount } from '../../lib/money';
import { Card } from '../Card/Card';
import './NetWorthCard.css';

export interface NetWorthCardProps {
  /** Sum of all active deposit-account balances. */
  deposits: number;
  /** Manually entered investment market value; null when never entered. */
  investmentValue: number | null;
  /** Credit-card amounts posted but not yet paid. */
  creditCardUnpaid: number;
  /** Date the investment value was last entered, e.g. "10/01". */
  investmentAsOf?: string;
  surface?: 'solid' | 'glass';
  onUpdateInvestment?: () => void;
}

/**
 * 總資產 with its formula spelled out, so the headline number is never a mystery:
 * deposits + investment market value − unpaid credit-card balance.
 */
export function NetWorthCard({ deposits, investmentValue, creditCardUnpaid, investmentAsOf, surface = 'solid', onUpdateInvestment }: NetWorthCardProps) {
  const total = deposits + (investmentValue ?? 0) - creditCardUnpaid;
  return (
    <Card surface={surface} className="fl-networth" aria-label="總資產">
      <div className="fl-networth__label">總資產</div>
      <div className="text-display-2">{formatAmount(total, { currency: true })}</div>
      <dl className="fl-networth__rows">
        <div>
          <dt>存款合計</dt>
          <dd className="num">{formatAmount(deposits)}</dd>
        </div>
        <div>
          <dt>
            ＋ 投資市值
            {investmentAsOf && investmentValue !== null && <span className="fl-networth__note">（{investmentAsOf} 手動輸入）</span>}
          </dt>
          <dd className="num">
            {investmentValue === null ? (
              <button type="button" className="fl-networth__link" onClick={onUpdateInvestment}>
                尚未輸入
              </button>
            ) : (
              formatAmount(investmentValue)
            )}
          </dd>
        </div>
        <div>
          <dt>− 信用卡未繳</dt>
          <dd className="num">{formatAmount(creditCardUnpaid)}</dd>
        </div>
      </dl>
      {investmentValue === null && <p className="fl-networth__hint">投資市值未輸入時以 0 計算，總資產可能低估。</p>}
    </Card>
  );
}
