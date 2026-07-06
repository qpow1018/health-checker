type RecordHomeProps = {
  email: string;
  onSignOut: () => void;
};

export function RecordHome({ email, onSignOut }: RecordHomeProps) {
  return (
    <main className="app-shell">
      <section className="surface stack">
        <header className="topbar">
          <div>
            <p className="eyebrow">오늘 기록</p>
            <h1>화장실 기록</h1>
          </div>
          <button className="ghost-button" type="button" onClick={onSignOut}>
            로그아웃
          </button>
        </header>

        <p className="muted">{email}</p>

        <div className="quick-actions" aria-label="빠른 기록">
          <button className="record-button" type="button" disabled>
            소변
          </button>
          <button className="record-button" type="button" disabled>
            대변
          </button>
          <button className="record-button secondary" type="button" disabled>
            둘 다
          </button>
        </div>

        <p className="notice">다음 단계에서 원탭 저장을 연결합니다.</p>
      </section>
    </main>
  );
}
