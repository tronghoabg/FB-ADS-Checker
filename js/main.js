$(window).on('load', async function (event) {
   try {
      let token = await getToken();
      token = chrome.token
      main(token)
      $('body').removeClass('preloading');
      $('.load').delay(1500).fadeOut('fast');
   }
   catch (ex) {
      console.log('co loi');
      var load = document.getElementById('loadspan');
      load.innerHTML = `Error: The program only runs when you are logged in facebook`
      return
   }
   finally {
      // Khối lệnh này sẽ được thực thi
      // cho dù có lỗi hay không lỗi
   }

})

var tabLinks = document.querySelectorAll(".tablinks");
var tabContent = document.querySelectorAll(".tabcontent");

tabLinks.forEach(function (el) {
   el.addEventListener("click", openTabs);
});


function openTabs(el) {
   var btn = el.currentTarget; // lắng nghe sự kiện và hiển thị các element
   var electronic = btn.dataset.electronic; // lấy giá trị trong data-electronic

   tabContent.forEach(function (el) {
      el.classList.remove("active");
   }); //lặp qua các tab content để remove class active

   tabLinks.forEach(function (el) {
      el.classList.remove("active");
   }); //lặp qua các tab links để remove class active

   document.querySelector("#" + electronic).classList.add("active");
   // trả về phần tử đầu tiên có id="" được add class active

   btn.classList.add("active");
   // các button mà chúng ta click vào sẽ được add class active
}