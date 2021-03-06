/*REFERENCE:
Table Status 
0 - Free
1 - Punched Order
2 - Billed
5 - Reserved Table
*/


/*Open/Close Options*/
function openFreeSeatOptions(tableID){
	document.getElementById("freeSeatOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+tableID+'</b></h1>'+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_freeSeatOption" onclick="punchNewOrder(\''+tableID+'\')"><i class="fa fa-plus" style=""></i><tag style="padding-left: 15px">Punch New Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_freeSeatOption" onclick="addToReserveListConsent(\''+tableID+'\')"><i class="fa fa-male" style=""></i><tag style="padding-left: 15px">Reserve this Table</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+  
                  '<button class="btn btn-default tableOptionsButton" onclick="hideFreeSeatOptions()">Close</button>';
	document.getElementById("freeSeatOptionsModal").style.display ='block';

          /*
            EasySelect Tool (LISTS)
          */
          var li = $('#freeSeatOptionsModalContent .easySelectTool_freeSeatOption');
          var liSelected = li.eq(0).addClass('selectOptionLiveOrder');

          var easySelectTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#freeSeatOptionsModal').is(':visible')) {

                 switch(e.which){
                  case 38:{ //  ^ Up Arrow 

                    if(liSelected){
                        liSelected.removeClass('selectOptionLiveOrder');
                        next = liSelected.prev();
                      if(next.length > 0){
                        liSelected = next.addClass('selectOptionLiveOrder');
                      }else{
                        liSelected = li.last().addClass('selectOptionLiveOrder');
                      }
                    }else{
                      liSelected = li.last().addClass('selectOptionLiveOrder');
                    }                      

                    break;
                  }
                  case 40:{ // Down Arrow \/ 

                    if(liSelected){
                      liSelected.removeClass('selectOptionLiveOrder');
                      next = liSelected.next();
                      if(next.length > 0){
                        liSelected = next.addClass('selectOptionLiveOrder');
                      }else{
                        liSelected = li.eq(0).addClass('selectOptionLiveOrder');
                      }
                    }else{
                      liSelected = li.eq(0).addClass('selectOptionLiveOrder');
                    }

                    break;
                  }
                  case 27:{ // Escape (Close)
                    document.getElementById("freeSeatOptionsModal").style.display ='none';
                    easySelectTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)

                    $("#freeSeatOptionsModal .easySelectTool_freeSeatOption").each(function(){
                      if($(this).hasClass("selectOptionLiveOrder")){
                        $(this).click();
                        e.preventDefault(); 
                        easySelectTool.unbind();   
                      }
                    });    

                    break;
                  }
                 }
            }
          });
}

function hideFreeSeatOptions(){
	document.getElementById("freeSeatOptionsModal").style.display ='none';
}



function openReservedSeatOptions(tableID, optionalCustomerName, optionalSaveFlag){
	document.getElementById("reservedSeatOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Reserved Table <b>'+tableID+'</b></h1>'+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_reservedSeatOption" onclick="punchNewOrder(\''+tableID+'\', \''+optionalCustomerName+'\', '+optionalSaveFlag+')"><i class="fa fa-plus" style=""></i><tag style="padding-left: 15px">Punch New Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                  '<button class="btn btn-primary tableOptionsButtonBig easySelectTool_reservedSeatOption" onclick="removeFromReserveList(\''+tableID+'\')"><i class="fa fa-check-square-o" style=""></i><tag style="padding-left: 15px">Free this Table</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+  
                  '<button class="btn btn-default tableOptionsButton" onclick="hideReservedSeatOptions()">Close</button>';
	document.getElementById("reservedSeatOptionsModal").style.display ='block';


          /*
            EasySelect Tool (LISTS)
          */
          var li = $('#reservedSeatOptionsModalContent .easySelectTool_reservedSeatOption');
          var liSelected = li.eq(0).addClass('selectOptionLiveOrder');

          var easySelectTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#reservedSeatOptionsModal').is(':visible')) {

                 switch(e.which){
                  case 38:{ //  ^ Up Arrow 

                    if(liSelected){
                        liSelected.removeClass('selectOptionLiveOrder');
                        next = liSelected.prev();
                      if(next.length > 0){
                        liSelected = next.addClass('selectOptionLiveOrder');
                      }else{
                        liSelected = li.last().addClass('selectOptionLiveOrder');
                      }
                    }else{
                      liSelected = li.last().addClass('selectOptionLiveOrder');
                    }                      

                    break;
                  }
                  case 40:{ // Down Arrow \/ 

                    if(liSelected){
                      liSelected.removeClass('selectOptionLiveOrder');
                      next = liSelected.next();
                      if(next.length > 0){
                        liSelected = next.addClass('selectOptionLiveOrder');
                      }else{
                        liSelected = li.eq(0).addClass('selectOptionLiveOrder');
                      }
                    }else{
                      liSelected = li.eq(0).addClass('selectOptionLiveOrder');
                    }

                    break;
                  }
                  case 27:{ // Escape (Close)
                    document.getElementById("reservedSeatOptionsModal").style.display ='none';
                    easySelectTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)

                    $("#reservedSeatOptionsModal .easySelectTool_reservedSeatOption").each(function(){
                      if($(this).hasClass("selectOptionLiveOrder")){
                        $(this).click();
                        e.preventDefault(); 
                        easySelectTool.unbind();   
                      }
                    });    

                    break;
                  }
                 }
            }
          });

}

function hideReservedSeatOptions(){
	document.getElementById("reservedSeatOptionsModal").style.display ='none';
}


function openOccuppiedSeatOptions(tableInfo){


  // LOGGED IN USER INFO

  var loggedInStaffInfo = window.localStorage.loggedInStaffData ? JSON.parse(window.localStorage.loggedInStaffData): {};
        
  if(jQuery.isEmptyObject(loggedInStaffInfo)){
    loggedInStaffInfo.name = "";
    loggedInStaffInfo.code = "";
    loggedInStaffInfo.role = "";
  }

  //either profile not chosen, or not an admin
  var isUserAnAdmin = false
  if(loggedInStaffInfo.code != '' && loggedInStaffInfo.role == 'ADMIN'){ 
    isUserAnAdmin = true;
  }




	var tableData = JSON.parse(decodeURI(tableInfo));

	if(tableData.status == 1){ /* Not Billed */

    if(isUserAnAdmin){
		  document.getElementById("occuppiedSeatOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+tableData.table+'</b></h1>'+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="moveKOTForEditing(\''+tableData.KOT+'\')"><i class="fa fa-pencil-square-o" style=""></i><tag style="padding-left: 15px">Edit Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="generateBillFromKOT(\''+tableData.KOT+'\', \'SEATING_STATUS\'); hideOccuppiedSeatOptions();"><i class="fa fa-file-text-o" style=""></i><tag style="padding-left: 15px">Generate Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="mergeDifferentBills(\''+tableData.table+'\')"><i class="fa fa-compress" style=""></i><tag style="padding-left: 15px">Merge Orders</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+
                  '<button class="btn btn-danger tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="cancelThisKOT(\''+tableData.KOT+'\')"><i class="fa fa-ban" style=""></i><tag style="padding-left: 15px">Cancel Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                  '<button class="btn btn-danger tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="removeTableMappingWarning(\''+tableData.table+'\')"><i class="fa fa-warning" style="color: yellow"></i><tag style="padding-left: 15px">Remove Mapping</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                  '<button class="btn btn-default tableOptionsButton" onclick="hideOccuppiedSeatOptions()">Close</button> ';
	  }
    else{
      document.getElementById("occuppiedSeatOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+tableData.table+'</b></h1>'+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="moveKOTForEditing(\''+tableData.KOT+'\')"><i class="fa fa-pencil-square-o" style=""></i><tag style="padding-left: 15px">Edit Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="generateBillFromKOT(\''+tableData.KOT+'\', \'SEATING_STATUS\'); hideOccuppiedSeatOptions();"><i class="fa fa-file-text-o" style=""></i><tag style="padding-left: 15px">Generate Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+
                  '<button class="btn btn-default tableOptionsButton" onclick="hideOccuppiedSeatOptions()">Close</button> ';
    }

  }
	else if(tableData.status == 2){ /* Billed */

    if(isUserAnAdmin){
		  document.getElementById("occuppiedSeatOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+tableData.table+'</b></h1>'+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="settlePrintedBill(\''+tableData.KOT+'\')"><i class="fa fa-credit-card" style=""></i><tag style="padding-left: 15px">Settle Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+ 
                  '<button class="btn btn-danger tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="removeTableMappingWarning(\''+tableData.table+'\')"><i class="fa fa-warning" style="color: yellow"></i><tag style="padding-left: 15px">Remove Mapping</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                  '<button class="btn btn-default tableOptionsButton" onclick="hideOccuppiedSeatOptions()">Close</button> ';
	  }
    else{
      document.getElementById("occuppiedSeatOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+tableData.table+'</b></h1>'+
                  '<button class="btn btn-success tableOptionsButtonBig easySelectTool_occuppiedSeatOption" onclick="settlePrintedBill(\''+tableData.KOT+'\')"><i class="fa fa-credit-card" style=""></i><tag style="padding-left: 15px">Settle Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button> '+
                  '<button class="btn btn-default tableOptionsButton" onclick="hideOccuppiedSeatOptions()">Close</button> ';
    }
  }

	document.getElementById("occuppiedSeatOptionsModal").style.display ='block';


          /*
            EasySelect Tool (LISTS)
          */

          var li = $('#occuppiedSeatOptionsModalContent .easySelectTool_occuppiedSeatOption');
          var liSelected = li.eq(0).addClass('selectOptionLiveOrder');

          var easySelectTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#occuppiedSeatOptionsModal').is(':visible')) {

                 switch(e.which){
                  case 38:{ //  ^ Up Arrow 

                    if(liSelected){
                        liSelected.removeClass('selectOptionLiveOrder');
                        next = liSelected.prev();
                      if(next.length > 0){
                        liSelected = next.addClass('selectOptionLiveOrder');
                      }else{
                        liSelected = li.last().addClass('selectOptionLiveOrder');
                      }
                    }else{
                      liSelected = li.last().addClass('selectOptionLiveOrder');
                    }                      

                    break;
                  }
                  case 40:{ // Down Arrow \/ 

                    if(liSelected){
                      liSelected.removeClass('selectOptionLiveOrder');
                      next = liSelected.next();
                      if(next.length > 0){
                        liSelected = next.addClass('selectOptionLiveOrder');
                      }else{
                        liSelected = li.eq(0).addClass('selectOptionLiveOrder');
                      }
                    }else{
                      liSelected = li.eq(0).addClass('selectOptionLiveOrder');
                    }

                    break;
                  }
                  case 27:{ // Escape (Close)
                    document.getElementById("occuppiedSeatOptionsModal").style.display ='none';
                    easySelectTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)

                    $("#occuppiedSeatOptionsModal .easySelectTool_occuppiedSeatOption").each(function(){
                      if($(this).hasClass("selectOptionLiveOrder")){
                        $(this).click();
                        e.preventDefault(); 
                        easySelectTool.unbind();   
                      }
                    });    

                    break;
                  }
                 }
            }
          });

}

function hideOccuppiedSeatOptions(){
	document.getElementById("occuppiedSeatOptionsModal").style.display ='none';
}

function settlePrintedBill(billNumber){
  hideOccuppiedSeatOptions();
  preSettleBill(billNumber, 'SEATING_STATUS');
}

function cancelThisKOT(kotID){
  hideOccuppiedSeatOptions();
  cancelRunningOrder(kotID, 'SEATING_STATUS');
}


function removeTableMappingWarning(tableNumber){
  hideOccuppiedSeatOptions();
  document.getElementById("mappingDeleteConfirmation").style.display = 'block';
  document.getElementById("mappingDeleteConfirmationText").innerHTML = 'You are removing the Order Mapping on <b>Table #'+tableNumber+'</b>. Order will not get affected, only the mapping will be erased. Sure want to continue?'

  document.getElementById("mappingDeleteConfirmationConsent").innerHTML = '<button  class="btn btn-default" onclick="removeTableMappingWarningHide()" style="float: left">Close</button>'+
                                '<button class="btn btn-danger" onclick="removeTableMapping(\''+tableNumber+'\')">Proceed to Remove</button>';


          var easyActionsTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#mappingDeleteConfirmation').is(':visible')) {

                  if(e.which == 27){ // Escape (Close)
                    document.getElementById("mappingDeleteConfirmation").style.display ='none';
                    easyActionsTool.unbind();
                  }

            }
          });
}

function removeTableMappingWarningHide(){
  document.getElementById("mappingDeleteConfirmation").style.display = 'none';
}


function removeTableMapping(tableNumber){

    removeTableMappingWarningHide();

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableNumber+'"]&endkey=["'+tableNumber+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableNumber){

                remember_id = tableData._id;
                remember_rev = tableData._rev;

                tableData.assigned = "";
                tableData.remarks = "";
                tableData.KOT = "";
                tableData.status = 0;
                tableData.lastUpdate = "";  
                tableData.guestName = ""; 
                tableData.guestContact = ""; 
                tableData.reservationMapping = ""; 
                tableData.guestCount = "";            


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        preloadTableStatus();
                      },
                      error: function(data) {
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   


              }
              else{
                showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
              }
        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }

    });

}


function confirmBillMergeFromKOT(kotList, mergedCart, mergedExtras, mergingTables){

	  var kotID = kotList[0]; //Merge all to first KOT

    

    console.log('FINAL MEGR')


    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }

    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotID;

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
      timeout: 10000,
      success: function(data) {
        if(data._id != ""){

          var kotfile = data;

          if(mergedCart && mergedCart.length > 0){
            kotfile.cart = mergedCart;
            kotfile.discount = {};
            kotfile.extras = mergedExtras;
          }

          /*Save changes in KOT*/
                
                //Update
                var updateData = kotfile;

                $.ajax({
                  type: 'PUT',
                  url: COMMON_LOCAL_SERVER_IP+'accelerate_kot/'+(kotfile._id)+'/',
                  data: JSON.stringify(updateData),
                  contentType: "application/json",
                  dataType: 'json',
                  timeout: 10000,
                  success: function(data) {
                      showToast('Orders merged Successfully to Table '+mergingTables[0], '#27ae60');
                      cancelBillMerge();
                      generateBillFromKOT(kotID, 'SEATING_STATUS');

                      /*Remove all other KOTs*/
                      removeOtherKOTS(kotList);

                  },
                  error: function(data) {
                      showToast('System Error: Unable to update the Order. Please contact Accelerate Support.', '#e74c3c');
                  }
                }); 

        }
        else{
          showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  	

	hideOccuppiedSeatOptions();	
}

function removeOtherKOTS(kotList){ /*TWEAK*/

	  var h = 1; //Do not count first KOT
    while(kotList[h]){

        //Set _id from Branch mentioned in Licence
        var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
        if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
          showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
          return '';
        }

        var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotList[h];

        $.ajax({
          type: 'GET',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
          timeout: 10000,
          success: function(data) {
            if(data._id != ""){


                    //Delete KOT                    
                    $.ajax({
                      type: 'DELETE',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_kot/'+(data._id)+'/?rev='+data._rev,
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        console.log('Deleted')
                      }
                    }); 

            }
          }

        });   

      h++;
    }

    removeOtherKOTAfterProcess(kotList);
}


function removeOtherKOTAfterProcess(kotList){

    clearTable(1) //Do not count first KOT
    function clearTable(kot_counter){

      if(kot_counter == kotList.length){ //last KOT/Table mapping to clear
        preloadTableStatus();
        return "";        
      }

      $.ajax({
        type: 'GET',
        url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyKOT?startkey=["'+kotList[kot_counter]+'"]&endkey=["'+kotList[kot_counter]+'"]',
        timeout: 10000,
        success: function(data) {
          if(data.rows.length == 1){

                  var tableData = data.rows[0].value;

                  var remember_id = tableData._id;
                  var remember_rev = tableData._rev;

                  tableData.remarks = "";
                  tableData.assigned = "";
                  tableData.KOT = "";
                  tableData.status = 0;
                  tableData.lastUpdate = "";     
                  tableData.guestName = ""; 
                  tableData.guestContact = ""; 
                  tableData.reservationMapping = ""; 
                  tableData.guestCount = "";     


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        clearTable(kot_counter + 1);
                      },
                      error: function(data) {
                        clearTable(kot_counter + 1);
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });  
          }
          else{
            clearTable(kot_counter + 1);
            showToast('Not Found Error: KOT #'+kotList[kot_counter]+' was not found. Please contact Accelerate Support.', '#e74c3c');
          }
        },
        error: function(data) {
          showToast('System Error: Unable to read KOT data. Please contact Accelerate Support.', '#e74c3c');
        }

      });             
    }
}



function mergeDifferentBills(currentID){
	hideBillPreviewModal();
	hideOccuppiedSeatOptions();

	preloadTableStatus('MERGE_BILLS', currentID);	
}


function punchNewOrder(TableNumber, optionalCustomerName, optionalSaveFlag){

  hideReservedSeatOptions();
  hideFreeSeatOptions();
  

  /* skip if in Editing Mode & has unsaved changes */
  if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != '' && window.localStorage.hasUnsavedChangesFlag == 1){
    showToast('Warning: There are unsaved changes. Print the changed KOT to continue.', '#e67e22');
    return '';
  }

  if(optionalSaveFlag && optionalSaveFlag == 1){
    showToast('Warning: There is already a saved order on Table #'+TableNumber, '#e67e22');
    return '';    
  }


  //to remove cart info, customer info
  var customerInfo = window.localStorage.customerData ?  JSON.parse(window.localStorage.customerData) : {};

  /* skip if not DINE mode */
  if(!customerInfo.modeType || customerInfo.modeType != 'DINE'){
    var billing_modes = window.localStorage.billingModesData ? JSON.parse(window.localStorage.billingModesData): [];
    
    if(billing_modes.length == 0){
      showToast('Warning: There are no billing modes created.', '#e67e22');
      return '';
    }

    var n = 0;
    while(billing_modes[n]){
      if(billing_modes[n].type == 'DINE'){
        customerInfo.mode = billing_modes[n].name;
        customerInfo.modeType = 'DINE';
        
        break;
      }

      if(billing_modes.length == n){
        showToast('Warning: There are no billing modes of type Dine created.', '#e67e22');
        return '';
      }

      n++;
    }   
  }

  customerInfo.name = (optionalCustomerName && optionalCustomerName != '') ? optionalCustomerName : '';
  customerInfo.mobile = "";
  customerInfo.count = "";
  customerInfo.mappedAddress = TableNumber;
  customerInfo.reference = "";
  customerInfo.isOnline = false;


  window.localStorage.customerData = JSON.stringify(customerInfo);
  window.localStorage.edit_KOT_originalCopy = '';

  window.localStorage.accelerate_cart = '';

  window.localStorage.userAutoFound = '';
  window.localStorage.userDetailsAutoFound = '';
  window.localStorage.specialRequests_comments = '';
  window.localStorage.allergicIngredientsData = '[]';


  window.localStorage.hasUnsavedChangesFlag = 0;

  renderPage('new-order', 'Punch Order');
  renderTables();
}

function addToReserveListConsent(tableID){

	hideFreeSeatOptions();
	
	document.getElementById("addToReservedConsentModal").style.display = 'block';
	document.getElementById("addToReserveListConsentButton").innerHTML = '<button  onclick="addToReserveList(\''+tableID+'\')" class="btn btn-success">Proceed and Reserve</button>';
	document.getElementById("addToReserveListConsentTitle").innerHTML = "Reserve Table <b>#"+tableID+"</b>";
	document.getElementById("reserve_table_window_name").value = '';

	$('#reserve_table_window_name').focus();

          var easyActionsTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#addToReservedConsentModal').is(':visible')) {

                  if(e.which == 27){ // Escape (Close)
                    document.getElementById("addToReservedConsentModal").style.display ='none';
                    easyActionsTool.unbind();
                  }

            }
          });

}

function addToReserveListConsentClose(){
	document.getElementById("addToReservedConsentModal").style.display = 'none';
}


function addToReserveList(tableNumber){

	addToReserveListConsentClose();
	 
   var comments = document.getElementById("reserve_table_window_name").value;
   var contact = document.getElementById("reserve_table_window_contact").value;
   var count = document.getElementById("reserve_table_window_count").value;



    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableNumber+'"]&endkey=["'+tableNumber+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableNumber){

                remember_id = tableData._id;
                remember_rev = tableData._rev;

                tableData.remarks = "";
                tableData.assigned = "";
                tableData.KOT = "";
                tableData.status = 5;
                tableData.lastUpdate = "";
                tableData.guestName = comments; 
                tableData.guestContact = contact; 
                tableData.reservationMapping = ""; 
                tableData.guestCount = count != "" ? parseInt(count) : "";        


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        showToast('Table <b>'+tableNumber+'</b> has been marked as Reserved', '#27ae60');
                        hideFreeSeatOptions();
                        preloadTableStatus();
                      },
                      error: function(data) {
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   
              }
              else{
                showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
              }
        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }
    });
}

function removeFromReserveList(tableNumber){

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableNumber+'"]&endkey=["'+tableNumber+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableNumber){

                remember_id = tableData._id;
                remember_rev = tableData._rev;

                tableData.remarks = "";
                tableData.assigned = "";
                tableData.KOT = "";
                tableData.status = 0;
                tableData.lastUpdate = "";    
                tableData.guestName = ""; 
                tableData.guestContact = ""; 
                tableData.reservationMapping = ""; 
                tableData.guestCount = "";      


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        showToast('Table <b>'+tableNumber+'</b> has been marked as Free', '#27ae60');
                        hideReservedSeatOptions();
                        preloadTableStatus();
                      },
                      error: function(data) {
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   
              }
              else{
                showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
              }
        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }
    });
}




// EDIT KOT


/*Add to edit KOT*/
function moveKOTForEditing(kotID){

     hideOccuppiedSeatOptions();

      //Set _id from Branch mentioned in Licence
      var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
      if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
        showToast('Invalid Licence Error: KOT can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
        return '';
      }

      var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotID;

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
      timeout: 10000,
      success: function(data) {
        if(data._id == kot_request_data){
          var kot = data;

          if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){

              var alreadyEditingKOT = JSON.parse(window.localStorage.edit_KOT_originalCopy);
              if(alreadyEditingKOT.KOTNumber == kot.KOTNumber)//if thats the same order, neglect.
              {
                  renderPage('new-order', 'Editing Order');
                  return '';
              }
              else{
                  showToast('Warning! There is already an active order being modified. Please complete it to continue.', '#e67e22');
                  return '';
              }
          }

          if(window.localStorage.accelerate_cart && window.localStorage.accelerate_cart != ''){
              showToast('Warning! There is a new order being punched. Please complete it to continue.', '#e67e22');
              
              document.getElementById("seating_overWriteCurrentOrderModal").style.display = 'block';
              document.getElementById("seating_overWriteCurrentOrderModalConsent").innerHTML = '<button  class="btn btn-default" onclick="seating_overWriteCurrentOrderModalClose()" style="float: left">Close</button>'+
                                                      '<button  class="btn btn-danger" onclick="seating_overWriteCurrentOrderConsent(\''+(encodeURI(JSON.stringify(kot)))+'\')">Proceed to Over Write</button>';
              return '';
          }    

          seating_overWriteCurrentOrder(kot);

        }
        else{
          showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
      }

    }); 
}

function seating_overWriteCurrentOrderModalClose(){
    document.getElementById("seating_overWriteCurrentOrderModal").style.display = 'none';  
}

function seating_overWriteCurrentOrderConsent(encodedKOT){
  var kot = JSON.parse(decodeURI(encodedKOT));
  seating_overWriteCurrentOrder(kot);
}

function seating_overWriteCurrentOrder(kot){

    var customerInfo = {};
    customerInfo.name = kot.customerName;
    customerInfo.mobile = kot.customerMobile;
    customerInfo.count = kot.guestCount;
    customerInfo.mappedAddress = kot.table;
    customerInfo.mode = kot.orderDetails.mode;
    customerInfo.modeType = kot.orderDetails.modeType;
    customerInfo.reference = kot.orderDetails.reference;
    customerInfo.isOnline = kot.orderDetails.isOnline;


    if(kot.specialRemarks && kot.specialRemarks != ''){
      window.localStorage.specialRequests_comments = kot.specialRemarks;
    }
    else{
      window.localStorage.specialRequests_comments = '';
    }

    if(kot.allergyInfo && kot.allergyInfo != []){
      window.localStorage.allergicIngredientsData = JSON.stringify(kot.allergyInfo);
    }
    else{
      window.localStorage.allergicIngredientsData = '';
    }

    //Pending new order will be removed off the cart.
    window.localStorage.accelerate_cart = JSON.stringify(kot.cart);
    window.localStorage.customerData = JSON.stringify(customerInfo);
    window.localStorage.edit_KOT_originalCopy = JSON.stringify(kot);
    renderPage('new-order', 'Running Order');
}






// BILL MERGE

function addToHoldList(id){
	var tempList = window.localStorage.billSelectionMergeHoldList ? JSON.parse(window.localStorage.billSelectionMergeHoldList): [];
	
	/*check if already clicked*/
	var alreadyAdded = false;
	var n = 0;
	while(tempList[n]){
		if(tempList[n] == id){
			tempList.splice(n,1);
			alreadyAdded = true;

			document.getElementById("hold_"+id).innerHTML = 'Order Punched';
			document.getElementById("holdMain_"+id).classList.remove('selectedExtra');	
					
			break;
		}
		n++;
	}

	if(!alreadyAdded){
		tempList.push(id);

		document.getElementById("hold_"+id).innerHTML = '<i class="fa fa-check"></i>';
		document.getElementById("holdMain_"+id).classList.add('selectedExtra');
	}

  var merge_result_text = '';
  var q = 0;
  while(tempList[q]){

    if(q == 0){
      merge_result_text += 'Table '+tempList[q];
    }
    else if (q > 0 && q < tempList.length - 1){
      merge_result_text += ' + Table '+tempList[q];
    }
    else if (q = tempList.length - 1) //last iteration
    { 
      merge_result_text += ' + Table '+tempList[q] + ' <i class="fa fa-arrow-right"></i> ';
    }

    q++;
  }

	if(tempList.length == 1){
		document.getElementById("confirmationRenderArea").innerHTML = '<p style="color: #FFF; margin: 30px; font-size: 18px; text-align: left;">Select Orders to Merge its Bills <button onclick="cancelBillMerge()" class="btn btn-sm btn-default" style="color: #969696; font-size: 18px; padding: 0 6px; position: relative; top: -2px;">Cancel</button></p>';	
	}
	else{
		document.getElementById("confirmationRenderArea").innerHTML = '<p style="color: #FFF; margin: 0; padding: 10px 120px 10px 30px !important; font-size: 18px; text-align: left; line-height: 1.6em">Merge orders on <b>'+merge_result_text+'</b> <b style="font-size: 120%; color: #ffd800">Table '+tempList[0]+'</b>. This can not be revered. Previously applied discounts will be removed. Sure want to Merge Orders? <button class="btn btn-sm btn-success" onclick="mergeBillsInTheHoldList()" style="font-size: 18px; padding: 0 6px; position: relative; top: -2px;">Merge Orders</button> <button onclick="cancelBillMerge()" class="btn btn-sm btn-default" style="color: #969696; font-size: 18px; padding: 0 6px; position: relative; top: -2px;">Cancel</button></p>';
	}

	
	window.localStorage.billSelectionMergeHoldList = JSON.stringify(tempList);

}

function cancelBillMerge(){
	window.localStorage.billSelectionMergeHoldList = '';
	preloadTableStatus();


	document.getElementById("confirmationRenderArea").style.display = 'none';
	document.getElementById("confirmationRenderArea").innerHTML = '';

}


function mergeBillsInTheHoldListAfterProcess(kotList, tableList) {

    var mergedCart = [];
    var mergedExtras = [];
    var kotCount = kotList.length;
    var kotCounter = 0;

    var mergingBillingMode = '';
    var freshCartIndices = 1;

    console.log(kotList, tableList)


    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }


    var n = 0;
    while (n < kotCount) {

      var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotList[n];

      $.ajax({
        type: 'GET',
        url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
        timeout: 10000,
        success: function(data) {
          if(data._id != ""){

            var kotfile = data;

                    if(mergingBillingMode == ''){
                      mergingBillingMode = kotfile.orderDetails.mode;
                    }
                    else{
                      if(mergingBillingMode != kotfile.orderDetails.mode){
                        //Suspend Merge
                        showToast('Operation Aborted! Orders have to be billed under same mode', '#e74c3c');
                        return '';  
                      }
                    }

                    kotCounter++;

                    /*Generate MERGED EXTRAS*/
                    var extraDuplicateFlag = false;
                    for (var g = 0; g < kotfile.extras.length; g++) {

                        var t = 0;
                        extraDuplicateFlag = false;

                        while (mergedExtras[t]) {
                                if (mergedExtras[t].name == kotfile.extras[g].name) {
                                    mergedExtras[t].amount = mergedExtras[t].amount + kotfile.extras[g].amount;
                                    extraDuplicateFlag = true;
                                    break;
                                }
                                t++
                        }

                        if (!extraDuplicateFlag) { //No duplicate, push the extra wholely.
                            mergedExtras.push(kotfile.extras[g]);
                        }        
                    }

                    /*Generate MERGED CART*/
                    var itemDuplicateFlag = false;

                    for (var f = 0; f < kotfile.cart.length; f++) {

                        var m = 0;
                        itemDuplicateFlag = false;

                        if (kotfile.cart[f].isCustom) {
                            while (mergedCart[m]) {
                                if (mergedCart[m].code == kotfile.cart[f].code && mergedCart[m].variant == kotfile.cart[f].variant) {
                                    mergedCart[m].qty += kotfile.cart[f].qty;
                                    itemDuplicateFlag = true;
                                    break;
                                }
                                m++
                            }
                        } else {
                            while (mergedCart[m]) {
                                if (mergedCart[m].code == kotfile.cart[f].code) {
                                    mergedCart[m].qty += kotfile.cart[f].qty;
                                    itemDuplicateFlag = true;
                                    break;
                                }
                                m++
                            }
                        }

                        if (!itemDuplicateFlag) { //No duplicate, push the item wholely.
                            kotfile.cart[f].cartIndex = freshCartIndices;
                            mergedCart.push(kotfile.cart[f]);

                            freshCartIndices++;
                        }          
                    }

                        //End of iteration
                        if(kotCount == kotCounter){
                          confirmBillMergeFromKOT(kotList, mergedCart, mergedExtras, tableList)
                        }    

            }
            else{
              showToast('Operation Aborted! Order ' + requestData.selector.KOTNumber + ' was not found. Please contact Accelerate Support.', '#e74c3c');
              return '';
            }
            
          },
          error: function(data) {
            showToast('Operation Aborted! Order ' + requestData.selector.KOTNumber + ' was not found. Please contact Accelerate Support.', '#e74c3c');
            return '';
          }

        }); 

     
      n++;    
    }

}


function mergeBillsInTheHoldList(){

	var holdList = window.localStorage.billSelectionMergeHoldList ? JSON.parse(window.localStorage.billSelectionMergeHoldList): [];

	var KOTList = [];

	/*to find KOT IDs mapped against these tables*/
    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/all/',
      timeout: 10000,
      success: function(data) {
        if(data.total_rows > 0){

              var tableData = data.rows;

		              for (var i =0; i < holdList.length; i++){
			              var m = 0;
			              while(m < tableData.length){
			              	if(holdList[i] == tableData[m].value.table){
			              		KOTList.push(tableData[m].value.KOT);
			              		break;
			              	}
			              	m++;
			              }		              	
		              }

		              mergeBillsInTheHoldListAfterProcess(KOTList, holdList); /* Merge KOTs*/	                    
        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }

    });	
}


function preloadTableStatus(mode, currentTableID){

    //To display Large (default) or Small Tables
    var smallTableFlag = '';

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/all/',
      timeout: 10000,
      success: function(data) {
        if(data.total_rows > 0){

              var tableData = data.rows;
              tableData.sort(function(obj1, obj2) {
                return obj1.key - obj2.key; //Key is equivalent to sortIndex
              });

 
              if(tableData.length < 60 && tableData.length > 30){ //As per UI, it can include 30 large tables 
                smallTableFlag = ' mediumTile';
              }
              else if(tableData.length > 60){
                smallTableFlag = ' smallTile';
              }

				    var requestData = {
				      "selector"  :{ 
				                    "identifierTag": "ACCELERATE_TABLE_SECTIONS" 
				                  },
				      "fields"    : ["_rev", "identifierTag", "value"]
				    }

				    $.ajax({
				      type: 'POST',
				      url: COMMON_LOCAL_SERVER_IP+'/accelerate_settings/_find',
				      data: JSON.stringify(requestData),
				      contentType: "application/json",
				      dataType: 'json',
				      timeout: 10000,
				      success: function(data) {
				        if(data.docs.length > 0){
				          if(data.docs[0].identifierTag == 'ACCELERATE_TABLE_SECTIONS'){

				              var tableSections = data.docs[0].value;
				              tableSections.sort(); //alphabetical sorting 


								if(mode == 'MERGE_BILLS'){

					            	if(currentTableID){
					            		window.localStorage.billSelectionMergeHoldList = JSON.stringify([currentTableID]);
					            	}
					            	else{
					            		window.localStorage.billSelectionMergeHoldList = JSON.stringify([]);
					            	}

					              var renderSectionArea = '';
					              
					              var totalTablesToMerge = 0;

					              var n = 0;
					              while(tableSections[n]){
					        
					              	var renderTableArea = ''
					              	for(var i = 0; i<tableData.length; i++){
					              		if(tableData[i].value.type == tableSections[n]){

					              			if(tableData[i].value.status != 0){ /*Occuppied*/
												if(tableData[i].value.status == 1){

													if(tableData[i].value.table == currentTableID){

														totalTablesToMerge++;

														renderTableArea = renderTableArea + '<tag class="tableTileRed'+smallTableFlag+' selected">'+
																				            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																				            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																				            '<tag class="tableInfo'+smallTableFlag+'" style="color: #fff"><i class="fa fa-check"></i></tag>'+
																				        	'</tag>';	
													}
													else{

														totalTablesToMerge++;

							              				renderTableArea = renderTableArea + '<tag id="holdMain_'+tableData[i].value.table+'" onclick="addToHoldList(\''+tableData[i].value.table+'\')" class="tableTileRed'+smallTableFlag+'">'+
																				            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																				            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																				            '<tag class="tableInfo'+smallTableFlag+'" id="hold_'+tableData[i].value.table+'" style="color: #fff">Seated '+getFormattedTime(tableData[i].value.lastUpdate)+' ago</tag>'+
																				        	'</tag>';												
													}

												}	
												else if(tableData[i].value.status == 2){
					              				renderTableArea = renderTableArea + '<tag class="tableTileOther'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Billed '+getFormattedTime(tableData[i].value.lastUpdate)+' ago</tag>'+
																		        	'</tag>';	
												}	
												else if(tableData[i].value.status == 5){
					              				renderTableArea = renderTableArea + '<tag class="tableTileOther'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+ (tableData[i].value.assigned == 'Hold Order' ? '<i class="fa fa-cloud-download"></i>' : (tableData[i].value.guestName && tableData[i].value.guestName != "" ? 'For '+tableData[i].value.guestName : 'For Guest')) + '</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">'+(tableData[i].value.assigned == 'Hold Order' ? 'Saved Order' : 'Reserved')+'</tag>'+
																		        	'</tag>';	
												}																									
												else{
					              				renderTableArea = renderTableArea + '<tag class="tableTileOther'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Updated '+getFormattedTime(tableData[i].value.lastUpdate)+' ago</tag>'+
																		        	'</tag>';											
												}


					              			}
					              			else{

					              				renderTableArea = renderTableArea + '<tag class="tableTileOther'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+tableData[i].value.capacity+' Seater</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Free</tag>'+
																		        	'</tag>';		              				
					              			}

					              		}
					              	}

                          if(renderTableArea != ''){
					              	renderSectionArea = renderSectionArea + '<div class="row">'+
															   '<h1 class="seatingPlanHead'+smallTableFlag+'">'+tableSections[n]+'</h1>'+
															   '<div class="col-lg-12" style="text-align: center;">'+renderTableArea+'</div>'+
															'</div>';
                          }

					              	n++;
					              }

					              if(totalTablesToMerge < 2){
					              	showToast('Warning: Atleast two live orders needed to perform Merge Operation', '#e67e22');
					              	cancelBillMerge();
					              	return '';
					              }

					              document.getElementById("fullSeatingRenderArea").innerHTML = renderSectionArea;

					              document.getElementById("confirmationRenderArea").style.display = 'block';
					              document.getElementById("confirmationRenderArea").style.background = '#3498db';
					              document.getElementById("confirmationRenderArea").innerHTML = '<p style="color: #FFF; margin: 30px; font-size: 18px; text-align: left;">Select Orders to Merge Bills <button class="btn btn-sm btn-default" style="color: #969696; font-size: 18px; padding: 0 6px; position: relative; top: -2px;" onclick="cancelBillMerge()">Cancel</button></p>';

					     }
					     else{

					              var renderSectionArea = '';

					              var n = 0;
					              while(tableSections[n]){
					        
					              	var renderTableArea = ''
					              	for(var i = 0; i<tableData.length; i++){
					              		if(tableData[i].value.type == tableSections[n]){

					              			if(tableData[i].value.status != 0){ /*Occuppied*/
												if(tableData[i].value.status == 1){
					              				renderTableArea = renderTableArea + '<tag onclick="openOccuppiedSeatOptions(\''+encodeURI(JSON.stringify(tableData[i].value))+'\')" class="tableTileRed'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Seated '+getFormattedTime(tableData[i].value.lastUpdate)+' ago</tag>'+
																		        	'</tag>';	
												}
												else if(tableData[i].value.status == 2){
					              				renderTableArea = renderTableArea + '<tag onclick="openOccuppiedSeatOptions(\''+encodeURI(JSON.stringify(tableData[i].value))+'\')" class="tableTileYellow'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Billed '+getFormattedTime(tableData[i].value.lastUpdate)+' ago</tag>'+
																		        	'</tag>';	
												}
												else if(tableData[i].value.status == 5){
					              				renderTableArea = renderTableArea + '<tag onclick="openReservedSeatOptions(\''+tableData[i].value.table+'\', \''+tableData[i].value.assigned+'\', '+(tableData[i].value.assigned == 'Hold Order' ? 1 : 0)+')" class="tableReserved'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+ (tableData[i].value.assigned == 'Hold Order' ? '<i class="fa fa-cloud-download"></i>' : (tableData[i].value.guestName && tableData[i].value.guestName != "" ? 'For '+tableData[i].value.guestName : 'For Guest')) + '</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">'+(tableData[i].value.assigned == 'Hold Order' ? 'Saved Order' : 'Reserved')+'</tag>'+
																		        	'</tag>';	
												}									
												else{
					              				renderTableArea = renderTableArea + '<tag onclick="openOccuppiedSeatOptions(\''+encodeURI(JSON.stringify(tableData[i].value))+'\')" class="tableTileRed'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ''? tableData[i].value.assigned: tableData[i].value.capacity+' Seater')+'</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Updated '+getFormattedTime(tableData[i].value.lastUpdate)+' ago</tag>'+
																		        	'</tag>';											
												}


					              			}
					              			else{

					              				renderTableArea = renderTableArea + '<tag onclick="openFreeSeatOptions(\''+tableData[i].value.table+'\')" class="tableTileGreen'+smallTableFlag+'">'+
																		            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
																		            '<tag class="tableCapacity'+smallTableFlag+'">'+tableData[i].value.capacity+' Seater</tag>'+
																		            '<tag class="tableInfo'+smallTableFlag+'">Free</tag>'+
																		        	'</tag>';		              				
					              			}

					              		}
					              	}

                          if(renderTableArea != ''){
					              	renderSectionArea = renderSectionArea + '<div class="row">'+
															   '<h1 class="seatingPlanHead'+smallTableFlag+'">'+tableSections[n]+'</h1>'+
															   '<div class="col-lg-12" style="text-align: center;">'+renderTableArea+'</div>'+
															'</div>';
                          }

					              	n++;
					              }
					              document.getElementById("fullSeatingRenderArea").innerHTML = renderSectionArea;		            	
					            }



				                
				          }
				          else{
				            showToast('Not Found Error: Table Sections data not found. Please contact Accelerate Support.', '#e74c3c');
				          }
				        }
				        else{
				          showToast('Not Found Error: Table Sections data not found. Please contact Accelerate Support.', '#e74c3c');
				        }

				      },
				      error: function(data) {
				        showToast('System Error: Unable to read Table Sections data. Please contact Accelerate Support.', '#e74c3c');
				      }

				    });

        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }

    });
}