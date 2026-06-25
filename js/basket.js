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

.filter(x=>

x.score>=80

)

.sort(

(a,b)=>

b.score-a.score

)

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