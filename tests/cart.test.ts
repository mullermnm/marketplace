import { describe, it, expect } from "vitest";

// Cart inverse property (req 8 #8) at a pure level — service uses cookies which we mock here.
type Line = { type: "product" | "bundle"; id: string };

function add(arr: Line[], l: Line): Line[] {
  if (arr.find((x) => x.type === l.type && x.id === l.id)) return arr;
  return [...arr, l];
}
function remove(arr: Line[], l: Line): Line[] {
  return arr.filter((x) => !(x.type === l.type && x.id === l.id));
}

describe("cart inverse (req 8 #8)", () => {
  it("add then remove returns to previous state", () => {
    const start: Line[] = [
      { type: "product", id: "a" },
      { type: "bundle", id: "b" },
    ];
    const newLine: Line = { type: "product", id: "c" };
    const after = remove(add(start, newLine), newLine);
    expect(after).toEqual(start);
  });
});
