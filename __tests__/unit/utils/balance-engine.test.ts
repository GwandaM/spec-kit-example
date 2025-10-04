import { calculateSettlements, type NetBalance, type Settlement } from "@/lib/utils/balance-engine";

describe("calculateSettlements", () => {
  const expectTwoDecimals = (settlements: Settlement[]) => {
    settlements.forEach((settlement) => {
      const scaled = Math.round(settlement.amount * 100);
      expect(Math.abs(settlement.amount * 100 - scaled)).toBeLessThan(1e-6);
    });
  };

  it("generates a single settlement for two-member scenario", () => {
    const netBalances: NetBalance[] = [
      { memberId: "alice", net: 100 },
      { memberId: "bob", net: -100 },
    ];

    const settlements = calculateSettlements(netBalances, "USD");

    expect(settlements).toEqual([
      {
        fromMemberId: "bob",
        toMemberId: "alice",
        amount: 100,
        currency: "USD",
      },
    ]);

    expectTwoDecimals(settlements);
  });

  it("handles three-member triangle scenario", () => {
    const netBalances: NetBalance[] = [
      { memberId: "alex", net: 50 },
      { memberId: "bianca", net: -20 },
      { memberId: "chris", net: -30 },
    ];

    const settlements = calculateSettlements(netBalances, "USD");

    expect(settlements).toHaveLength(2);
    expect(settlements).toEqual(
      expect.arrayContaining([
        {
          fromMemberId: "bianca",
          toMemberId: "alex",
          amount: 20,
          currency: "USD",
        },
        {
          fromMemberId: "chris",
          toMemberId: "alex",
          amount: 30,
          currency: "USD",
        },
      ])
    );
    expectTwoDecimals(settlements);
  });

  it("minimizes transactions through netting", () => {
    const netBalances: NetBalance[] = [
      { memberId: "amy", net: 40 },
      { memberId: "bryan", net: 10 },
      { memberId: "cara", net: -25 },
      { memberId: "derek", net: -25 },
    ];

    const settlements = calculateSettlements(netBalances, "USD");

    expect(settlements).toHaveLength(3);
    expect(settlements).toEqual(
      expect.arrayContaining([
        {
          fromMemberId: "cara",
          toMemberId: "amy",
          amount: 25,
          currency: "USD",
        },
        {
          fromMemberId: "derek",
          toMemberId: "amy",
          amount: 15,
          currency: "USD",
        },
        {
          fromMemberId: "derek",
          toMemberId: "bryan",
          amount: 10,
          currency: "USD",
        },
      ])
    );
    expectTwoDecimals(settlements);
  });

  it("rounds to two decimals for fractional cents", () => {
    const netBalances: NetBalance[] = [
      { memberId: "a", net: 10.01 },
      { memberId: "b", net: -3.339999 },
      { memberId: "c", net: -6.67 },
    ];

    const settlements = calculateSettlements(netBalances, "USD");

    expect(settlements).toEqual(
      expect.arrayContaining([
        {
          fromMemberId: "b",
          toMemberId: "a",
          amount: 3.34,
          currency: "USD",
        },
        {
          fromMemberId: "c",
          toMemberId: "a",
          amount: 6.67,
          currency: "USD",
        },
      ])
    );
    expectTwoDecimals(settlements);
  });

  it("returns empty settlements when already balanced", () => {
    const netBalances: NetBalance[] = [
      { memberId: "one", net: 0 },
      { memberId: "two", net: 0 },
    ];

    const settlements = calculateSettlements(netBalances, "USD");

    expect(settlements).toEqual([]);
  });
});
