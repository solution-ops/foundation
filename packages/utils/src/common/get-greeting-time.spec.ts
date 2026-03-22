import { describe, expect, it } from "vitest";

import { getGreetingTime } from "./get-greeting-time";

describe("getGreetingTime", () => {
  it("should return the correct greeting time", () => {
    expect(getGreetingTime(10)).toBe("morning");
    expect(getGreetingTime(14)).toBe("afternoon");
    expect(getGreetingTime(20)).toBe("evening");
  });
});
