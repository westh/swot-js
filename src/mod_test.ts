import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isAcademicWithReason } from "./mod.ts";

Deno.test("non-academic domain returns not_found", () => {
  const result = isAcademicWithReason("google.com");
  assertEquals(result, { result: false, reason: "not_found" });
});

Deno.test("stop-listed domain returns stop_listed", () => {
  const result = isAcademicWithReason("alum.mit.edu");
  assertEquals(result, { result: false, reason: "stop_listed" });
});

Deno.test("email with non-academic domain returns not_found", () => {
  const result = isAcademicWithReason("foobar@gmail.edu");
  assertEquals(result, { result: false, reason: "not_found" });
});

Deno.test("unknown .edu domain returns not_found", () => {
  const result = isAcademicWithReason("foobar@zz.edu");
  assertEquals(result, { result: false, reason: "not_found" });
});

Deno.test("abuse-listed domain returns abuse_listed", () => {
  const result = isAcademicWithReason("mdx.ac");
  assertEquals(result, { result: false, reason: "abuse_listed" });
});

Deno.test("academic TLD returns tld_detected", () => {
  const result = isAcademicWithReason("foobar@edu.bb");
  assertEquals(result, { result: true, reason: "tld_detected" });
});

Deno.test("subdomain under academic TLD returns tld_detected", () => {
  const result = isAcademicWithReason("foobar@computer.edu.bb");
  assertEquals(result, { result: true, reason: "tld_detected" });
});

Deno.test("known academic institution returns school_name_detected", () => {
  const result = isAcademicWithReason("dickinson.edu");
  assertEquals(result, { result: true, reason: "school_name_detected" });
});
