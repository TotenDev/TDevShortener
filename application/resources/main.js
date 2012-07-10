/* 
 * main.js — TDevShortener
 * today is 7/10/12, it is now 5:30 PM
 * created by marcostrovilho
 * see LICENSE for details.
 */

document.onLoad = function (e) {
      Notifications();
}

 //Use default options:
function sendForm(response_id){
      var url = document.getElementById('url').value;
      var element=document.getElementById(response_id);
      var ajax=new XMLHttpRequest();
      ajax.onreadystatechange = function(){
        if(ajax.readyState==4||ajax.readyState==0){
          if (ajax.status==200){
				//A simple notification with no options:
				Notifications().show("Shortned: " +url + "<br>To: " + ajax.responseText);
          } else { window.alert('error ' + ajax.responseText); }
        }
      }
      ajax.open("POST","create/",true);
      ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      ajax.send(url);
}

function OnEnter(evt) {
    var key_code = evt.keyCode  ? evt.keyCode  :
                       evt.charCode ? evt.charCode :
                       evt.which    ? evt.which    : void 0;
    if (key_code == 13) { sendForm('form'); return true; }
}
 

function Notifications() {
  if ( arguments.callee._singletonInstance ) {
		return arguments.callee._singletonInstance;
	} else {
		arguments.callee._singletonInstance = $('body').ttwSimpleNotifications({
            position:'top right',
            autoHide:false,
            notificationClickCallback:function(n){
				console.log("click " + n);
			},
            showCallback:null,
            hideCallback:null
		}); 

		
		return arguments.callee._singletonInstance;
	}
}