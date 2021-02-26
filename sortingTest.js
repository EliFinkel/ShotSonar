var zipcodes = require('zipcodes');

var workingZips = zipcodes.radius(60035, 30);
console.log(workingZips)
if(workingZips.length > 0){
    var minValues = [];
    for(let i = 0; i < 20; i++){
       // console.log('Loop' + i)
        var minValue = Number.MAX_VALUE;
        var closestZip;
        var closestIndex = 0;
        for(let j = 0; j < workingZips.length; j++){
            var currentValDist = zipcodes.distance(parseInt('60035'), parseInt(workingZips[j]));
            if(currentValDist < minValue){
                minValue = currentValDist;  
                closestZip = workingZips[j];
                closestIndex = j;
            }
        }
        minValues.push(closestZip);
        console.log(minValue);
        workingZips.splice(closestIndex, 1);
    }
    //await sendEmail(req.params.email, minValues);   
    console.log(`Min values: ${minValues}`)
}   