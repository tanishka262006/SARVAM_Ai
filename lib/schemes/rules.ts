import { CitizenProfile, SchemeRule } from '@/types';

export interface RuleEvaluationResult {
  passed: boolean;
  isStrict: boolean;
  weight: number;
  label: string;
  field: keyof CitizenProfile;
  actualValue: any;
  requiredValue: any;
  reason: string;
}

/**
 * Deterministically evaluates a single scheme rule against a citizen's profile.
 */
export function evaluateRule(rule: SchemeRule, profile: CitizenProfile): RuleEvaluationResult {
  const actualValue = profile[rule.field];
  let passed = false;
  let reason = '';

  // If the profile field is missing or undefined
  if (actualValue === undefined || actualValue === null || actualValue === '') {
    return {
      passed: false,
      isStrict: rule.isStrict,
      weight: rule.weight,
      label: rule.label,
      field: rule.field,
      actualValue: undefined,
      requiredValue: rule.value,
      reason: `Information missing: ${rule.label} (${String(rule.field)})`
    };
  }

  switch (rule.operator) {
    case 'eq':
      if (typeof rule.value === 'string' && typeof actualValue === 'string') {
        passed = actualValue.trim().toLowerCase() === rule.value.trim().toLowerCase();
      } else {
        passed = actualValue === rule.value;
      }
      reason = passed 
        ? `Matched requirement: ${rule.label}` 
        : `Does not match: expected ${rule.value}, but profile has ${actualValue}`;
      break;

    case 'neq':
      passed = actualValue !== rule.value;
      reason = passed ? `Condition met: ${rule.label}` : `Condition failed: value is ${actualValue}`;
      break;

    case 'lte':
      if (typeof actualValue === 'number') {
        passed = actualValue <= Number(rule.value);
        reason = passed 
          ? `Qualified: ₹${actualValue.toLocaleString('en-IN')} is within maximum limit of ₹${Number(rule.value).toLocaleString('en-IN')}`
          : `Exceeds limit: ₹${actualValue.toLocaleString('en-IN')} exceeds threshold of ₹${Number(rule.value).toLocaleString('en-IN')}`;
      }
      break;

    case 'gte':
      if (typeof actualValue === 'number') {
        passed = actualValue >= Number(rule.value);
        reason = passed
          ? `Qualified: ${actualValue} meets minimum requirement of ${rule.value}`
          : `Below minimum: ${actualValue} is less than required ${rule.value}`;
      }
      break;

    case 'in':
      if (Array.isArray(rule.value)) {
        const valStr = String(actualValue).toLowerCase();
        passed = rule.value.some((v: any) => String(v).toLowerCase() === valStr);
        reason = passed ? `Matches category requirement: ${rule.label}` : `Category ${actualValue} not in eligible list`;
      }
      break;

    case 'contains':
      if (typeof actualValue === 'string' && typeof rule.value === 'string') {
        passed = actualValue.toLowerCase().includes(rule.value.toLowerCase());
        reason = passed ? `Matches criteria: ${rule.label}` : `Does not contain keyword "${rule.value}"`;
      }
      break;

    case 'boolean':
      passed = Boolean(actualValue) === Boolean(rule.value);
      reason = passed ? `Status matches: ${rule.label}` : `Status requirement not met`;
      break;

    case 'exists':
      passed = actualValue !== undefined && actualValue !== null && actualValue !== '';
      reason = passed ? `Requirement provided: ${rule.label}` : `Information missing: ${rule.label}`;
      break;

    default:
      passed = false;
      reason = `Unknown rule operator: ${rule.operator}`;
  }

  return {
    passed,
    isStrict: rule.isStrict,
    weight: rule.weight,
    label: rule.label,
    field: rule.field,
    actualValue,
    requiredValue: rule.value,
    reason
  };
}
