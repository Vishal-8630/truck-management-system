export const filterText = (input: string) => {
    return input.replace(/[^a-zA-Z ]/g, '');
}

export const filterNumber = (input: string) => {
    return input.replace(/[^0-9 ]/g, '');
}

export const filterAddress = (input: string) => {
  return input.replace(/[^a-zA-Z0-9\s,./-]/g, '');
};