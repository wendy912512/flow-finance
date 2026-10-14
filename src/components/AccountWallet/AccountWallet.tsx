import { useState, type KeyboardEvent } from 'react';
import { AccountCard, type AccountCardProps } from '../AccountCard/AccountCard';
import './AccountWallet.css';

export interface WalletAccount extends AccountCardProps {
  id: string;
}

export interface AccountWalletProps {
  accounts: WalletAccount[];
  /** Account shown in front first. Defaults to the first one. */
  initialId?: string;
  size?: 'md' | 'sm';
}

/**
 * Full account cards stacked like a wallet: the selected card sits in front at full size,
 * the others peek out above it. Pick a card from the tabs below (or click a peeking edge).
 */
export function AccountWallet({ accounts, initialId, size = 'md' }: AccountWalletProps) {
  const [activeId, setActiveId] = useState(initialId ?? accounts[0]?.id);
  const activeIndex = Math.max(0, accounts.findIndex((a) => a.id === activeId));
  const others = accounts.filter((_, i) => i !== activeIndex);
  const peek = 16;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (activeIndex + (e.key === 'ArrowRight' ? 1 : accounts.length - 1)) % accounts.length;
    setActiveId(accounts[next].id);
    document.getElementById(`wallet-tab-${accounts[next].id}`)?.focus();
  };

  return (
    <div className={`fl-wallet fl-wallet--${size}`}>
      <div className="fl-wallet__stack" style={{ paddingTop: others.length * peek }}>
        {others.map((acct, i) => {
          const depth = others.length - i;
          return (
            <button
              key={acct.id}
              type="button"
              className="fl-wallet__back"
              style={{ top: i * peek, transform: `scale(${1 - depth * 0.04})`, zIndex: i }}
              onClick={() => setActiveId(acct.id)}
              aria-label={`切換到 ${acct.bankName}`}
              tabIndex={-1}
            >
              <AccountCard {...acct} size={size} />
            </button>
          );
        })}
        <div className="fl-wallet__front" style={{ zIndex: others.length }} id={`wallet-panel-${accounts[activeIndex].id}`} role="tabpanel" aria-labelledby={`wallet-tab-${accounts[activeIndex].id}`}>
          <AccountCard {...accounts[activeIndex]} size={size} />
        </div>
      </div>
      <div className="fl-wallet__tabs" role="tablist" aria-label="帳戶" onKeyDown={onKey}>
        {accounts.map((acct, i) => (
          <button
            key={acct.id}
            id={`wallet-tab-${acct.id}`}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`wallet-panel-${acct.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            className="fl-wallet__tab"
            onClick={() => setActiveId(acct.id)}
          >
            {acct.bankName}
          </button>
        ))}
      </div>
    </div>
  );
}
