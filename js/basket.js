// =====================================
// AI BASKET BUILDER V1
// =====================================

function generateBasket(){

const body =
document.getElementById(
"basketBody"
);

if(!body) return;

const candidates =

[...allStocks]

.filter(stock=>{

return (

stock.score>=80 &&

(stock.volume_ratio || 0)>=1 &&

(stock.price || 0)>100

);

})

.sort((a,b)=>{

return getConviction(b)-getConviction(a);

})

.slice(0,7);
const allocation =

150000 /
candidates.length;

let html='';

candidates.forEach(

(stock,index)=>{

const qty =

Math.floor(

allocation/

stock.price

);

html += `

<tr>

<td>${index+1}</td>

<td>${stock.symbol}</td>

<td>${stock.sector}</td>

<td>${stock.score}</td>

<td>₹${allocation.toFixed(0)}</td>

<td>${qty}</td>

</tr>

`;

});

body.innerHTML =
html;

}
// =====================================
// AI CONVICTION SCORE
// =====================================

function getConviction(stock){

let score = 0;

score += stock.score || 0;

if((stock.volume_ratio||0)>=1.5)
score += 5;

if(stock.btst_candidate)
score += 5;

if(stock.swing_candidate)
score += 5;

if(stock.hilega_milega)
score += 5;

return score;

}