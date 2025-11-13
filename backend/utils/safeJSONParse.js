const safeJSONParse = (value, fallback = []) => {
    if (!value || value === "undefined" || value.trim() === "") {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch (e) {
        console.warn("Invalid JSON received:", value);
        return fallback;
    }
};

export default safeJSONParse;