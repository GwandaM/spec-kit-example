import { generateSalt, hashPin, verifyPin } from "@/lib/utils/crypto";

jest.setTimeout(15000);

describe("PIN crypto utilities", () => {
  it("hashes a PIN with PBKDF2 using a salt", async () => {
    const salt = generateSalt();
    const result = await hashPin("1234", salt);

    expect(result.salt).toBe(salt);
    expect(result.hash).not.toEqual("1234");
    expect(result.iterations).toBe(100_000);
    expect(result.algorithm).toBe("PBKDF2");
    expect(result.keyLength).toBe(32);
  });

  it("verifies correct and incorrect PIN values", async () => {
    const record = await hashPin("2468");

    await expect(verifyPin("2468", record)).resolves.toBe(true);
    await expect(verifyPin("1357", record)).resolves.toBe(false);
  });

  it("generates random salts with the expected length", () => {
    const saltA = generateSalt();
    const saltB = generateSalt();

    expect(saltA).toMatch(/^[A-Za-z0-9+/=]{24}$/);
    expect(saltB).toMatch(/^[A-Za-z0-9+/=]{24}$/);
    expect(saltA).not.toEqual(saltB);
  });
});
