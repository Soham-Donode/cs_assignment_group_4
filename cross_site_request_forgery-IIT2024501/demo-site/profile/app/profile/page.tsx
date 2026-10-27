import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export const instant = false;

const cardStyle = {
  borderRadius: 8,
  padding: "20px 24px",
  marginBottom: 20,
  background: "#2f2f2f",
};

const rowStyle = {
  display: "flex",
  borderTop: "1px solid #404040",
  padding: "12px 0",
};

const firstRowStyle = {
  display: "flex",
  padding: "12px 0",
};

const labelStyle = {
  width: 160,
  color: "#e0e0e0",
  fontSize: 14,
  flexShrink: 0,
};

const valueStyle = {
  fontSize: 14,
  color: "#fff",
  fontWeight: 500,
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const fullName = session.fullName ?? session.username;
  const role = session.role ?? "Member";
  const memberSince = session.memberSince ?? "Unknown";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "50px auto",
        padding: "0 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#222",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: "#fff", fontWeight: 600 }}>
            {fullName}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#e0e0e0", marginTop: 2 }}>
            @{session.username}
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 15, color: "#fff", fontWeight: 600 }}>
          Account Information
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#e0e0e0" }}>
          Your personal details stored on this account.
        </p>

        <div style={firstRowStyle}>
          <span style={labelStyle}>Full Name</span>
          <span style={valueStyle}>{fullName}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Username</span>
          <span style={valueStyle}>{session.username}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Email Address</span>
          <span style={valueStyle}>{session.email}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Member Since</span>
          <span style={valueStyle}>{memberSince}</span>
        </div>
      </div>

      {/* Security */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 15, color: "#fff", fontWeight: 600 }}>
          Security
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#e0e0e0" }}>
          Manage your account security settings.
        </p>

        <div style={firstRowStyle}>
          <span style={labelStyle}>Password</span>
          <span style={{ ...valueStyle, letterSpacing: 3 }}>••••••••</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Last Login</span>
          <span style={valueStyle}>Just now</span>
        </div>
      </div>

      {/* Logout */}
      <form method="POST" action="/api/logout">
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </form>
    </div>
  );
}
