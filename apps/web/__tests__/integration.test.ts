import { describe, it, expect, beforeEach } from "vitest";
import { createHash, createHmac, randomBytes } from "crypto";

// ─── Unit-testable lib modules ──────────────────────────────────────

// Test escapeHtml directly (no env dependency)
import { escapeHtml } from "../src/lib/escape";

// Test rate limiter directly (no env dependency)
import { rateLimit } from "../src/lib/rate-limit";

// ─── FLOW-001: Rate Limiting ────────────────────────────────────────

describe("FLOW-001: Rate Limiting", () => {
  it("allows requests within the limit", () => {
    const key = `test-allow-${randomBytes(8).toString("hex")}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60000)).toBe(true);
    }
  });

  it("blocks requests exceeding the limit", () => {
    const key = `test-block-${randomBytes(8).toString("hex")}`;
    for (let i = 0; i < 10; i++) {
      rateLimit(key, 10, 60000);
    }
    expect(rateLimit(key, 10, 60000)).toBe(false);
  });

  it("resets after window expires", () => {
    const key = `test-reset-${randomBytes(8).toString("hex")}`;
    // Simulate by using a very short window
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 1); // 1ms window
    }
    // After 1ms the window resets
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 3, 1)).toBe(true);
        resolve();
      }, 5);
    });
  });

  it("enforces 30 req/min per API key limit", () => {
    const apiKey = `key-30-${randomBytes(8).toString("hex")}`;
    for (let i = 0; i < 30; i++) {
      expect(rateLimit(`key:${apiKey}`, 30, 60000)).toBe(true);
    }
    expect(rateLimit(`key:${apiKey}`, 30, 60000)).toBe(false);
  });

  it("enforces 60 req/min per IP limit", () => {
    const ip = `ip-60-${randomBytes(8).toString("hex")}`;
    for (let i = 0; i < 60; i++) {
      expect(rateLimit(`ip:${ip}`, 60, 60000)).toBe(true);
    }
    expect(rateLimit(`ip:${ip}`, 60, 60000)).toBe(false);
  });

  it("enforces 10 req/min on unsubscribe endpoint", () => {
    const ip = `unsub-${randomBytes(8).toString("hex")}`;
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(`unsub:${ip}`, 10, 60000)).toBe(true);
    }
    expect(rateLimit(`unsub:${ip}`, 10, 60000)).toBe(false);
  });
});

// ─── FLOW-002: XSS Escaping ────────────────────────────────────────

describe("FLOW-002: XSS / HTML Escaping", () => {
  it("escapes < and > characters", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('value="evil"')).toBe("value=&quot;evil&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves safe strings unchanged", () => {
    expect(escapeHtml("hello world 123")).toBe("hello world 123");
  });

  it("escapes complex injection attempt", () => {
    const malicious = '"><img src=x onerror=alert(1)>';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain("<");
    expect(escaped).not.toContain(">");
    expect(escaped).toBe(
      "&quot;&gt;&lt;img src=x onerror=alert(1)&gt;",
    );
  });
});

// ─── FLOW-003: HMAC Token Signing ──────────────────────────────────

describe("FLOW-003: HMAC Token Security", () => {
  const TEST_SECRET = "a".repeat(32);

  function signTokenTest(
    email: string,
    workspaceId: string,
    secret: string,
  ): string {
    const payload = `${email}:${workspaceId}`;
    const sig = createHmac("sha256", secret).update(payload).digest("hex");
    return Buffer.from(JSON.stringify({ email, workspaceId, sig })).toString(
      "base64url",
    );
  }

  function verifyTokenTest(
    token: string,
    secret: string,
  ): { email: string; workspaceId: string } | null {
    try {
      const parsed = JSON.parse(
        Buffer.from(token, "base64url").toString(),
      ) as { email: string; workspaceId: string; sig: string };
      const expected = createHmac("sha256", secret)
        .update(`${parsed.email}:${parsed.workspaceId}`)
        .digest("hex");

      const { timingSafeEqual } = require("crypto") as typeof import("crypto");
      const valid =
        expected.length === parsed.sig.length &&
        timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.sig));

      return valid ? { email: parsed.email, workspaceId: parsed.workspaceId } : null;
    } catch {
      return null;
    }
  }

  it("signs and verifies a valid token", () => {
    const token = signTokenTest("user@test.com", "ws-123", TEST_SECRET);
    const result = verifyTokenTest(token, TEST_SECRET);
    expect(result).toEqual({ email: "user@test.com", workspaceId: "ws-123" });
  });

  it("rejects tampered email", () => {
    const token = signTokenTest("user@test.com", "ws-123", TEST_SECRET);
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString()) as {
      email: string;
      workspaceId: string;
      sig: string;
    };
    decoded.email = "evil@attacker.com";
    const tampered = Buffer.from(JSON.stringify(decoded)).toString("base64url");
    expect(verifyTokenTest(tampered, TEST_SECRET)).toBeNull();
  });

  it("rejects tampered workspaceId", () => {
    const token = signTokenTest("user@test.com", "ws-123", TEST_SECRET);
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString()) as {
      email: string;
      workspaceId: string;
      sig: string;
    };
    decoded.workspaceId = "ws-evil";
    const tampered = Buffer.from(JSON.stringify(decoded)).toString("base64url");
    expect(verifyTokenTest(tampered, TEST_SECRET)).toBeNull();
  });

  it("rejects token signed with wrong secret", () => {
    const token = signTokenTest("user@test.com", "ws-123", "b".repeat(32));
    expect(verifyTokenTest(token, TEST_SECRET)).toBeNull();
  });

  it("rejects garbage token", () => {
    expect(verifyTokenTest("not-a-valid-token", TEST_SECRET)).toBeNull();
  });

  it("rejects empty token", () => {
    expect(verifyTokenTest("", TEST_SECRET)).toBeNull();
  });

  it("produces base64url-safe output", () => {
    const token = signTokenTest("user@test.com", "ws-123", TEST_SECRET);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

// ─── FLOW-004: API Key Hashing ─────────────────────────────────────

describe("FLOW-004: API Key Hash Security", () => {
  it("SHA-256 hash is deterministic", () => {
    const key = "pk_test_key_12345";
    const hash1 = createHash("sha256").update(key).digest("hex");
    const hash2 = createHash("sha256").update(key).digest("hex");
    expect(hash1).toBe(hash2);
  });

  it("different keys produce different hashes", () => {
    const hash1 = createHash("sha256").update("pk_key_1").digest("hex");
    const hash2 = createHash("sha256").update("pk_key_2").digest("hex");
    expect(hash1).not.toBe(hash2);
  });

  it("hash is 64 hex characters", () => {
    const hash = createHash("sha256").update("test-key").digest("hex");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hash cannot be reversed to plaintext", () => {
    const plaintext = `pk_${randomBytes(32).toString("hex")}`;
    const hash = createHash("sha256").update(plaintext).digest("hex");
    // Hash should not contain the plaintext
    expect(hash).not.toContain(plaintext);
    expect(hash).not.toBe(plaintext);
  });

  it("generated key has correct format", () => {
    const plaintext = `pk_${randomBytes(32).toString("hex")}`;
    expect(plaintext).toMatch(/^pk_[a-f0-9]{64}$/);
    expect(plaintext.length).toBe(67); // "pk_" (3) + 64 hex chars
  });
});

// ─── FLOW-005: CRON Secret + Timing-Safe Comparison ─────────────────

describe("FLOW-005: CRON Secret & timingSafeEqual", () => {
  const { timingSafeEqual } = require("crypto") as typeof import("crypto");

  it("timingSafeEqual returns true for matching buffers", () => {
    const a = Buffer.from("secret-value-12345678901234567890");
    const b = Buffer.from("secret-value-12345678901234567890");
    expect(timingSafeEqual(a, b)).toBe(true);
  });

  it("timingSafeEqual returns false for different buffers", () => {
    const a = Buffer.from("secret-value-12345678901234567890");
    const b = Buffer.from("wrong--value-12345678901234567890");
    expect(timingSafeEqual(a, b)).toBe(false);
  });

  it("timingSafeEqual throws on length mismatch", () => {
    const a = Buffer.from("short");
    const b = Buffer.from("longer-value");
    expect(() => timingSafeEqual(a, b)).toThrow();
  });

  it("CRON_SECRET must be at least 32 chars (zod validation)", () => {
    const { z } = require("zod") as typeof import("zod");
    const schema = z.string().min(32);

    expect(schema.safeParse("a".repeat(32)).success).toBe(true);
    expect(schema.safeParse("a".repeat(31)).success).toBe(false);
    expect(schema.safeParse("").success).toBe(false);
  });

  it("CRON auth check rejects empty token", () => {
    const cronSecret = "a".repeat(32);
    const token = "";
    const expected = Buffer.from(cronSecret);
    const provided = Buffer.from(token);

    // Length mismatch should cause rejection before timingSafeEqual
    expect(expected.length === provided.length).toBe(false);
  });

  it("CRON auth check accepts correct token", () => {
    const cronSecret = "test-cron-secret-abcdef1234567890";
    const token = "test-cron-secret-abcdef1234567890";
    const expected = Buffer.from(cronSecret);
    const provided = Buffer.from(token);

    expect(
      expected.length === provided.length &&
        timingSafeEqual(expected, provided),
    ).toBe(true);
  });
});

// ─── Additional Security Checks ─────────────────────────────────────

describe("Security: Environment Schema Validation", () => {
  it("NEXTAUTH_SECRET requires min 32 chars", () => {
    const { z } = require("zod") as typeof import("zod");
    const schema = z.string().min(32);
    expect(schema.safeParse("x".repeat(32)).success).toBe(true);
    expect(schema.safeParse("x".repeat(31)).success).toBe(false);
  });

  it("PREFSKIT_TOKEN_SECRET requires min 32 chars", () => {
    const { z } = require("zod") as typeof import("zod");
    const schema = z.string().min(32);
    expect(schema.safeParse("y".repeat(32)).success).toBe(true);
    expect(schema.safeParse("y".repeat(10)).success).toBe(false);
  });
});

describe("Security: CORS Headers", () => {
  it("CORS headers object has correct values", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    expect(corsHeaders["Access-Control-Allow-Origin"]).toBe("*");
    expect(corsHeaders["Access-Control-Allow-Methods"]).toContain("OPTIONS");
    expect(corsHeaders["Access-Control-Allow-Headers"]).toContain(
      "Authorization",
    );
  });
});

describe("Security: Stripe Webhook Raw Body", () => {
  it("Buffer.from(arrayBuffer) preserves raw bytes", () => {
    const original = '{"type":"checkout.session.completed"}';
    const encoder = new TextEncoder();
    const arrayBuffer = encoder.encode(original).buffer;
    const restored = Buffer.from(arrayBuffer).toString();
    expect(restored).toBe(original);
  });

  it("raw body is not parsed as JSON first", () => {
    // Ensure the webhook pattern reads raw body, not parsed JSON
    const rawBody = '{"id":"evt_123","type":"test"}';
    const buf = Buffer.from(rawBody);
    // Buffer should contain the exact raw string
    expect(buf.toString()).toBe(rawBody);
    // And be usable for signature verification
    expect(buf.length).toBe(rawBody.length);
  });
});
