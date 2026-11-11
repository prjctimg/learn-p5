const DESCRIBE_RE = /describe\s*\(\s*(["'])((?:(?!\1).)*)\1\s*\)\s*;?\s*/g;

export function extractDescribeCaption(code: string): string | null {
  DESCRIBE_RE.lastIndex = 0;
  const match = DESCRIBE_RE.exec(code);
  return match ? match[2] : null;
}

export function stripDescribe(code: string): string {
  return code.replace(DESCRIBE_RE, "").trim();
}
