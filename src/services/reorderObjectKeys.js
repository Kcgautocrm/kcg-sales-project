

export default function reOrderObject(obj, order = []) {
    var newObject = {};
    for(var i = 0; i < order.length; i++) {
        if(obj.hasOwnProperty(order[i])) {
            newObject[order[i]] = obj[order[i]] === undefined ? null : obj[order[i]];
        }
    }
    return newObject;
}