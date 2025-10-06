const getNestedValue = (obj: any, path: string): string | undefined => {
    if (!obj || !path) return undefined;
    path = path.split("$")[0];
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export default getNestedValue;