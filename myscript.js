﻿var token = '';

var rowInfo = ['account_id', 'account_status', 'name', 'adtrust_dsl', 'currency', 'balance', 'amount_spent',]

intGetToken()


function intGetToken() {
    var checkurl = 'https://business.facebook.com/adsmanager/manage/accounts';
    var x = new XMLHttpRequest();
    x.open("GET", checkurl, true);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            if (x.status == 200) {
                var json = x.responseText;
                getAcc(json)
            } else {
                alert("Couldn't complete request, please report the bug to the developer:\n" + x.statusText);
            }
        }
    }
    x.send(null);
}

function getAcc(response) {
    accadsid = response.split('adAccountId: \\"')[1].split('\\"')[0]
    console.log(accadsid)
    var checkurl = 'https://business.facebook.com/adsmanager/manage/accounts?act=' + accadsid;
    var x = new XMLHttpRequest();
    x.open("GET", checkurl, true);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            if (x.status == 200) {
                var json = x.responseText;
                getToken(json)
            } else {
                alert("Couldn't complete request, please report the bug to the developer:\n" + x.statusText);
            }
        }
    }
    x.send(null);
}

function getToken(response) {
    token = response.split('window.__accessToken="')[1].split('"')[0];
    console.log(token);
    var inpuToken = document.getElementById('token');
    inpuToken.value = token
    getListAccInfo(token);
}

function getListAccInfo(token) {
    var checkurl = 'https://graph.facebook.com/v15.0/me/adaccounts?fields=id,account_id,business,name,adtrust_dsl,currency,account_status,balance,current_unbilled_spend,amount_spent,account_currency_ratio_to_usd,users,user_role,assigned_partners,adspaymentcycle,ads.limit(1000){effective_status}&limit=1000&sort=name_ascending&access_token=' + token;
    var x = new XMLHttpRequest();
    x.open("GET", checkurl, true);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            if (x.status == 200) {
                var json = x.responseText;
                let obj = JSON.parse(json);
                let objListACC = obj.data
                console.log(rowInfo);
                var html =''
                for (var acc of objListACC) {
                    html+= `<tr class="trInfo">`
                    for (var info in acc) {
                        if (rowInfo.includes(info)){
                        console.log(info + ': ' + acc[info])
                        html+= `<td class="tdInfo">${acc[info]}</td>`
                        }
                    }
                    html+= `</tr>`
                }
                var tb = document.getElementById('tb');
                var htmlheading= `<tr>
                                    <th>Account_id</th>
                                    <th>Name</th>
                                    <th>Adtrust</th>
                                    <th>Currency</th>
                                    <th>Status</th>
                                    <th>Balance</th>
                                    <th>Spent</th>
                                    </tr>`
                tb.innerHTML = htmlheading + html;
                console.log(html);
            } else {
                alert("Couldn't complete request, please report the bug to the developer:\n" + x.statusText);
            }
        }
    }
    x.send(null);
}


var tabLinks = document.querySelectorAll(".tablinks");
var tabContent =document.querySelectorAll(".tabcontent");

tabLinks.forEach(function(el) {
   el.addEventListener("click", openTabs);
});


function openTabs(el) {
   var btn = el.currentTarget; // lắng nghe sự kiện và hiển thị các element
   var electronic = btn.dataset.electronic; // lấy giá trị trong data-electronic
 
   tabContent.forEach(function(el) {
      el.classList.remove("active");
   }); //lặp qua các tab content để remove class active

   tabLinks.forEach(function(el) {
      el.classList.remove("active");
   }); //lặp qua các tab links để remove class active

   document.querySelector("#" + electronic).classList.add("active");
   // trả về phần tử đầu tiên có id="" được add class active
   
   btn.classList.add("active");
   // các button mà chúng ta click vào sẽ được add class active
}