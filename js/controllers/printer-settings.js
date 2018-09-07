

function openDeletePrinterConsent(name){

	document.getElementById("deletePrinterConsentModalText").innerHTML = 'Are you sure want to remove the Printer <b>'+name+'</b> from the list?';
	document.getElementById("deletePrinterConsentModalConsent").innerHTML = '<button  class="btn btn-default" onclick="hideDeletePrinterConsent()" style="float: left">Cancel</button>'+
                  							'<button  class="btn btn-danger" onclick="deletePrinterProfile(\''+name+'\')">Delete</button>';
	
	document.getElementById("deletePrinterConsentModal").style.display = "block";

} 

function hideDeletePrinterConsent(){
	document.getElementById("deletePrinterConsentModal").style.display = "none";
} 


function openNewPrinterReRender(){
  var printersList = window.localStorage.connectedPrintersList ? JSON.parse(window.localStorage.connectedPrintersList) : [];
  console.log(printersList)
  if(printersList.length == 0){
    showToast('Error: No printers and drivers found install on this machine.', '#e74c3c');
    return '';
  }

  var n = 0;
  var printerRender = '';
  while(printersList[n]){
    printerRender += '<option value="'+printersList[n].name+'">'+printersList[n].description+'</option>';
    n++;
  }

  document.getElementById("printer_profile_new_printer_type").innerHTML = printerRender;
}


function openNewPrinter(){
  
  var printersList = window.localStorage.connectedPrintersList ? JSON.parse(window.localStorage.connectedPrintersList) : [];

  if(printersList.length == 0){
    showToast('Error: No printers and drivers found install on this machine.', '#e74c3c');
    return '';
  }

	document.getElementById("newPrinterArea").style.display = "block";
	$("#user_profile_new_user_name").focus();
	document.getElementById("openNewPrinterButton").style.display = "none";

  var n = 0;
  var printerRender = '';
  while(printersList[n]){
    printerRender += '<option value="'+printersList[n].name+'">'+printersList[n].description+'</option>';
    n++;
  }

  document.getElementById("printer_profile_new_printer_type").innerHTML = printerRender;
}

function hideNewPrinter(){
	
	document.getElementById("newPrinterArea").style.display = "none";
	document.getElementById("openNewPrinterButton").style.display = "block";
}

function addToActionsList(name, id){
  document.getElementById("actionsResetButton").style.display = 'inline-block';

  if(document.getElementById("printer_profile_new_printer_actions").value == "" || document.getElementById("printer_profile_new_printer_actions").value == "Choose from below list"){
    document.getElementById("printer_profile_new_printer_actions").value = name;
  }
  else{
    document.getElementById("printer_profile_new_printer_actions").value = document.getElementById("printer_profile_new_printer_actions").value + ',' +name;
  }

  document.getElementById(id).style.display = "none";  
}


function resetActionsList(){
    document.getElementById("printer_profile_new_printer_actions").value = '';
    document.getElementById("actionsResetButton").style.display = 'none';
    document.getElementById('allActionsList').innerHTML = 'Actions List: <tag class="extrasSelButton" onclick="addToActionsList(\'KOT\', \'printer_action_0\')" id="printer_action_0">Print KOT</tag> <tag class="extrasSelButton" onclick="addToActionsList(\'BILL\', \'printer_action_1\')" id="printer_action_1">Print Bill</tag>'+
                                    '<tag class="extrasSelButton" onclick="addToActionsList(\'DUPLICATE_BILL\', \'printer_action_2\')" id="printer_action_2">Print Duplicate Bill</tag>'+
                                    '<tag class="extrasSelButton" onclick="addToActionsList(\'REPORT\', \'printer_action_3\')" id="printer_action_3">Print Reports</tag>'+
                                    '<tag class="extrasSelButton" onclick="addToActionsList(\'VIEW\', \'printer_action_4\')" id="printer_action_4">Print View</tag>';
}

function fetchAllPrintersInfo(){

    //Update Connected Printers List
    getPrinterList();

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ZAITOON_CONFIGURED_PRINTERS" 
                  },
      "fields"    : ["identifierTag", "value"]
    }

    $.ajax({
      type: 'POST',
      url: COMMON_LOCAL_SERVER_IP+'/zaitoon_settings/_find',
      data: JSON.stringify(requestData),
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
        if(data.docs.length > 0){
          if(data.docs[0].identifierTag == 'ZAITOON_CONFIGURED_PRINTERS'){

		        var printersList = data.docs[0].value;

            var machineName = window.localStorage.accelerate_licence_machineUID ? window.localStorage.accelerate_licence_machineUID : '';
            if(!machineName || machineName == ''){
                machineName = 'Any';
            }

              var printers = [];

              for(var i=0; i<printersList.length; i++){

                if(printersList[i].systemName == machineName){
                  printers = printersList[i].data;
                  break;
                }
              }

		        var n = 0;
		        var printerRenderContent = '';
		        while(printers[n]){
              var targetActions = (printers[n].actions).toString();
              targetActions = targetActions.replace(",", ", ");
		        	printerRenderContent = printerRenderContent + '<div class="myListedPrinter">'+
                                                 '<center><img src="images/common/printer.png" style="width: 64px; height: 64px;"></center>'+
                                                 '<tag class="myListedPrinterDelete" onclick="openDeletePrinterConsent(\''+printers[n].name+'\')"><i class="fa fa-trash-o"></i></tag>'+
                                                 '<h1 class="myListedPrinterHead">'+printers[n].name+'</h1>'+
                                                 '<p class="myListedPrinterAddress">'+printers[n].type+'</p>'+
                                                 '<p class="myListedPrinterPaper">'+(printers[n].width ? printers[n].width+' mm' : 'Auto')+' x '+(printers[n].height ? printers[n].height+' mm' : 'Auto')+'</p>'+
                                                 '<p class="myListedPrinterActions"><tag style="font-weight: 400">Prints</tag> '+targetActions+'</p>'+
                                           '</div>';
		        	n++;
		        }


		        if(printerRenderContent == ''){
		        	document.getElementById("allPrinterRenderArea").innerHTML = '<p style="margin: 10px 0 0 0; color: #bdc3c7">There are No Printers Configured yet.</p>';
		        }
		        else{
		        	document.getElementById("allPrinterRenderArea").innerHTML = printerRenderContent;
          	}
          }
          else{
            showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  

}

function addNewPrinterProfile(){

	var type = document.getElementById("printer_profile_new_printer_type").value;
	var name = document.getElementById("printer_profile_new_printer_name").value;
  var pwidth = document.getElementById("printer_profile_new_printer_paperwidth").value;
  var pheight = document.getElementById("printer_profile_new_printer_paperheight").value;
  var actions = document.getElementById("printer_profile_new_printer_actions").value;


	var newObj = {};
	newObj.name = name;
	newObj.type = type;
  newObj.height = parseInt(pheight);
  newObj.width = parseInt(pwidth);
  newObj.actions = actions;


	if(name == ''){
		showToast('Warning: Set a name to easily identify the printer (Eg. Kitchen KOT)', '#e67e22');
		return '';
	}

  if(actions == '' || actions == 'Choose from below list'){
    showToast('Warning: Please select atleast one action', '#e67e22');
    return '';
  }

  if(type == ''){
    showToast('Warning: Please select a Printer', '#e67e22');
    return '';
  }

	if(isNaN(pwidth) || pwidth == ''){
		showToast('Warning: Invalid paper with', '#e67e22');
		return '';
	}

  newObj.actions = newObj.actions.split(',');


    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ZAITOON_CONFIGURED_PRINTERS" 
                  },
      "fields"    : ["_rev", "identifierTag", "value"]
    }

    $.ajax({
      type: 'POST',
      url: COMMON_LOCAL_SERVER_IP+'/zaitoon_settings/_find',
      data: JSON.stringify(requestData),
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
      	console.log(data)
        if(data.docs.length > 0){
          if(data.docs[0].identifierTag == 'ZAITOON_CONFIGURED_PRINTERS'){

             var printersList = data.docs[0].value;

             var machineName = window.localStorage.accelerate_licence_machineUID ? window.localStorage.accelerate_licence_machineUID : '';
             if(!machineName || machineName == ''){
                machineName = 'Any';
             }

              var printers = [];
              var listIndex = 0;

              for(var i=0; i<printersList.length; i++){

                if(printersList[i].systemName == machineName){
                  printers = printersList[i].data;
                  listIndex = i;
                  break;
                }
              }

              // if(printers.length == 0){
              //   showToast('System Error: Unable to read Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
              //   return '';
              // }

             var flag = 0;

             for (var i=0; i<printers.length; i++) {
               if (printers[i].name == name){
                  flag = 1;
                  break;
               }
               else if(printers[i].type == type){
                  flag = 2;
                  break;
               }
             }

             if(flag == 1){
               showToast('Warning: Printer Name already taken. Please set a different name.', '#e67e22');
             }
             else if(flag == 2){
               showToast('Warning: Printer is already registered. Please choose a different Printer.', '#e67e22');
             }
             else{

                printers.push(newObj);
                printersList[listIndex].data = printers;

                //Update
                var updateData = {
                  "_rev": data.docs[0]._rev,
                  "identifierTag": "ZAITOON_CONFIGURED_PRINTERS",
                  "value": printersList
                }

                $.ajax({
                  type: 'PUT',
                  url: COMMON_LOCAL_SERVER_IP+'zaitoon_settings/ZAITOON_CONFIGURED_PRINTERS/',
                  data: JSON.stringify(updateData),
                  contentType: "application/json",
                  dataType: 'json',
                  timeout: 10000,
                  success: function(data) {

			                fetchAllPrintersInfo(); //refresh the list
	                	  hideNewPrinter();
                      applyConfiguredPrinters();
                  
                  },
                  error: function(data) {
                    showToast('System Error: Unable to update Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
                  }

                });  

             }
                
          }
          else{
            showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        console.log(data)
        showToast('System Error: Unable to read Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
      }

    });

}


function deletePrinterProfile(name){


    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ZAITOON_CONFIGURED_PRINTERS" 
                  },
      "fields"    : ["_rev", "identifierTag", "value"]
    }

    $.ajax({
      type: 'POST',
      url: COMMON_LOCAL_SERVER_IP+'/zaitoon_settings/_find',
      data: JSON.stringify(requestData),
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
        if(data.docs.length > 0){
          if(data.docs[0].identifierTag == 'ZAITOON_CONFIGURED_PRINTERS'){

             var printersList = data.docs[0].value;

             var printers = [];
             var listIndex = 0;
             
             var machineName = window.localStorage.accelerate_licence_machineUID ? window.localStorage.accelerate_licence_machineUID : '';
             if(!machineName || machineName == ''){
                machineName = 'Any';
             }

             

              for(var i=0; i<printersList.length; i++){

                if(printersList[i].systemName == machineName){
                  printers = printersList[i].data;
                  listIndex = i;
                  break;
                }
              }

              if(printers.length == 0){
                showToast('System Error: Unable to read Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
                return '';
              }



               for (var n=0; n<printers.length; n++) {  
                 if (printers[n].name == name){
                    printers.splice(n,1);
                    break;
                 }
               }

               console.log(printers)
               printersList[listIndex].data = printers;

                //Update
                var updateData = {
                  "_rev": data.docs[0]._rev,
                  "identifierTag": "ZAITOON_CONFIGURED_PRINTERS",
                  "value": printersList
                }

                $.ajax({
                  type: 'PUT',
                  url: COMMON_LOCAL_SERVER_IP+'zaitoon_settings/ZAITOON_CONFIGURED_PRINTERS/',
                  data: JSON.stringify(updateData),
                  contentType: "application/json",
                  dataType: 'json',
                  timeout: 10000,
                  success: function(data) {
            					showToast('Printer <b>'+name+'</b> has been removed successfully', '#27ae60');
            					fetchAllPrintersInfo();
            					hideDeletePrinterConsent();
                      applyConfiguredPrinters();
                  },
                  error: function(data) {
                    showToast('System Error: Unable to make changes in Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
                  }

                });  
                
          }
          else{
            showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  

}
