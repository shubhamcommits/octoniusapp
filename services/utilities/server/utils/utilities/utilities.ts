
/**
 * This function is used to remove white spaces to '%20'
 * @param text 
 */
const removeBlankSpaces = (text: string) => {
    return text.replace(/\s/g, '%20');
};

export { removeBlankSpaces }