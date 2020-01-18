/**
 * This function is resposible for checking if an object has certain property or not
 * @param object 
 * @param property 
 */
function hasProperty(object: any, property: any) {
    return Object.prototype.hasOwnProperty.call(object, property);
}

/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {
    hasProperty
}