const normalizedError = (err: any, message: string): Record<string, string> => {
    const errorData = err.response?.data?.errors;
    let errors: Record<string, string> = {};
    if (errorData && Object.keys(errorData).length > 0) {
        errors = errorData;
    } else {
        errors = { message };
    }
    return errors;
}

export default normalizedError;