import { listToDictByKey } from "./helpers";

describe("listToDictByKey", () => {
  it("should convert a list to a dictionary by key", () => {
    const list = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "Bob" },
    ];

    const expectedDict = {
      1: { id: 1, name: "John" },
      2: { id: 2, name: "Jane" },
      3: { id: 3, name: "Bob" },
    };

    const result = listToDictByKey(list, "id");

    expect(result).toEqual(expectedDict);
  });
});
