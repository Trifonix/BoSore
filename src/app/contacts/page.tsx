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
        <p className="auth-text mb-0">
          GitHub:{" "}
          <a
            href="https://github.com/trifonix"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/trifonix
          </a>
        </p>
      </div>
    </div>
  );
}
