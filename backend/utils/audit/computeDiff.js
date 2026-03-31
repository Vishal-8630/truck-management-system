const SKIP_KEYS = new Set(["_id", "__v", "createdAt", "updatedAt"]);

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const normalize = (value) => {
  if (value && typeof value.toObject === "function") {
    return value.toObject();
  }
  return value;
};

const isEqual = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

const computeDiff = (before = {}, after = {}, parentPath = "") => {
  const left = normalize(before) || {};
  const right = normalize(after) || {};
  const keys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);

  const changedFields = [];
  const beforeValues = {};
  const afterValues = {};

  for (const key of keys) {
    if (SKIP_KEYS.has(key)) continue;

    const path = parentPath ? `${parentPath}.${key}` : key;
    const a = left?.[key];
    const b = right?.[key];

    if (isObject(a) && isObject(b)) {
      const nested = computeDiff(a, b, path);
      changedFields.push(...nested.changedFields);
      Object.assign(beforeValues, nested.beforeValues);
      Object.assign(afterValues, nested.afterValues);
      continue;
    }

    if (!isEqual(a, b)) {
      changedFields.push(path);
      beforeValues[path] = a ?? null;
      afterValues[path] = b ?? null;
    }
  }

  return { changedFields, beforeValues, afterValues };
};

export default computeDiff;
