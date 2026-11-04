import { CitizenProfile, Scheme, SchemeMatchResult, EligibilityStatus } from '@/types';
import { DEMO_SCHEMES } from './data';
import { evaluateRule } from './rules';

/**
 * Deterministically matches a citizen profile against all registered schemes.
 * LLMs NEVER fabricate eligibility; deterministic rules decide qualification.
 */
export function matchSchemes(profile: CitizenProfile, schemes: Scheme[] = DEMO_SCHEMES): SchemeMatchResult[] {
  return schemes.map((scheme) => matchSingleScheme(profile, scheme))
    .sort((a, b) => {
      // Sort priority: eligible > possibly_eligible > not_eligible
      const rank = { eligible: 3, possibly_eligible: 2, not_eligible: 1 };
      if (rank[a.status] !== rank[b.status]) {
        return rank[b.status] - rank[a.status];
      }
      return b.matchScore - a.matchScore;
    });
}

export function matchSingleScheme(profile: CitizenProfile, scheme: Scheme): SchemeMatchResult {
  const reasons: string[] = [];
  const missingInformation: string[] = [];
  const ruleResults = scheme.rules.map((rule) => evaluateRule(rule, profile));

  let totalWeight = 0;
  let earnedWeight = 0;
  let strictFailed = false;

  for (const res of ruleResults) {
    totalWeight += res.weight;

    if (res.actualValue === undefined || res.actualValue === null || res.actualValue === '') {
      missingInformation.push(res.label);
    } else if (res.passed) {
      earnedWeight += res.weight;
      reasons.push(res.reason);
    } else {
      if (res.isStrict) {
        strictFailed = true;
      }
      reasons.push(`Ineligible condition: ${res.reason}`);
    }
  }

  // Check state residency constraint if scheme is state-specific
  if (scheme.state && scheme.state !== 'All India') {
    if (!profile.state) {
      missingInformation.push(`State of residence required (${scheme.state})`);
    } else if (profile.state.toLowerCase() !== scheme.state.toLowerCase()) {
      strictFailed = true;
      reasons.push(`Requires residency in ${scheme.state}, but citizen resides in ${profile.state}`);
    }
  }

  // Calculate percentage match score
  const matchScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  // Determine eligibility status
  let status: EligibilityStatus = 'not_eligible';

  if (strictFailed) {
    status = 'not_eligible';
  } else if (missingInformation.length === 0 && matchScore >= 70) {
    status = 'eligible';
  } else if (matchScore >= 35 || (missingInformation.length > 0 && !strictFailed)) {
    status = 'possibly_eligible';
  } else {
    status = 'not_eligible';
  }

  // Check missing required documents
  const userDocs = (profile.documentsAvailable || []).map((d) => d.toLowerCase());
  const missingDocuments: string[] = [];

  for (const doc of scheme.requiredDocuments) {
    const docId = doc.id.toLowerCase();
    const docName = doc.name.toLowerCase();
    const hasDoc = userDocs.some((d) => d.includes(docId) || d.includes(docName) || docName.includes(d));
    if (!hasDoc) {
      missingDocuments.push(`${doc.name} (${doc.description})`);
    }
  }

  return {
    scheme,
    status,
    matchScore,
    reasons,
    missingInformation,
    missingDocuments,
    applicationSteps: scheme.applicationSteps
  };
}
