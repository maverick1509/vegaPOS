
function switchLiveOrderRenderType(){
  
  var filterLiveOrdersFlag = window.localStorage.filterLiveOrdersKOTFlag ? window.localStorage.filterLiveOrdersKOTFlag : 'DINE';

  if(filterLiveOrdersFlag == 'DINE'){
    window.localStorage.filterLiveOrdersKOTFlag = 'OTHER';
    $('#switchLiveOrderRenderTypeButton').html('Showing Non-Dine Orders');
    renderAllKOTs();
  }
  else{
    window.localStorage.filterLiveOrdersKOTFlag = 'DINE';
    $('#switchLiveOrderRenderTypeButton').html('Showing Dine Orders');
    renderAllKOTs();
  }

}

function getAddressFormattedLive(kot){

  if(kot.orderDetails.modeType == 'PARCEL'){
    return "<tag style='display: block;'>Token <b>#"+kot.table+"</b></tag>" + (kot.customerName != "" ? '<b>'+kot.customerName+'</b>' : '') + (kot.customerMobile != '' ? '<tag style="display: block">Mob. <b>'+kot.customerMobile+'</b></tag>' : '');
  }
  else if(kot.orderDetails.modeType == 'TOKEN'){
    return "Token <b>#"+kot.table+"</b>";
  }
  else if(kot.orderDetails.modeType == 'DELIVERY'){
    var address = JSON.parse(decodeURI(kot.table));
    
    var result = (address.name != '' ? '<b>'+address.name+'</b><br>' : '')+
    (address.flatNo != '' ? address.flatNo+', ' : '') + (address.flatName != '' ? address.flatName+'<br>' : '<br>')+
    (address.landmark != '' ? address.landmark+', ' : '') + (address.area != '' ? address.area+'<br>' : '<br>')+
    (address.contact != '' ? 'Mob. <b>'+address.contact+'</b>' : '');
    return result;
  }
}

function renderAllKOTs() {

    var filterLiveOrdersFlag = window.localStorage.filterLiveOrdersKOTFlag ? window.localStorage.filterLiveOrdersKOTFlag : 'DINE';
    if(filterLiveOrdersFlag == 'DINE'){
      $('#switchLiveOrderRenderTypeButton').html('Showing Dine Orders');
    }
    else{
      $('#switchLiveOrderRenderTypeButton').html('Showing Non-Dine Orders');
    }

    $('#switchLiveOrderRenderTypeButton').removeClass('hiddenLiveButton');
    document.getElementById("switchLiveOrderRenderTypeButton").style.display = 'block';


    //document.getElementById("fullKOT").innerHTML = '';

    var runningKOTList = [];

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/_design/kot-fetch/_view/fetchall',
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
        if(data.total_rows > 0){
            
            runningKOTList = data.rows;

            var n = 0;
            var running_count_dine = 0;
            var running_count_other = 0;


            while(runningKOTList[n]){

                var tempStore = n;

                $.ajax({
                  type: 'GET',
                  url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+runningKOTList[n].id,
                  timeout: 10000,
                  success: function(data) {

                    if(data._id != ''){
                            
                            var kot = data;

                            if(filterLiveOrdersFlag == 'DINE'){

                              if(running_count_dine == 0){
                                  document.getElementById("liveKOTMain").innerHTML = '<div class="col-xs-12 kotListing"> <ul id="fullKOT"> </ul> </div>';
                              }

                              if(kot.orderDetails.modeType == 'DINE'){

                                  running_count_dine++;

                                  var i = 0;
                                  var fullKOT = "";
                                  var begKOT = "";
                                  var itemsInCart = "";
                                  var items = "";

                                  begKOT = '<li> <a href="#" '+getColorPaper(kot.timeKOT == '' ? kot.timePunch : kot.timeKOT)+' onclick="liveOrderOptions(\''+kot.KOTNumber+'\')"> <h2>' + kot.KOTNumber + ' <tag class="tableName">'+kot.table+'</tag></h2><div class="itemList"> <table>';
                                  while (i < kot.cart.length) {
                                      itemsInCart = itemsInCart + '<tr> <td class="name">' +(kot.cart[i].isCustom ? kot.cart[i].name+' ('+kot.cart[i].variant+')' : kot.cart[i].name )+ (kot.cart[i].comments && kot.cart[i].comments != "" ? ' <i class="fa fa-comment" style="font-size: 80%"></i>' : '') +'</td> <td class="price">x ' + kot.cart[i].qty + '</td> </tr>';
                                      i++;
                                  }

                                  items = begKOT + itemsInCart + '</table> </div>'+(i > 6?'<more class="more">More Items</more>':'')+
                                                          '<tag class="bottomTag">'+
                                                          '<p class="tagSteward">' +(kot.stewardName != ''? kot.stewardName   : 'Unknown Staff')+ '</p>'+
                                                          '<p class="tagUpdate">'+(kot.timeKOT == ''? 'Order punched '+getFormattedTime(kot.timePunch)+' ago': 'Order modified '+getFormattedTime(kot.timeKOT)+' ago' )+'</p>'+
                                                          '</tag> </a>';

                                  fullKOT = fullKOT + items + '</li>';
                                  finalRender(fullKOT);
                              }
                            }
                            else{

                              if(running_count_other == 0){
                                  document.getElementById("liveKOTMain").innerHTML =  '<div class="col-xs-12 kotListing"><div class="col-xs-12 kotListing" style="padding: 45px 40px">'+
                                                                                      '<div class="box box-primary">'+
                                                                                        '<div class="box-body">'+
                                                                                            '<div class="box-header" style="padding: 10px 0px">'+
                                                                                               '<h3 class="box-title" style="padding: 5px 0px; font-size: 21px;">Active Non-Dine Orders</h3>'+
                                                                                            '</div>'+
                                                                                            '<div class="table-responsive">'+
                                                                                                '<table class="table" style="margin: 0">'+
                                                                                                    '<col width="20%"><col width="40%"><col width="20%"><col width="20%">'+
                                                                                                    '<thead style="background: #f4f4f4;">'+
                                                                                                        '<tr>'+
                                                                                                            '<th style="text-align: left">KOT No.</th>'+
                                                                                                            '<th style="text-align: left">Order Summary</th>'+
                                                                                                            '<th style="text-align: center">Punched</th>'+
                                                                                                            '<th style="text-align: left">Reference</th>'+
                                                                                                        '</tr>'+
                                                                                                    '</thead>'+
                                                                                                '</table>'+
                                                                                                '<table class="table" style="margin: 0">'+
                                                                                                    '<col width="20%"><col width="40%"><col width="20%"><col width="20%">'+
                                                                                                    '<tbody id="fullKOT"></tbody>'+
                                                                                                '</table>'+
                                                                                            '</div>'+
                                                                                            '<div class="clearfix"></div>'+
                                                                                        '</div>'+
                                                                                    '</div>'+
                                                                                    '</div></div>';
                              }

                              if(kot.orderDetails.modeType != 'DINE'){
                                  
                                    running_count_other++;

                                    var n = 0;
                                    var itemsList = '';
                                    while(kot.cart[n]){
                                      itemsList = itemsList + kot.cart[n].name + (kot.cart[n].isCustom ? '- '+kot.cart[n].variant : '') + ' ('+kot.cart[n].qty+'). ';
                                      n++;
                                    }

                                    var tableList =               '<tr style="font-size: 16px;" class="liveOrderNonDine" onclick="liveOrderOptionsNonDine(\''+kot.KOTNumber+'\')">'+
                                                                      '<td><b>#'+kot.KOTNumber+'</b><tag style="display: block; color: #dc2e6f; font-size: 12px;">'+kot.orderDetails.modeType+'</tag>'+(kot.orderDetails.reference != '' ? '<tag style="display: block; color: gray">Ref. <b>'+kot.orderDetails.reference+'</b></tag>' : '')+'</td>'+
                                                                      '<td style="font-size: 95%">'+itemsList+'</td>'+
                                                                      '<td style="text-align: center">'+getFormattedTime(kot.timePunch)+' ago</td>'+
                                                                      '<td style="text-align: left; font-size: 14px;">'+getAddressFormattedLive(kot)+'</td>'+
                                                                  '</tr>';
 
                                  finalRender(tableList); 
                                                           
                              }
                          } //Else
                    } //data.docs
                    
                   
                    if(tempStore == runningKOTList.length - 1){ //last iteration
                      if(filterLiveOrdersFlag == 'DINE'){
                        if(running_count_dine == 0){
                          document.getElementById("liveKOTMain").innerHTML = '<tag style="font-size: 32px; font-weight: 200; color: #cecfd0; text-align: center; padding-top: 25%; display: block">No active Dine Orders</tag>';
                        }
                      }
                      else{
                        if(running_count_other == 0){
                          document.getElementById("liveKOTMain").innerHTML = '<tag style="font-size: 32px; font-weight: 200; color: #cecfd0; text-align: center; padding-top: 25%; display: block">No active Non-Dine Orders</tag>';
                        }
                      }
                    }


                  }//Success

                });  

                n++;   
            }


        }
        else{
          document.getElementById("liveKOTMain").innerHTML = '<tag style="font-size: 32px; font-weight: 200; color: #cecfd0; text-align: center; padding-top: 25%; display: block">No active Orders</tag>';
          
          setTimeout(function(){
            if(currentRunningPage == 'live-orders')
              $('#switchLiveOrderRenderTypeButton').addClass('hiddenLiveButton'); 
          }, 500);

          setTimeout(function(){
            if(currentRunningPage == 'live-orders')
              document.getElementById("switchLiveOrderRenderTypeButton").style.display = 'none'; 
          }, 2499);

          return '';
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
        return '';
      }

    }); 
}

function getColorPaper(lastUpdate){
  
  var recordedTime = moment(lastUpdate, 'hhmm');
  var timeNow = moment(new Date(), 'hhmm');
  var duration = (moment.duration(timeNow.diff(recordedTime))).asSeconds();

  if(duration < 0){
    var midnight = moment('2359', 'hhmm');
    var firstDuration = (moment.duration(recordedTime.diff(midnight))).asSeconds();
    var secondDuration = (moment.duration(midnight.diff(timeNow))).asSeconds();
    duration = firstDuration + secondDuration;
  }

  if(duration > 900 && duration < 1800){ //More than 15 minutes
    return 'style="background: #ffc"'; //Yellow
  }
  else if(duration >= 1800){ //More than 30 Minutes
    return 'style="background: #fcc"'; //Red
  }
  
}


function finalRender(fullKOT) {
  document.getElementById("fullKOT").innerHTML += fullKOT;
}

function liveOrderOptionsNonDine(kotID){

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
        if(data._id == kot_request_data){
          var kot = data;

          if(isUserAnAdmin){
            document.getElementById("liveOrderOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader"><b>'+kot.KOTNumber+'</b> - '+kot.orderDetails.modeType+'</h1>'+
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="pushToEditKOT(\''+kot.KOTNumber+'\')"><i class="fa fa-pencil-square-o" style=""></i><tag style="padding-left: 15px">Edit Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsNonDineClose(); printDuplicateKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-print" style=""></i><tag style="padding-left: 15px">Duplicate KOT</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsNonDineClose(); generateBillFromKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-file-text-o" style=""></i><tag style="padding-left: 15px">Generate Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-danger tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="cancelRunningKOTOrder(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-ban" style=""></i><tag style="padding-left: 15px">Cancel Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+  
                        '<button class="btn btn-default tableOptionsButton" onclick="liveOrderOptionsNonDineClose()">Close</button>';
          }
          else{
            document.getElementById("liveOrderOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader"><b>'+kot.KOTNumber+'</b> - '+kot.orderDetails.modeType+'</h1>'+
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="pushToEditKOT(\''+kot.KOTNumber+'\')"><i class="fa fa-pencil-square-o" style=""></i><tag style="padding-left: 15px">Edit Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsNonDineClose(); printDuplicateKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-print" style=""></i><tag style="padding-left: 15px">Duplicate KOT</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsNonDineClose(); generateBillFromKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-file-text-o" style=""></i><tag style="padding-left: 15px">Generate Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-default tableOptionsButton" onclick="liveOrderOptionsNonDineClose()">Close</button>';
          }


          document.getElementById("liveOrderOptionsModal").style.display = 'block';


          /*
            EasySelect Tool (LISTS)
          */
          var li = $('#liveOrderOptionsModalContent .easySelectTool_liveOrderOption');
          var liSelected = li.eq(0).addClass('selectOptionLiveOrder');

          var easySelectTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#liveOrderOptionsModal').is(':visible')) {

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
                    document.getElementById("liveOrderOptionsModal").style.display ='none';
                    easySelectTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)

                    $("#liveOrderOptionsModal .easySelectTool_liveOrderOption").each(function(){
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
        else{
          showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
      }

    }); 
}

function liveOrderOptionsNonDineClose(){
    document.getElementById("liveOrderOptionsModal").style.display = 'none';
}



function liveOrderOptions(kotID){


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
        if(data._id == kot_request_data){
          var kot = data;

          if(isUserAnAdmin){
            document.getElementById("liveOrderOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+kot.table+'</b></h1>'+
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="pushToEditKOT(\''+kotID+'\')"><i class="fa fa-pencil-square-o" style=""></i><tag style="padding-left: 15px">Edit Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="pickTableForTransferOrder(\''+kot.table+'\', \''+kot.KOTNumber+'\')"><i class="fa fa-exchange" style=""></i><tag style="padding-left: 15px">Change Table</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsNonDineClose(); printDuplicateKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-print" style=""></i><tag style="padding-left: 15px">Duplicate KOT</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsClose(); generateBillFromKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-file-text-o" style=""></i><tag style="padding-left: 15px">Generate Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-danger tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="cancelRunningKOTOrder(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-ban" style=""></i><tag style="padding-left: 15px">Cancel Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+  
                        '<button class="btn btn-default tableOptionsButton" onclick="liveOrderOptionsClose()">Close</button>';
          }
          else{
            document.getElementById("liveOrderOptionsModalContent").innerHTML = '<h1 class="tableOptionsHeader">Table <b>'+kot.table+'</b></h1>'+
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="pushToEditKOT(\''+kotID+'\')"><i class="fa fa-pencil-square-o" style=""></i><tag style="padding-left: 15px">Edit Order</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsNonDineClose(); printDuplicateKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-print" style=""></i><tag style="padding-left: 15px">Duplicate KOT</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+ 
                        '<button class="btn btn-success tableOptionsButtonBig easySelectTool_liveOrderOption" onclick="liveOrderOptionsClose(); generateBillFromKOT(\''+kot.KOTNumber+'\', \'LIVE_ORDERS\')"><i class="fa fa-file-text-o" style=""></i><tag style="padding-left: 15px">Generate Bill</tag><tag class="listSelectionIcon"><i class="fa fa-caret-right"></i></tag></button>'+
                        '<button class="btn btn-default tableOptionsButton" onclick="liveOrderOptionsClose()">Close</button>';
          }

          document.getElementById("liveOrderOptionsModal").style.display = 'block';


          /*
            EasySelect Tool (LISTS)
          */
          var li = $('#liveOrderOptionsModalContent .easySelectTool_liveOrderOption');
          var liSelected = li.eq(0).addClass('selectOptionLiveOrder');

          var easySelectTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...')
            if($('#liveOrderOptionsModal').is(':visible')) {

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
                    document.getElementById("liveOrderOptionsModal").style.display ='none';
                    easySelectTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)

                    $("#liveOrderOptionsModal .easySelectTool_liveOrderOption").each(function(){
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
        else{
          showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
      }

    }); 
}

function liveOrderOptionsClose(){
    document.getElementById("liveOrderOptionsModal").style.display = 'none';
}

function cancelRunningKOTOrder(kotID, pageRef){
  liveOrderOptionsClose();
  liveOrderOptionsNonDineClose();
  cancelRunningOrder(kotID, pageRef);
}


/* To print Duplicate KOT */
function printDuplicateKOT(kotID, optionalSource){

    showLoading(10000, 'Fetching...');

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

        hideLoading();
        showToast('Duplicate KOT printed Successfully', '#27ae60');

        if(data._id == kot_request_data){
          
                  

                  /*
                    **********************************************
                    OLD - Direct Printing from Client (deprecated)
                    **********************************************

                      var obj = data;
                      var original_order_object_cart = obj.cart;
                      
                      var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
                      var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

                          var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                          var default_set_KOT_printer_data = null;
                          var only_KOT_printer = null;


                          findDefaultKOTPrinter();

                          function findDefaultKOTPrinter(){

                                var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

                                var g = 0;
                                while(allConfiguredPrintersList[g]){

                                  if(allConfiguredPrintersList[g].type == 'KOT'){
                                    for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                        if(allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer){
                                          default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                                        }
                                        else if(only_KOT_printer == null){
                                          only_KOT_printer = allConfiguredPrintersList[g].list[a];
                                        }
                                    }

                                    break;
                                  }
                                 
                                  g++;
                                }
                          }

                          if(default_set_KOT_printer_data == null){
                            default_set_KOT_printer_data = only_KOT_printer;
                          }
                      



                      if(isKOTRelayingEnabled){

                        showPrintingAnimation();

                        var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
                        var relaySkippedItems = [];

                        populateRelayRules();

                        function populateRelayRules(){
                          var n = 0;
                          while(relayRuleList[n]){

                            relayRuleList[n].subcart = [];

                            for(var i = 0; i < obj.cart.length; i++){
                              if(obj.cart[i].category == relayRuleList[n].name && relayRuleList[n].printer != ''){
                                relayRuleList[n].subcart.push(obj.cart[i]);
                              }
                            } 

                            if(n == relayRuleList.length - 1){
                              generateRelaySkippedItems();
                            }

                            n++;
                          }

                          if(relayRuleList.length == 0){
                            generateRelaySkippedItems();
                          }
                        }

                        function generateRelaySkippedItems(){
                          var m = 0;
                          while(obj.cart[m]){

                            if(relayRuleList.length != 0){
                              for(var i = 0; i < relayRuleList.length; i++){
                                if(obj.cart[m].category == relayRuleList[i].name && relayRuleList[i].printer != ''){
                                  //item found
                                  break;
                                }

                                if(i == relayRuleList.length - 1){ //last iteration and item not found
                                  relaySkippedItems.push(obj.cart[m])
                                }
                              }
                            }
                            else{ //no relays set, skip all items
                              relaySkippedItems.push(obj.cart[m]);
                            } 

                            if(m == obj.cart.length - 1){

                              //Print Relay Skipped items (if exists)
                              var relay_skipped_obj = obj;
                              relay_skipped_obj.cart = relaySkippedItems;
                              
                              if(relaySkippedItems.length > 0){
                                
                                  //sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT');

                                  var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                                  
                                  if(defaultKOTPrinter == ''){
                                    sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT');
                                    if(isKOTRelayingEnabledOnDefault){
                                        sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                    
                                        printRelayedKOT(relayRuleList); 
                                    }
                                    else{
                                        var preserved_order = obj;
                                        preserved_order.cart = original_order_object_cart;
                                        sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                    
                                        printRelayedKOT(relayRuleList); 
                                    }

                                  }
                                  else{
                                        
                                        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                                        var selected_printer = '';

                                        var g = 0;
                                        while(allConfiguredPrintersList[g]){
                                          if(allConfiguredPrintersList[g].type == 'KOT'){
                                        for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                              if(allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter){
                                                selected_printer = allConfiguredPrintersList[g].list[a];
                                                
                                                if(isKOTRelayingEnabledOnDefault){
                                                  sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                                
                                                  printRelayedKOT(relayRuleList); 
                                                }
                                                else{
                                                  var preserved_order = obj;
                                                  preserved_order.cart = original_order_object_cart;
                                                  sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                                
                                                  printRelayedKOT(relayRuleList); 
                                                }

                                                break;
                                              }
                                          }
                                          }
                                          

                                          if(g == allConfiguredPrintersList.length - 1){
                                            if(selected_printer == ''){ //No printer found, print on default!
                                                if(isKOTRelayingEnabledOnDefault){
                                                  sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                                
                                                  printRelayedKOT(relayRuleList); 
                                                }
                                                else{
                                                  var preserved_order = obj;
                                                  preserved_order.cart = original_order_object_cart;
                                                  sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                                
                                                  printRelayedKOT(relayRuleList); 
                                                }
                                            }
                                          }
                                          
                                          g++;
                                        }
                                  }                                
                              }
                              else{
                                if(!isKOTRelayingEnabledOnDefault){
                                  var preserved_order = obj;
                                  preserved_order.cart = original_order_object_cart;

                                  sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                
                                  printRelayedKOT(relayRuleList); 
                                } 
                                else{
                                  printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE'); 
                                }
                              }

                              
                              
                            }

                            m++;
                          }
                        }

                        function printRelayedKOT(relayedList, optionalRequest){

                          var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                          var g = 0;
                          var allPrintersList = [];

                          while(allConfiguredPrintersList[g]){

                              if(allConfiguredPrintersList[g].type == 'KOT'){ //filter only KOT Printers
                                  for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                      allPrintersList.push({
                                        "name": allConfiguredPrintersList[g].list[a].name,
                                        "target": allConfiguredPrintersList[g].list[a].target,
                                        "template": allConfiguredPrintersList[g].list[a]
                                      });
                                  }

                                  //Start relay after some significant delay. 
                                  //Printing of relay skipped items might not be completed yet...
                                  if(optionalRequest == 'NO_DELAY_PLEASE'){
                                      startRelayPrinting(0);
                                  }
                                  else{
                                    setTimeout(function(){ 
                                       startRelayPrinting(0);
                                    }, 888);
                                  }

                              break;
                            }

                              if(g == allConfiguredPrintersList.length - 1){
                                  if(optionalRequest == 'NO_DELAY_PLEASE'){
                                        startRelayPrinting(0);
                                  }
                                  else{
                                      setTimeout(function(){ 
                                         startRelayPrinting(0);
                                      }, 888);
                                  }
                              }
                            
                              g++;
                          }


                          function startRelayPrinting(index){
                            
                            console.log('Relay Print - Round '+index+' on '+allPrintersList[index].name);
                            
                            var relayedItems = [];
                            for(var i = 0; i < relayedList.length; i++){
                              if(relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name){
                                relayedItems = relayedItems.concat(relayedList[i].subcart)  
                              }

                              if(i == relayedList.length - 1){ //last iteration
                                if(relayedItems.length > 0){
                                  var relayedNewObj = obj;
                                  relayedNewObj.cart = relayedItems;

                                  sendToPrinter(relayedNewObj, 'DUPLICATE_KOT', allPrintersList[index].template);

                                  if(allPrintersList[index+1]){
                                    //go to next after some delay
                                    setTimeout(function(){ 
                                      startRelayPrinting(index+1);
                                    }, 999);
                                  }
                                  else{
                                    finishPrintingAnimation();
                                  }
                                }
                                else{
                                  //There are no items to relay. Go to next.
                                  if(allPrintersList[index+1]){
                                    startRelayPrinting(index+1);
                                  }
                                  else{
                                    finishPrintingAnimation();
                                  }
                                }
                              }
                            }
                          }
                          


                          //LEGACY - Start
                          function startRelayPrinting(index){

                            console.log('Relay Print - Round '+index+' on '+allPrintersList[index].name)

                                    //add some delay
                                    setTimeout(function(){ 
                                  
                                        var relayedItems = [];
                                        for(var i = 0; i < relayedList.length; i++){
                                          if(relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name){
                                            relayedItems = relayedItems.concat(relayedList[i].subcart)  
                                          }

                                          if(i == relayedList.length - 1){ //last iteration
                                            var relayedNewObj = obj;
                                            relayedNewObj.cart = relayedItems;

                                            if(relayedItems.length > 0){
                                              
                                              sendToPrinter(relayedNewObj, 'DUPLICATE_KOT', allPrintersList[index].template);
                                              
                                              if(allPrintersList[index+1]){
                                                startRelayPrinting(index+1);
                                              }
                                            }
                                            else{
                                              if(allPrintersList[index+1]){
                                                startRelayPrinting(index+1);
                                              }
                                            }
                                          }
                                        }

                                    }, 999);
                          }
                          //LEGACY - End


                        }
                      }
                      else{ //no relay (normal case)
                        
                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                        
                        if(defaultKOTPrinter == ''){
                          sendToPrinter(obj, 'DUPLICATE_KOT');
                        }
                        else{
                              
                              var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                              var selected_printer = '';

                              var g = 0;
                              while(allConfiguredPrintersList[g]){
                                if(allConfiguredPrintersList[g].type == 'KOT'){
                              for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                    if(allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter){
                                      selected_printer = allConfiguredPrintersList[g].list[a];
                                      sendToPrinter(obj, 'DUPLICATE_KOT', selected_printer);
                                      break;
                                    }
                                }
                                }
                                

                                if(g == allConfiguredPrintersList.length - 1){
                                  if(selected_printer == ''){ //No printer found, print on default!
                                    sendToPrinter(obj, 'DUPLICATE_KOT');
                                  }
                                }
                                
                                g++;
                              }
                        }
                          
                      }

                  */



                  /*
                      LATEST - Printing from Single Server (Pre-release 2019 March)
                  */

                    //Get staff info.
                    var loggedInStaffInfo = window.localStorage.loggedInStaffData ?  JSON.parse(window.localStorage.loggedInStaffData) : {};
                  
                    if(jQuery.isEmptyObject(loggedInStaffInfo)){
                      loggedInStaffInfo.name = 'Default';
                      loggedInStaffInfo.code = '0000000000';
                    } 

                    var printRequestObject = data;

                    printRequestObject.printRequest = {
                      "KOT": printRequestObject._id,
                      "action": "KOT_DUPLICATE",
                      "table": data.table,
                      "staffName": loggedInStaffInfo.name,
                      "staffCode": loggedInStaffInfo.code,
                      "machine": window.localStorage.appCustomSettings_SystemName && window.localStorage.appCustomSettings_SystemName != "" ? window.localStorage.appCustomSettings_SystemName : window.localStorage.accelerate_licence_machineUID,
                      "time": moment().format('HHmm'),
                      "date": moment().format('DD-MM-YYYY'),
                      "comparison": []
                    };

                    delete printRequestObject._rev;
                    delete printRequestObject._id;

                  //Post to local Server
                  $.ajax({
                    type: 'POST',
                    url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot_print_requests/',
                    data: JSON.stringify(printRequestObject),
                    contentType: "application/json",
                    dataType: 'json',
                    timeout: 10000,
                    success: function(data) {
                        if(data.ok){
                    
                      }
                      else{
                        showToast('Print Failed: KOT was not printed.', '#e74c3c');
                      }
                    },
                    error: function(data){  
                        if(data.responseJSON.error == "conflict"){
                          showToast('The same KOT is yet to be printed. Failed!!!!!', '#e74c3c');
                        } 
                        else{
                          showToast('System Error: Unable to save data to the local server. Please contact Accelerate Support if problem persists.', '#e74c3c');
                        }
                    }
                  });   


        }
        else{
          showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
      },
      error: function(data) {
        hideLoading();
        showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
      }
    }); 
}



/*Add to edit KOT*/
function pushToEditKOT(kotID){
 
    liveOrderOptionsClose();

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
              
              document.getElementById("overWriteCurrentOrderModal").style.display = 'block';
              document.getElementById("overWriteCurrentOrderModalConsent").innerHTML = '<button class="btn btn-default" onclick="overWriteCurrentOrderModalClose()" style="float: left">Close</button>'+
                                                      '<button class="btn btn-danger" onclick="overWriteCurrentOrderConsent(\''+(encodeURI(JSON.stringify(kot)))+'\')">Proceed to Over Write</button>';
          
              return '';
          }    

          overWriteCurrentOrder(kot);

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



function overWriteCurrentOrderModalClose(){
    document.getElementById("overWriteCurrentOrderModal").style.display = 'none';  
}

function overWriteCurrentOrderConsent(encodedKOT){
  var kot = JSON.parse(decodeURI(encodedKOT));
  overWriteCurrentOrder(kot);
}

function overWriteCurrentOrder(kot){

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



/* transfer KOT to different table */

/* Seat selector */

function pickTableForTransferOrder(currentTableID, kotID){

    liveOrderOptionsClose();
   
    //To display Large (default) or Small Tables
    var smallTableFlag = '';

    //PRELOAD TABLE MAPPING
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
 
              if(tableData.length < 50 && tableData.length > 30){ //As per UI, it can include 30 large tables 
                smallTableFlag = ' mediumTile';
              }
              else if(tableData.length > 50){
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

  
                                          var renderSectionArea = '';

                                          var n = 0;
                                          while(tableSections[n]){
                                    
                                            var renderTableArea = ''
                                            for(var i = 0; i<tableData.length; i++){
                                                if(tableData[i].value.type == tableSections[n]){

                                                    if(tableData[i].value.status != 0){ /*Occuppied*/
                                                        if(tableData[i].value.status == 1){
                                                            if(currentTableID != '' && currentTableID == tableData[i].value.table){
                                                                renderTableArea = renderTableArea + '<tag class="tableTileBlue'+smallTableFlag+'" onclick="transferKOTAfterProcess(\''+tableData[i].value.table+'\', \''+kotID+'\')">'+
                                                                                                '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                                '<tag class="tableCapacity'+smallTableFlag+'">Current Table</tag>'+
                                                                                                '<tag class="tableInfo'+smallTableFlag+'" style="color: #FFF"><i class="fa fa-check"></i></tag>'+
                                                                                                '</tag>';   
                                                            }   
                                                            else{
                                                                renderTableArea = renderTableArea + '<tag class="tableTileRedDisable'+smallTableFlag+'">'+
                                                                                            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                            '<tag class="tableCapacity'+smallTableFlag+'">'+tableData[i].value.capacity+' Seater</tag>'+
                                                                                            '<tag class="tableInfo'+smallTableFlag+'">Running</tag>'+
                                                                                            '</tag>';                                                       
                                                            }
                                                        }                                   
                                                        else if(tableData[i].value.status == 5){
                                                            if(currentTableID != '' && currentTableID == tableData[i].value.table){
                                                                renderTableArea = renderTableArea + '<tag class="tableTileBlue'+smallTableFlag+'" onclick="transferKOTAfterProcess(\''+tableData[i].value.table+'\', \''+kotID+'\')">'+
                                                                                                '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                                '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ""? "For "+tableData[i].value.assigned : "-")+'</tag>'+
                                                                                                '<tag class="tableInfo'+smallTableFlag+'" style="color: #FFF"><i class="fa fa-check"></i></tag>'+
                                                                                                '</tag>';   
                                                            }   
                                                            else{
                                                                renderTableArea = renderTableArea + '<tag class="tableReserved'+smallTableFlag+'" onclick="transferKOTAfterProcess(\''+tableData[i].value.table+'\', \''+kotID+'\')">'+
                                                                                                '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                                '<tag class="tableCapacity'+smallTableFlag+'">'+(tableData[i].value.assigned != ""? "For "+tableData[i].value.assigned : "-")+'</tag>'+
                                                                                                '<tag class="tableInfo'+smallTableFlag+'">Reserved</tag>'+
                                                                                                '</tag>';   
                                                            }

                                                        }                                   
                                                        else{
                                                            renderTableArea = renderTableArea + '<tag class="tableTileRedDisable'+smallTableFlag+'">'+
                                                                                            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                            '<tag class="tableCapacity'+smallTableFlag+'">'+tableData[i].value.capacity+' Seater</tag>'+
                                                                                            '<tag class="tableInfo'+smallTableFlag+'">Running</tag>'+
                                                                                            '</tag>';                                           
                                                        }

                                                    }
                                                    else{

                                                        if(currentTableID != '' && currentTableID == tableData[i].value.table){
                                                            renderTableArea = renderTableArea + '<tag onclick="transferKOTAfterProcess(\''+tableData[i].value.table+'\', \''+kotID+'\')" class="tableTileBlue'+smallTableFlag+'">'+
                                                                                            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                            '<tag class="tableCapacity'+smallTableFlag+'">'+tableData[i].value.capacity+' Seater</tag>'+
                                                                                            '<tag class="tableInfo'+smallTableFlag+'" style="color: #FFF"><i class="fa fa-check"></i></tag>'+
                                                                                            '</tag>';
                                                        }   
                                                        else{
                                                            renderTableArea = renderTableArea + '<tag onclick="transferKOTAfterProcess(\''+tableData[i].value.table+'\', \''+kotID+'\')" class="tableTileGreen'+smallTableFlag+'">'+
                                                                                            '<tag class="tableTitle'+smallTableFlag+'">'+tableData[i].value.table+'</tag>'+
                                                                                            '<tag class="tableCapacity'+smallTableFlag+'">'+tableData[i].value.capacity+' Seater</tag>'+
                                                                                            '<tag class="tableInfo'+smallTableFlag+'">Free</tag>'+
                                                                                            '</tag>';
                                                        }                                                                   
                                                    }

                                                }
                                            }

                                            renderSectionArea = renderSectionArea + '<div class="row" style="margin: 0">'+
                                                                       '<h1 class="seatingPlanHead'+smallTableFlag+'">'+tableSections[n]+'</h1>'+
                                                                       '<div class="col-lg-12" style="text-align: center;">'+renderTableArea+
                                                                        '</div>'+
                                                                    '</div>'

                                            n++;
                                          }
                                          
                                          document.getElementById("pickTableForTransferOrderModalContent").innerHTML = renderSectionArea;                        
                                          document.getElementById("pickTableForTransferOrderModal").style.display = 'block'; 
                  
                                          var easyActionsTool = $(document).on('keydown',  function (e) {
                                            console.log('Am secretly running...')
                                            if($('#pickTableForTransferOrderModal').is(':visible')) {

                                                  if(e.which == 27){ // Escape (Close)
                                                    document.getElementById("pickTableForTransferOrderModal").style.display ='none';
                                                    easyActionsTool.unbind();
                                                  }

                                            }
                                          });

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


function pickTableForTransferOrderHide(){
    document.getElementById("pickTableForTransferOrderModalContent").innerHTML = '';
    document.getElementById("pickTableForTransferOrderModal").style.display = 'none';
}


function transferKOTAfterProcess(tableNumber, kotID){

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

          if(kotfile.table == tableNumber){ //same table
            return '';
          }

          if(kotfile.orderDetails.modeType != 'DINE'){
            showToast('Error: Order is not a Dine-In order', '#e67e22');
            return '';
          }

          var tableID_old = kotfile.table;
          var tableID_new = tableNumber;

          kotfile.table = tableNumber;

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
                    showToast('Order transfered to Table '+tableNumber+' Successfully', '#27ae60');
                    pickTableForTransferOrderHide();  
                    liveOrderOptionsClose();    
                    renderAllKOTs();  

                    swapTableMapping(tableID_old, tableID_new, kotfile);

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

}


function swapTableMapping(old, newTable, old_kot){

  console.log('Swap', old, newTable)


    //Find the old table
    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+old+'"]&endkey=["'+old+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == old){

                remember_id = tableData._id;
                remember_rev = tableData._rev;

                tableData.status = 0;
                tableData.assigned = "";
                tableData.remarks = "";
                tableData.KOT = "";
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
                        changeNewTable();
                      },
                      error: function(data) {
                        changeNewTable();
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   

              }
              else{
                changeNewTable();
                showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
              }
        }
        else{
          changeNewTable();
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        changeNewTable();
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }
    });



    //Find the new table
    function changeNewTable(){
      $.ajax({
        type: 'GET',
        url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+newTable+'"]&endkey=["'+newTable+'"]',
        timeout: 10000,
        success: function(data) {
          if(data.rows.length == 1){

                var tableData = data.rows[0].value;

                var remember_id = null;
                var remember_rev = null;

                if(tableData.table == newTable){

                  remember_id = tableData._id;
                  remember_rev = tableData._rev;

                  tableData.status = 1;
                  tableData.assigned = old_kot.stewardName;
                  tableData.remarks = old_kot.remarks;
                  tableData.KOT = old_kot.KOTNumber;
                  tableData.lastUpdate = (old_kot.timeKOT != "" ? old_kot.timeKOT : old_kot.timePunch);;
                  tableData.guestName = old_kot.guestName; 
                  tableData.guestContact = old_kot.guestContact; 
                  tableData.reservationMapping = old_kot.reservationMapping;
                  tableData.guestCount = old_kot.guestCount;
                  
                      //Update
                      $.ajax({
                        type: 'PUT',
                        url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                        data: JSON.stringify(tableData),
                        contentType: "application/json",
                        dataType: 'json',
                        timeout: 10000,
                        success: function(data) {
                          
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
}


