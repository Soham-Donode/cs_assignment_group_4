import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export const instant = false;

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "invalid";

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    boxSizing: "border-box" as const,
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
    background: "#e0e0e0",
    color: "#000  ",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 14,
    color: "#e0e0e0",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <div
        style={{
          width: 340,
          background: "#404040",
          borderRadius: 8,
          padding: 32,
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 20, fontSize: 22, color: "#fff" }}>
          Sign in
        </h1>

        {hasError && (
          <p
            style={{
              color: "#c0392b",
              background: "#fdecea",
              border: "1px solid #f5c6cb",
              borderRadius: 4,
              padding: "8px 12px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            Invalid username or password.
          </p>
        )}

        <form method="POST" action="/api/login">
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="username" style={labelStyle}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
