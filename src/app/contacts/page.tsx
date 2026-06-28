export default function ContactsPage() {
  return (
    <div className="page static-page">
      <header className="header">
        <h1 className="page-title">Контакты</h1>
        <p className="subtitle">Связаться с командой BoSore</p>
      </header>
      <div className="auth-card">
        <p className="auth-text">
          По вопросам работы сервиса напишите на{" "}
          <a href="mailto:hello@bosore.app">hello@bosore.app</a>.
        </p>
      </div>
    </div>
  );
}
