var buff2 = new Buffer.from([128, 10, 255, 36, 3, 0, 43, 49, 50, 46, 53, 97, 128, 15, 255, 36, 2, 0, 49, 48, 46, 49, 49, 46, 50, 48, 49, 57, 93, 128, 5, 191, 24, 0, 6, 36]);
var comp_buff = new Buffer.from([164, 0, 1]);
var buff3 = new Buffer.from([0x40, 0x01, 19, 40]);
var buff4 = new Buffer.from([36,1,0,49,55,58,48,57,32,32]);

console.log('1. #:' + buff2.toString('ascii') + ':#');

let x = Buffer.compare(buff2.slice(0,3), new Buffer.from([164, 0, 1]));
console.log(x);

console.log("buff3: ", buff3.toString('hex'));

console.log('buff4 ', buff4.toString('hex'));
console.log('buff4 ' + buff4.slice(3,9));


