import { abusedDomains } from "../data/abused.ts";
import { stoplist } from "../data/stoplist.ts";
import { tlds } from "../data/tlds.ts";
import { domains } from "../data/domains.ts";

interface IsAcademicOptions {
  ignoreAbuseList: boolean;
  ignoreStopList: boolean;
  ignoreTLDs: boolean;
}

function extractDomainParts(emailOrDomain: string) {
  let result = emailOrDomain.trim().toLowerCase();

  const atIndex = result.indexOf("@");
  if (atIndex !== -1) {
    result = result.substring(atIndex + 1);
  }

  const protocolIndex = result.indexOf("://");
  if (protocolIndex !== -1) {
    result = result.substring(protocolIndex + 3);
  }

  const colonIndex = result.indexOf(":");
  if (colonIndex !== -1) {
    result = result.substring(0, colonIndex);
  }

  return result.split(".").reverse();
}

function checkSet(set: Set<string>, parts: string[]): boolean {
  let subj = "";
  for (const part of parts) {
    subj = part + subj;
    if (set.has(subj)) return true;

    subj = `.${subj}`;
  }
  return false;
}

export function isStoplisted(parts: string[]): boolean {
  return checkSet(stoplist, parts);
}

export function isAbuselisted(parts: string[]): boolean {
  return checkSet(abusedDomains, parts);
}

export function isUnderTLD(parts: string[]): boolean {
  return checkSet(tlds, parts);
}

export function findSchoolNames(emailOrDomain: string): string[] | null {
  const parts = extractDomainParts(emailOrDomain);

  let subj = "";
  for (const part of parts) {
    subj = part + subj;
    if (domains.has(subj)) return domains.get(subj) ?? null;

    subj = `.${subj}`;
  }

  return null;
}

export function isAcademic(
  emailOrDomain: string,
  options: IsAcademicOptions,
): boolean {
  const { result } = isAcademicWithReason(emailOrDomain, options);
  return result;
}

export function isAcademicWithReason(
  emailOrDomain: string,
  { ignoreAbuseList = false, ignoreStopList = false, ignoreTLDs = false } = {},
): { result: boolean; reason: null | string } {
  const parts = extractDomainParts(emailOrDomain);

  if (!ignoreStopList && isStoplisted(parts))
    return { result: false, reason: "stop_listed" };
  if (!ignoreAbuseList && isAbuselisted(parts))
    return { result: false, reason: "abuse_listed" };

  if (!ignoreTLDs && isUnderTLD(parts))
    return { result: true, reason: "tld_detected" };

  const isPresentInMainList = Boolean(findSchoolNames(emailOrDomain));
  return {
    result: isPresentInMainList,
    reason: isPresentInMainList ? "school_name_detected" : "not_found",
  };
}
