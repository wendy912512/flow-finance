import { AccountCard, Card, GoalCard, StatTile } from './index';

/**
 * Placeholder app shell. The real pages (總覽、交易紀錄、薪水分配、存錢目標、帳戶、設定)
 * are built next on top of these components. Run `npm run storybook` to browse them.
 */
export default function App() {
  return (
    <main style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', display: 'grid', gap: 'var(--space-6)' }}>
      <h1 className="text-display" style={{ margin: 0 }}>流向 Flow</h1>
      <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto' }}>
        <AccountCard bankName="中國信託" roleLabel="薪資入帳 · 日常暫代" balance={92450} available={9450} last4="2048" />
        <AccountCard bankName="國泰世華" roleLabel="日常花費（預定）" status="planned" />
        <AccountCard bankName="元大銀行" roleLabel="投資 · 交割現金" face="graphite" balance={20000} balanceLabel="現金餘額" footnote="不含 ETF 市值" last4="7731" />
      </div>
      <StatTile label="今天建議可花" value={375} hero meta="可自由花費 6,760 ÷ 18 天" />
      <GoalCard
        name="畢業去冰島"
        purpose="想在畢業後送自己一趟旅行，親眼看極光與冰川。"
        target={150000}
        saved={45000}
        deadline={{ year: 2027, month: 7 }}
        monthlyPlan={10500}
        today={{ year: 2026, month: 10 }}
        priority={1}
        accountName="中信"
      />
      <Card>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>完整頁面開發中。元件請見 Storybook：npm run storybook</p>
      </Card>
    </main>
  );
}
