import { useState } from 'react';
import { AppShell, NAV, type PageId } from './pages/AppShell/AppShell';
import { Overview } from './pages/Overview/Overview';
import { Transactions } from './pages/Transactions/Transactions';

export interface AppProps {
  initialPage?: PageId;
  animateIn?: boolean;
}

/** The app with working navigation. Pages not built yet show a placeholder. */
export default function App({ initialPage = 'overview', animateIn = true }: AppProps) {
  const [page, setPage] = useState<PageId>(initialPage);
  const go = (p: PageId) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  if (page === 'overview') return <Overview animateIn={animateIn} onNavigate={go} />;
  if (page === 'transactions') return <Transactions onNavigate={go} />;
  return (
    <AppShell active={page} onNavigate={go}>
      <section className="fl-glass">
        <h1 className="fl-glass__title">{NAV.find((n) => n.id === page)?.label}</h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 13 }}>這一頁還在開發中。</p>
      </section>
    </AppShell>
  );
}
