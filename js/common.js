
//To format the time in '' ago format
function getFormattedTime(time){
    var tempTime = moment(time, 'hhmm').fromNow(true);
    tempTime = tempTime.replace("seconds", "s");
    tempTime = tempTime.replace("a few s", "seconds");
    tempTime = tempTime.replace("a minute", "1m");
    tempTime = tempTime.replace(" minutes", "m");
    tempTime = tempTime.replace("an hour", "1h");
    tempTime = tempTime.replace(" hours", "h");
    return tempTime;
}


//Returns today, and current time
function getCurrentTime(type){
          
          var today = new Date();
          var time;
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();
          var hour = today.getHours();
          var mins = today.getMinutes();

          if(dd<10) {
              dd = '0'+dd;
          } 

          if(mm<10) {
              mm = '0'+mm;
          } 

          if(hour<10) {
              hour = '0'+hour;
          } 

          if(mins<10) {
              mins = '0'+mins;
          }

          today = dd + '-' + mm + '-' + yyyy;
          time = hour + '' + mins;


    if(type == 'TIME'){
    	return time;
    }

    if(type == 'DATE')
    	return today;
	 
}


//Returns first letters of the 2 words in the string
function getImageCode(text){
	text = text.replace(/[^a-zA-Z ]/g, "");
	var words = text.split(' ');

	if(words.length > 1){
		return words[0].substring(0,1)+words[1].substring(0,1);
	}
	else{
		return (text.substring(0, 2)).toUpperCase();
	}
}



/*Toast*/
var toastShowingInterval;
function showToast(message, color){

    clearInterval(toastShowingInterval);

    var x = document.getElementById("infobar")
    if(color){
      x.style.background = color;
    }

		x.innerHTML = message;
		x.className = "show";
		toastShowingInterval = setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000); 

    if(color == '#e74c3c'){ //Error
      playNotificationSound('ERROR')
    }

}


/*Undo Toast*/
var undoShowingInterval;
function showUndo(message, undoFunction){

    clearInterval(undoShowingInterval);

    var x = document.getElementById("undoBar")

    document.getElementById("undoBarText").innerHTML = message;
    document.getElementById("undoBarButton").innerHTML = '<button id="undoBarButtonAction" onclick="'+undoFunction+'" class="btn btn-default clearUndoButton">UNDO</button>';

    x.className = "show";
    undoShowingInterval = setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000); 


    $("#undoBarButtonAction").click(function(){
      clearInterval(undoShowingInterval);
      x.className = x.className.replace("show", "");
    });

}



/* USAGE:
  showUndo('Message', 'alert(\'OK\')')
*/

/* Loading */
var loadingLapsedInterval;
function showLoading(time, text){

  document.getElementById("generalLoadingModal").style.display = 'block';

  if(!text && text == ''){
    document.getElementById("generalLoaderText").innerHTML = 'Loading...';
  }
  else{
    document.getElementById("generalLoaderText").innerHTML = text;
  }
  

  var startCount = 10;
  if(time && time != ''){
    startCount = parseInt(time)/1000;
  }

  document.getElementById("generalLoaderCount").innerHTML = startCount;

  loadingLapsedInterval = window.setInterval(function() {
    if(startCount == 1){
      clearInterval(loadingLapsedInterval);
      document.getElementById("generalLoadingModal").style.display = 'none';
    }
    startCount--;
    document.getElementById("generalLoaderCount").innerHTML = startCount;
  }, 1000); 

}

function hideLoading(){
  clearInterval(loadingLapsedInterval);
  document.getElementById("generalLoadingModal").style.display = 'none';
  document.getElementById("generalLoaderCount").innerHTML = '';
  document.getElementById("generalLoaderText").innerHTML = 'Loading...';
}

/* USAGE:
showLoading(3000, 'Custom Text');
*/

