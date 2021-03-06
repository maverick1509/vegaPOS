
function generateBillFromKOT(kotID, optionalPageRef){

  console.log('Generate Bill from KOT '+kotID)

/*
  optionalPageRef -- from which page the function is called.
  Based on this info, let us execute callback functions after generateBillFromKOT are executed. 
*/

  if(!optionalPageRef){
    optionalPageRef = '';
  }

  //If there is any change in customer data w.r.t OriginalKOT, do make the changes now;
  var customerInfo = window.localStorage.customerData ?  JSON.parse(window.localStorage.customerData) : {};
  if(jQuery.isEmptyObject(customerInfo)){
    showToast('Customer Details missing', '#e74c3c');
    return '';
  } 


    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: KOT can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }

    var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotID;

    readKOTFile();

    function readKOTFile(){

      $.ajax({
        type: 'GET',
        url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
        timeout: 10000,
        success: function(data) {
          if(data._id != ""){

            console.log('am being called...')

            var kotfile = data;

            if(kotfile.customerName != customerInfo.name || kotfile.customerMobile != customerInfo.mobile || kotfile.guestCount != customerInfo.count){
              
              kotfile.customerName = customerInfo.name;
              kotfile.customerMobile = customerInfo.mobile;
              kotfile.guestCount = customerInfo.count ? parseInt(customerInfo.count) : '';

              var alreadyEditingKOT = [];
              if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
                    alreadyEditingKOT = JSON.parse(window.localStorage.edit_KOT_originalCopy);     
                    alreadyEditingKOT.customerName = customerInfo.customerName;
                    alreadyEditingKOT.customerMobile = customerInfo.customerMobile;
                    alreadyEditingKOT.guestCount = customerInfo.guestCount;
                    window.localStorage.edit_KOT_originalCopy = JSON.stringify(alreadyEditingKOT);               
              

                                      //Update changes on Server
                                      $.ajax({
                                        type: 'PUT',
                                        url: COMMON_LOCAL_SERVER_IP+'accelerate_kot/'+(kotfile._id)+'/',
                                        data: JSON.stringify(kotfile),
                                        contentType: "application/json",
                                        dataType: 'json',
                                        timeout: 10000,
                                        success: function(data) {
                                          readKOTFileAfterProcess();
                                        },
                                        error: function(data) {
                                          readKOTFileAfterProcess();
                                        }
                                      });                              
              }
              else{
                readKOTFileAfterProcess();
              }
            }
            else{
              readKOTFileAfterProcess();
            }


            function readKOTFileAfterProcess(){
              var raw_cart = kotfile.cart;
              var beautified_cart = [];

              for(var n = 0; n < raw_cart.length; n++){
                
                if(n == 0){
                  beautified_cart.push(raw_cart[0]);
                }
                else{

                  var duplicateFound = false;
                  var k = 0;
                  while(beautified_cart[k]){
                    if(beautified_cart[k].code == raw_cart[n].code){
                      if(beautified_cart[k].isCustom && raw_cart[n].isCustom){
                        if(beautified_cart[k].variant == raw_cart[n].variant){
                          beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
                          duplicateFound = true;
                          break;
                        }
                      }
                      else{
                        beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
                        duplicateFound = true;
                        break;
                      }
                    }

                    k++;
                  }

                  if(!duplicateFound){
                    beautified_cart.push(raw_cart[n]);
                  }

                }

              }


              kotfile.cart = beautified_cart;

              generateBillFromKOTAfterProcess(kotfile, optionalPageRef);
            }//read kot after process
            
          }
          else{
            showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
          }
          
        },
        error: function(data) {
          showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
        }

      }); 
    } //read kot file
}

function properRoundOff(amount){
  return Math.round(amount);
}



function generateBillFromKOTAfterProcess(kotfile, optionalPageRef){

/*
  optionalPageRef -- from which page the function is called.
  Based on this info, let us execute callback functions after generateBillFromKOT are executed. 
*/


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

          document.getElementById("billPreviewContentTitle").innerHTML = kotfile.orderDetails.modeType == 'DINE' ? 'Table <b>'+kotfile.table+'</b> <tag style="float: right">#'+kotfile.KOTNumber+'</tag>' : kotfile.orderDetails.mode+'<tag style="float: right">#'+kotfile.KOTNumber+'</tag>';

          var itemList = '';
          var subTotal = 0;
          var packagedSubTotal = 0;

          var qtySum = 0;
          var grandPayableSum = 0;
          var grandPayableSumRounded = 0;

          var n = 0;
          while(kotfile.cart[n]){

              itemList = itemList + '<tr class="success">'+
                  ' <td class="text-center">'+(n+1)+'</td>'+
                  ' <td>'+kotfile.cart[n].name+(kotfile.cart[n].isCustom ? ' ('+kotfile.cart[n].variant+')': '')+'</td>'+
                  ' <td class="text-center"> <span class="text-center sprice"><i class="fa fa-inr"></i>'+kotfile.cart[n].price+'</span></td>'+
                  ' <td class="text-center">x '+kotfile.cart[n].qty+'</td>'+
                  ' <td class="text-right"><span class="text-right ssubtotal"><i class="fa fa-rupee"></i>'+(kotfile.cart[n].price * kotfile.cart[n].qty)+'</span></td>'+
                  ' </tr>';

              //Other calculations
                subTotal = subTotal + (kotfile.cart[n].price * kotfile.cart[n].qty);

                if(kotfile.cart[n].isPackaged){
                  packagedSubTotal += (kotfile.cart[n].price * kotfile.cart[n].qty)
                }

                qtySum = qtySum + kotfile.cart[n].qty;

              
              n++;
          }



          /*Other Charges*/ 
          var otherChargesSum = 0;        
          var otherCharges = '';
          var otherChargerRenderCount = 1;
          var i = 0;


          otherCharges = '<tr class="info">';

          if(kotfile.extras.length > 0){

            for(i = 0; i < kotfile.extras.length; i++){
              if(i%2 == 0){
                otherCharges = otherCharges + '</tr><tr class="info">';
              }

              otherCharges = otherCharges + '<td width="35%" class="cartSummaryRow">'+kotfile.extras[i].name+' ('+(kotfile.extras[i].unit == 'PERCENTAGE'? kotfile.extras[i].value + '%': '<i class="fa fa-inr"></i>'+kotfile.extras[i].value)+')</td><td width="15%" class="text-right cartSummaryRow"><i class="fa fa-inr"></i>'+(Math.round(kotfile.extras[i].amount * 100) / 100)+'</td>';
              otherChargesSum = otherChargesSum + kotfile.extras[i].amount;
              
            }
          }


          otherChargerRenderCount = otherChargerRenderCount + i;



          //Auto Calculate Discount (for Prepaid Orders from App) 
          /* 
            Classify those as 'ONLINE' discounts which are pre-applied discounts 
            Condition: No other discount applied.
          */

          if(!kotfile.discount.amount ||  kotfile.discount.amount == 0){
            if(kotfile.orderDetails.isOnline){
              if(kotfile.orderDetails.onlineOrderDetails.preDiscount && kotfile.orderDetails.onlineOrderDetails.preDiscount != 0){
                savePrediscountToKOT(kotfile.KOTNumber, kotfile.orderDetails.onlineOrderDetails.preDiscount, optionalPageRef);
                return '';
              }
            }
          }



          //Discount
          var discountTag = '';
          if(kotfile.discount.amount && kotfile.discount.amount != 0){
            discountTag = '<td width="35%" class="cartSummaryRow">Discount '+(kotfile.discount.unit == 'PERCENTAGE' ? '('+kotfile.discount.value+'%)' : kotfile.discount.unit == 'FIXED' ? '(<i class="fa fa-inr"></i>'+kotfile.discount.value+')' : '')+'</td><td width="15%" class="text-right cartSummaryRow" style="padding-right:10px; color: #e74c3c !important">- <i class="fa fa-inr"></i>'+kotfile.discount.amount+'</td>';
            //'<tr class="info"><td width="35%" class="cartSummaryRow">Discount</td><td width="15%" class="text-right cartSummaryRow" style="padding-right:10px; color: #e74c3c !important">- <i class="fa fa-inr"></i>'+kotfile.discount.amount+'</td>';
            otherChargesSum = otherChargesSum - kotfile.discount.amount;
          }
          else{
            discountTag = '<td width="35%" class="cartSummaryRow">Discount</td><td width="15%" class="text-right cartSummaryRow" style="padding-right:10px;">0</td>';
          }



          //Customisable Extras
          var customExtraTag = '';
          if(kotfile.customExtras.amount &&  kotfile.customExtras.amount != 0){
            customExtraTag = '<td width="35%" class="cartSummaryRow">'+kotfile.customExtras.type+' ('+(kotfile.customExtras.unit == 'PERCENTAGE'? kotfile.customExtras.value+'%' : '<i class="fa fa-inr"></i>'+kotfile.customExtras.value)+')</td><td width="15%" class="text-right cartSummaryRow" style="padding-right:10px;"><i class="fa fa-inr"></i>'+kotfile.customExtras.amount+'</td>';
            otherChargesSum = otherChargesSum + kotfile.customExtras.amount;
          }
          else{
            customExtraTag = '<td width="35%" class="cartSummaryRow">Other Charges</td><td width="15%" class="text-right cartSummaryRow" style="padding-right:10px;">0</td>';
          }   


          if(otherChargerRenderCount%2 == 0){
            otherCharges = otherCharges + customExtraTag + '</tr>'+
                  '<tr class="info">'+discountTag+
                  '<td class="cartSummaryRow"></td><td class="cartSummaryRow"></td></tr>';
          }
          else{
            otherCharges = otherCharges + '</tr> <tr class="info">'+customExtraTag+discountTag+'</tr>';
          }


          grandPayableSum = subTotal + otherChargesSum;
          grandPayableSum = Math.round(grandPayableSum * 100) / 100;
          grandPayableSumRounded = properRoundOff(grandPayableSum);

          var discountButtonPart = '';
          if(kotfile.discount.amount && kotfile.discount.type != 'COUPON' && kotfile.discount.type != 'NOCOSTBILL' && kotfile.discount.type != 'VOUCHER' && kotfile.discount.type != 'REWARDS'){ /*Discount is Applied Already*/
            discountButtonPart ='                        <div class="">'+
                '                          <button class="btn btn-danger tableOptionsButton breakWord" onclick="removeBillDiscountOnKOT(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Remove Discount</button>'+
                '                        </div>';
          } 
          else{           
            discountButtonPart ='        <div class="" id="applyBillDiscountWindow">'+
                '                          <div id="applyBillDiscountWindowActions" style="display: none">'+
                '                             <div class="row">'+
                '                                <div class="col-lg-12">'+
                '                                  <div class="form-group" style="margin-bottom: 5px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">TYPE</label>'+
                '                                    <select name="unit" id="applyBillDiscountWindow_type" class="form-control input-tip select2" style="width:100%;">'+
                '                                       <option value="OTHER" selected="selected">Other</option>'+
                '                                    </select>'+
                '                                 </div>'+
                '                                 <div class="form-group" style="margin-bottom: 5px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">UNIT</label>'+
                '                                    <select name="unit" id="applyBillDiscountWindow_unit" class="form-control input-tip select2" style="width:100%;" onchange="changeDiscountTypeBillingOptions()">'+
                '                                       <option value="PERCENTAGE" selected="selected">Percentage (%)</option>'+
                '                                       <option value="FIXED">Fixed Amount (Rs)</option>'+
                '                                    </select>'+
                '                                 </div>'+
                '                                   <div class="form-group" style="margin-bottom: 2px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">DISCOUNT VALUE</label>'+
                '                                      <input type="number" value="0" placeholder="Value" style="text-align: center; color: #444" class="form-control tip" id="applyBillDiscountWindow_value" onkeyup="roughCalculateDiscount()" required="required" />'+
                '                                   </div>'+
                '                                   <p style="font-size: 11px; color: #2ecc71">Discount Amount: <tag id="applyBillDiscountWindow_amount">0</tag></p>'+
                '                                </div>'+
                '                                '+
                '                             </div> '+
                '                              <button class="btn btn-default tableOptionsButton breakWord" onclick="closeApplyBillDiscountWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Cancel</button>'+
                '                          </div>'+
                '                          <div id="applyBillDiscountButtonWrap"><button class="btn btn-default tableOptionsButton breakWord" id="applyBillDiscountButton" onclick="openApplyBillDiscountWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Apply Discount</button></div>'+
                '                        </div>';
          }


          var couponButtonPart = '';
          if(kotfile.discount.amount && kotfile.discount.type == 'COUPON'){ /*Coupon is Applied Already*/           
            couponButtonPart ='                          <div class="">'+
                '                          <button class="btn btn-danger tableOptionsButton breakWord" onclick="removeBillCouponOnKOT(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Remove Coupon</button>'+
                '                        </div>';
          }   
          else{         
            couponButtonPart ='                        <div class="" id="applyBillCouponWindow">'+
                '                          <div id="applyBillCouponWindowActions" style="display: none">'+
                '                             <div class="row">'+
                '                                <div class="col-lg-12">'+
                '                                   <div class="form-group" style="margin-bottom: 2px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">COUPON CODE</label>'+
                '                                      <input type="text" value="" placeholder="Coupon Code" style="text-align: center; color: #444; margin-bottom: 5px; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;" class="form-control tip" id="applyBillCouponWindow_code" required="required" />'+
                '                                   </div>'+
                '                                </div>'+
                '                                '+
                '                             </div> '+
                '                              <button class="btn btn-default tableOptionsButton breakWord" onclick="closeApplyBillCouponWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Cancel</button> '+
                '                          </div>'+
                '                          <div id="applyBillCouponButtonWrap"><button class="btn btn-default tableOptionsButton breakWord" id="applyBillCouponButton" onclick="openApplyBillCouponWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Apply Coupon</button></div>'+
                '                        </div>';
          }


          var noCostButtonPart = '';
          if(kotfile.discount.amount && kotfile.discount.type == 'NOCOSTBILL'){ /*No Cost is Applied Already*/          
            noCostButtonPart ='                          <div class="">'+
                '                          <button class="btn btn-danger tableOptionsButton breakWord" onclick="removeNoCostBillOnKOT(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Remove No Cost Bill</button>'+
                '                        </div>';
          }   
          else{         
            noCostButtonPart ='                        <div class="" id="applyNoCostBillWindow">'+
                '                          <div id="applyNoCostBillWindowActions" style="display: none">'+
                '                             <div class="row">'+
                '                                <div class="col-lg-12">'+
                '                                   <div class="form-group" style="margin-bottom: 2px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">COMMENTS</label>'+
                '                                      <input type="text" value="" placeholder="Comments" style="text-align: center; color: #444; margin-bottom: 5px; font-size: 14px;" class="form-control tip" id="applyNoCostBillWindow_comments" required="required" />'+
                '                                   </div>'+
                '                                </div>'+
                '                                '+
                '                             </div> '+
                '                              <button class="btn btn-default tableOptionsButton breakWord" onclick="closeApplyNoCostBillWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Cancel</button> '+
                '                          </div>'+
                '                          <div id="applyNoCostBillButtonWrap"><button class="btn btn-default tableOptionsButton breakWord" id="applyNoCostBillButton" onclick="openMarkNoCostBill(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">No Cost Bill</button></div>'+
                '                        </div>';
          }



          var rewardsButtonPart = '';
          if(kotfile.discount.amount && kotfile.discount.type == 'REWARDS'){ /*Rewards is Applied Already*/           
            rewardsButtonPart = '        <div class="">'+
                '                          <button class="btn btn-danger tableOptionsButton breakWord" id="applyRewardPointsButton" onclick="removeRewardsOnKOT(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Remove Reward Points</button>'+
                '                        </div>';
          }   
          else{         
            rewardsButtonPart = '        <div class="">'+
                '                          <button class="btn btn-default tableOptionsButton breakWord" id="applyRewardPointsButton" onclick="redeemPointsIfAny(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Redeem Points</button>'+
                '                        </div>';
          }




          var customExtrasButtonPart = '';
          if(kotfile.customExtras.amount && kotfile.customExtras.amount != ''){ /*Custom Extra is Applied Already*/
            customExtrasButtonPart ='                        <div class="">'+
                '                          <button class="btn btn-danger tableOptionsButton breakWord" onclick="removeCustomExtraOnKOT(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Remove '+kotfile.customExtras.type+'</button>'+
                '                        </div>';
          } 
          else{           
            customExtrasButtonPart ='                        <div class="" id="applyCustomExtraWindow">'+
                '                          <div id="applyCustomExtraWindowActions" style="display: none">'+
                '                             <div class="row">'+
                '                                <div class="col-lg-12">'+
                '                                  <div class="form-group" style="margin-bottom: 5px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">TYPE</label>'+
                '                                    <select name="unit" id="applyCustomExtraWindow_type" class="form-control input-tip select2" style="width:100%;">'+
                '                                       <option value="OTHER" selected="selected">Other</option>'+
                '                                    </select>'+
                '                                 </div>'+
                '                                 <div class="form-group" style="margin-bottom: 5px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">UNIT</label>'+
                '                                    <select name="unit" id="applyCustomExtraWindow_unit" class="form-control input-tip select2" style="width:100%;" onchange="changeCustomExtraTypeOptions()">'+
                '                                       <option value="PERCENTAGE" selected="selected">Percentage (%)</option>'+
                '                                       <option value="FIXED">Fixed Amount (Rs)</option>'+
                '                                    </select>'+
                '                                 </div>'+
                '                                   <div class="form-group" style="margin-bottom: 2px">'+
                '                                    <label style="font-size: 10px; font-weight: 300">VALUE</label>'+
                '                                      <input type="number" value="0" placeholder="Value" style="text-align: center; color: #444" class="form-control tip" id="applyCustomExtraWindow_value" onkeyup="roughCalculateCustomExtraValue()" required="required" />'+
                '                                   </div>'+
                '                                   <p style="font-size: 11px; color: #2ecc71">Extra Amount: <tag id="applyCustomExtraWindow_amount">0</tag></p>'+
                '                                </div>'+
                '                                '+
                '                             </div> '+
                '                              <button class="btn btn-default tableOptionsButton breakWord" onclick="closeApplyCustomExtraWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Cancel</button> '+
                '                          </div>'+
                '                          <div id="applyCustomExtraButtonWrap"><button class="btn btn-default tableOptionsButton breakWord" id="applyCustomExtraButton" onclick="openApplyCustomExtraWindow(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Add Extra Charges</button></div>'+
                '                        </div>';
          }



          var billActionOptions = ''+
                '                    <div class="col-sm-4">'+
                '                        <h1 style="text-align: center; margin-top: 10px; font-size: 14px; text-transform: uppercase; font-weight: 400; color: #444">Options</h1>'+discountButtonPart+couponButtonPart+customExtrasButtonPart+rewardsButtonPart+noCostButtonPart+
                '                        <div class="">'+
                '                          <button class="btn btn-default tableOptionsButton breakWord" onclick="renderPage(\'seating-status\'); hideBillPreviewModal();">Merge Bills</button>'+
                '                        </div>'+
                '                    </div>';


          document.getElementById("billPreviewContent").innerHTML = '<div class="row">'+
                (isUserAnAdmin ? '' : '<div class="col-sm-2"></div>')+
                '                    <div class="col-sm-8">'+
                '                        <h1 style="text-align: center; margin-top: 10px; font-size: 14px; text-transform: uppercase; font-weight: 400; color: #444">Bill Preview</h1>'+
                '                        <table class="table table-striped table-condensed table-hover list-table" style="margin:0px; z-index: 2;">'+
                '                           <colgroup>'+
                '                              <col width="10%">'+
                '                              <col width="40%">'+
                '                              <col width="15%">'+
                '                              <col width="20%">'+
                '                              <col width="15%">'+
                '                           </colgroup>'+
                '                           <thead id="cartTitleHead">'+
                '                              <tr class="success cartTitleRow">'+
                '                                 <th class="satu cartTitleRow"></th>'+
                '                                 <th class="cartTitleRow">Item</th>'+
                '                                 <th class="cartTitleRow">Price</th>'+
                '                                 <th class="cartTitleRow">Qty</th>'+
                '                                 <th class="cartTitleRow">Subtotal</th>'+
                '                              </tr>'+
                '                           </thead>'+
                '                        </table>'+
                '                        <table class="table table-striped table-condensed table-hover list-table" style="margin:0px;">'+
                '                            <colgroup>'+
                '                              <col width="10%">'+
                '                              <col width="40%">'+
                '                              <col width="15%">'+
                '                              <col width="20%">'+
                '                              <col width="15%">'+
                '                            </colgroup>                            '+
                '                            <tbody>'+itemList+
                '                            </tbody>'+
                '                        </table>'+
                '                        <table class="table table-condensed totals" style="margin: 0">'+
                '                           <tbody>'+
                '                              <tr class="info">'+
                '                                 <td width="35%" class="cartSummaryRow">Total Items</td>'+
                '                                 <td width="15%" class="text-right cartSummaryRow" style="padding-right:10px;"><span id="count">'+qtySum+'</span></td>'+
                '                                 <td width="35%" class="cartSummaryRow">Total</td>'+
                '                                 <td width="15%" class="text-right cartSummaryRow" colspan="2"><span id="total"><i class="fa fa-inr"></i><tag id="grandSumDisplay">'+subTotal+'</tag></span></td>'+
                '                              </tr>'+otherCharges+
                '                              <tr class="success cartSumRow">'+
                '                                 <td colspan="2" class="cartSumRow" style="font-weight: 400 !important; font-size: 14px;">Total Amount</td>'+
                '                                 <td class="text-right cartSumRow" colspan="2" style="font-weight: 400 !important; font-size: 80%;"><span id="total-payable"><i class="fa fa-inr"></i><tag>'+grandPayableSum+'</tag></span></td>'+
                '                              </tr>'+
                '                              <tr class="success cartSumRow">'+
                '                                 <td colspan="2" class="cartSumRow" style="font-weight: 400 !important; font-size: 16px;">Payable Amount</td>'+
                '                                 <td class="text-right cartSumRow" colspan="2"><span id="total-payable"><i class="fa fa-inr"></i><tag>'+grandPayableSumRounded+'</tag></span></td>'+
                '                              </tr>'+
                '                           </tbody>'+
                '                        </table>                        '+
                '                    </div>'+ (isUserAnAdmin ? billActionOptions : '') +
                '                </div>';

          document.getElementById("billPreviewContentActions").innerHTML = '<button id="billButtonAction_generate" class="btn btn-success tableOptionsButton breakWord" onclick="confirmBillGeneration(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\')">Generate Bill</button>'+
                            '<button id="billButtonAction_generateSilently" class="btn btn-success tableOptionsButton breakWord" style="height:5px; display: none;" onclick="confirmBillGeneration(\''+kotfile.KOTNumber+'\', \''+optionalPageRef+'\', \'SILENTLY\')">Generate Silently</button>'+
                            '<button style="margin: 0" id="billButtonAction_cancel" class="btn btn-default tableOptionsButton breakWord" onclick="hideBillPreviewModal()">Close</button>'

          document.getElementById("billPreviewModal").style.display = 'block';

          PREVENT_DUPLICATE_BILL_REQUEST = false;



      //Esc --> Hide
      //Enter --> Submit

          /*
            Actions Tool - Modal
          */
          var duplicateClick = false;
          var easyActionsTool = $(document).on('keydown',  function (e) {
            console.log('Am secretly running...'+duplicateClick)
            if($('#billPreviewModal').is(':visible')) {

                 switch(e.which){
                  case 27:{ // Escape (Close)
                    $('#billButtonAction_cancel').click();
                    easyActionsTool.unbind();
                    $("#triggerClick_PrintBillButton").addClass("shortcutSafe"); //to add back shortcut action
                    break;  
                  }
                  case 13:{ // Enter (Confirm)
                    if(!duplicateClick){
                      $('#billButtonAction_generate').click();
                      e.preventDefault();
                    }

                    duplicateClick = true;
                    easyActionsTool.unbind();
                    break;
                  }
                }
            }
          });
}



/* APPLY COUPON */

function openApplyBillCouponWindow(kotID, optionalPageRef){

  /*Change apply button action*/
  document.getElementById("applyBillCouponButtonWrap").innerHTML = '<button class="btn btn-success tableOptionsButton breakWord" id="applyBillCouponButton" onclick="applyBillCouponOnKOT(\''+kotID+'\', \''+optionalPageRef+'\')">Apply Discount</button>';

  //minimize all other open windows
  //closeApplyBillDiscountWindow(kotID);
  //closeApplyNoCostBillWindow(kotID);

  document.getElementById("applyBillCouponWindow").classList.add('billOptionWindowFrame');
  document.getElementById("applyBillCouponWindowActions").style.display = 'block';
  document.getElementById("applyBillCouponButton").classList.remove('btn-default');
  document.getElementById("applyBillCouponButton").classList.add('btn-success');

  $('#applyBillCouponWindow_code').focus();
  $('#applyBillCouponWindow_code').select();

}


function removeBillCouponOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          if(kotfile.discount.amount){
            kotfile.discount = {};
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
                      showToast('Coupon removed', '#27ae60');
                      generateBillFromKOT(kotID, optionalPageRef);
                      generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);

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


function applyBillCouponOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          var userMobile = kotfile.customerMobile;
          var code = document.getElementById("applyBillCouponWindow_code").value;
          var grandSum = 0;

          if(code == ''){
            return '';
          }

          var n = 0;
          while(kotfile.cart[n]){
            grandSum = grandSum + (kotfile.cart[n].price * kotfile.cart[n].qty);
            n++;
          }



          /*Redeem Coupon*/

          var admin_data = {
            "token": window.localStorage.loggedInAdmin,
            "mobile": userMobile,
            "code": code,
            "totalBillAmount": grandSum
          }

          showLoading(10000, 'Applying Coupon');

          $.ajax({
            type: 'POST',
            url: 'https://www.accelerateengine.app/apis/posredeemcoupon.php',
            data: JSON.stringify(admin_data),
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {
              hideLoading();
              if(data.status){

                /*Apply Discount*/
                if(data.isValid){
                  totalDiscount = data.discount;

                  totalDiscount = Math.round(totalDiscount * 100) / 100;

                  kotfile.discount.amount = totalDiscount;
                  kotfile.discount.type = 'COUPON';
                  kotfile.discount.unit = 'FIXED';
                  kotfile.discount.value = totalDiscount;
                  kotfile.discount.reference = code;
                       

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
                          showToast('Discount of <i class="fa fa-inr"></i>'+totalDiscount+' Applied', '#27ae60');
                          generateBillFromKOT(kotID, optionalPageRef);
                          generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
                        },
                        error: function(data) {
                            showToast('System Error: Unable to update the Order. Please contact Accelerate Support.', '#e74c3c');
                        }
                      });     


                }
                else{
                  showToast('Oops! '+data.validityError, '#e67e22');
                }
              }
              else
              {
                if(data.errorCode == 404){
                  window.localStorage.loggedInAdmin = "";
                  showToast(data.error, '#e74c3c');
                }
                else{
                  showToast(data.error, '#e74c3c');
                }
              }
          },
          error: function(data){
            hideLoading();
            showToast('Error! Unable to reach the Cloud Server. Check your connection.', '#e74c3c');
          }
          });   
          //End - Redeem


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


function closeApplyBillCouponWindow(kotID, optionalPageRef){
  
  /*Change apply button action*/
  document.getElementById("applyBillCouponButtonWrap").innerHTML = '<button class="btn btn-default tableOptionsButton" id="applyBillCouponButton" onclick="openApplyBillCouponWindow(\''+kotID+'\', \''+optionalPageRef+'\')">Apply Coupon</button>';

  document.getElementById("applyBillCouponWindow").classList.remove('billOptionWindowFrame');
  document.getElementById("applyBillCouponWindowActions").style.display = 'none'; 

  document.getElementById("applyBillCouponButton").classList.remove('btn-success');
  document.getElementById("applyBillCouponButton").classList.add('btn-remove');
}





/*APPLY DISCOUNT*/

function openApplyBillDiscountWindow(kotID, optionalPageRef){

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_DISCOUNT_TYPES" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_DISCOUNT_TYPES'){

              var modes = data.docs[0].value;
              modes.sort(); //alphabetical sorting 
              var modesTag = '';

              for (var i=0; i<modes.length; i++){
                if(i == 0)
                    modesTag = '<option value="'+modes[i].name+'" selected="selected">'+modes[i].name+'</option>';
                  else
                    modesTag = modesTag + '<option value="'+modes[i].name+'">'+modes[i].name+'</option>';
              }

              if(!modesTag)
                document.getElementById("applyBillDiscountWindow_type").innerHTML = '<option value="OTHER" selected="selected">Other</option>';
              else
                document.getElementById("applyBillDiscountWindow_type").innerHTML = modesTag;

              /*Change apply button action*/
              document.getElementById("applyBillDiscountButtonWrap").innerHTML = '<button class="btn btn-success tableOptionsButton breakWord" id="applyBillDiscountButton" onclick="applyBillDiscountOnKOT(\''+kotID+'\', \''+optionalPageRef+'\')">Apply Discount</button>';
        
          }
          else{
            showToast('Not Found Error: Discount Types data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Discount Types data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Discount Types data. Please contact Accelerate Support.', '#e74c3c');
      }

    });


  //minimize all other open windows
  //closeApplyBillCouponWindow(kotID);
  //closeApplyNoCostBillWindow(kotID);


  document.getElementById("applyBillDiscountWindow").classList.add('billOptionWindowFrame');
  document.getElementById("applyBillDiscountWindowActions").style.display = 'block';
  document.getElementById("applyBillDiscountButton").classList.remove('btn-default');
  document.getElementById("applyBillDiscountButton").classList.add('btn-success');

  $('#applyBillDiscountWindow_value').focus();
  $('#applyBillDiscountWindow_value').select();

}


function removeBillDiscountOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          if(kotfile.discount.amount){
            kotfile.discount = {};
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

                    showToast('Discount removed', '#27ae60');
                    generateBillFromKOT(kotID, optionalPageRef);
                    generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
                  
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


function applyBillDiscountOnKOT(kotID, optionalPageRef){

    var billing_modes = window.localStorage.billingModesData ? JSON.parse(window.localStorage.billingModesData): [];

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

          var kotfile = data;

          /*Calculate Discount*/
          var type = document.getElementById("applyBillDiscountWindow_type").value;
          var unit = document.getElementById("applyBillDiscountWindow_unit").value;
          var value = document.getElementById("applyBillDiscountWindow_value").value;

          var grandSum = 0;

          var n = 0;
          while(kotfile.cart[n]){
            grandSum = grandSum + (kotfile.cart[n].price * kotfile.cart[n].qty);
            n++;
          }

          var totalDiscount = 0;
      
          if(unit == 'PERCENTAGE'){
            totalDiscount = grandSum*value/100;
          }
          else if(unit == 'FIXED'){
            totalDiscount = value;
          }

          totalDiscount = Math.round(totalDiscount * 100) / 100;

          //Cross Check if it matches with the BILLING MODE Restriction of Discounts
          var g = 0;
          var maximumReached = false;
          while(billing_modes[g]){
            if(billing_modes[g].name == kotfile.orderDetails.mode){

              if(!billing_modes[g].isDiscountable){
                showToast('Error: Discount can not be applied on </b>'+billing_modes[g].name+'</b> orders', '#e74c3c');
                return '';
              }
              else{
                if(totalDiscount > billing_modes[g].maxDiscount){
                  totalDiscount = billing_modes[g].maxDiscount;
                  maximumReached = true;
                }
              }
              break;
            }
            g++;
          }


          kotfile.discount.amount = totalDiscount;
          kotfile.discount.type = type;
          kotfile.discount.unit = unit;
          kotfile.discount.value = value;
          kotfile.discount.reference = '';

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

                    if(maximumReached){
                      showToast('Warning: Maximum discount (Rs. '+billing_modes[g].maxDiscount+') for </b>'+billing_modes[g].name+'</b> order reached', '#e67e22');
                    }
                    else{
                      showToast('Discount of <i class="fa fa-inr"></i>'+totalDiscount+' Applied', '#27ae60');
                    }

                    generateBillFromKOT(kotID, optionalPageRef);
                    generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
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



function changeDiscountTypeBillingOptions(){
  roughCalculateDiscount();
}

function roughCalculateDiscount(){

  var tempTotal = parseFloat(document.getElementById("grandSumDisplay").innerHTML).toFixed(2);
  var discValue = parseFloat(document.getElementById("applyBillDiscountWindow_value").value).toFixed(2);

  if(document.getElementById("applyBillDiscountWindow_value").value == ''){
    discValue = 0;
  }

  /*Calculations*/
  var roughDiscFigure = 0;
  if(document.getElementById("applyBillDiscountWindow_unit").value == 'PERCENTAGE'){
    roughDiscFigure = tempTotal*discValue/100;
  }
  else{
    roughDiscFigure = discValue;
  }

  roughDiscFigure = Math.round(roughDiscFigure * 100) / 100;

  document.getElementById("applyBillDiscountWindow_amount").innerHTML = roughDiscFigure;
}

function closeApplyBillDiscountWindow(kotID, optionalPageRef){
  
  /*Change apply button action*/
  document.getElementById("applyBillDiscountButtonWrap").innerHTML = '<button class="btn btn-default tableOptionsButton breakWord" id="applyBillDiscountButton" onclick="openApplyBillDiscountWindow(\''+kotID+'\', \''+optionalPageRef+'\')">Apply Discount</button>';

  document.getElementById("applyBillDiscountWindow").classList.remove('billOptionWindowFrame');
  document.getElementById("applyBillDiscountWindowActions").style.display = 'none'; 

  document.getElementById("applyBillDiscountButton").classList.remove('btn-success');
  document.getElementById("applyBillDiscountButton").classList.add('btn-remove');
}



/*APPLY EXTRA CHARGES*/

function openApplyCustomExtraWindow(kotID, optionalPageRef){

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_BILLING_PARAMETERS" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_BILLING_PARAMETERS'){

              var modes = data.docs[0].value;
              modes.sort(); //alphabetical sorting 
              var modesTag = '';

              for (var i=0; i<modes.length; i++){
                if(i == 0)
                    modesTag = '<option value="'+modes[i].name+'" selected="selected">'+modes[i].name+'</option>';
                  else
                    modesTag = modesTag + '<option value="'+modes[i].name+'">'+modes[i].name+'</option>';
              }

              if(!modesTag)
                document.getElementById("applyCustomExtraWindow_type").innerHTML = '<option value="OTHER" selected="selected">Other</option>';
              else
                document.getElementById("applyCustomExtraWindow_type").innerHTML = modesTag;

              /*Change apply button action*/
              document.getElementById("applyCustomExtraButtonWrap").innerHTML = '<button class="btn btn-success tableOptionsButton breakWord" id="applyCustomExtraButton" onclick="applyCustomExtraOnKOT(\''+kotID+'\', \''+optionalPageRef+'\')">Add Extra Charges</button>';
          }
          else{
            showToast('Not Found Error: Billing Parameters data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Billing Parameters data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Parameters Modes data. Please contact Accelerate Support.', '#e74c3c');
      }

    });

    document.getElementById("applyCustomExtraWindow").classList.add('billOptionWindowFrame');
    document.getElementById("applyCustomExtraWindowActions").style.display = 'block';
    document.getElementById("applyCustomExtraButton").classList.remove('btn-default');
    document.getElementById("applyCustomExtraButton").classList.add('btn-success');


  $('#applyCustomExtraWindow_value').focus();
  $('#applyCustomExtraWindow_value').select();

}


function removeCustomExtraOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          if(kotfile.customExtras.amount){
            kotfile.customExtras = {};
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
                      showToast('Extra Charge removed', '#27ae60');
                      generateBillFromKOT(kotID, optionalPageRef);
                      generateBillSuccessCallback('CHANGE_CUSTOMEXTRA', optionalPageRef, kotfile);
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


function savePrediscountToKOT(kotID, amount, optionalPageRef){

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

              var kotfile = data;

              kotfile.discount.amount = amount;
              kotfile.discount.type = 'ONLINE';
              kotfile.discount.unit = 'FIXED';
              kotfile.discount.value = amount;
              kotfile.discount.reference = 'Pre-applied Online Discount';
                       
                
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
                          showToast('Discount of <i class="fa fa-inr"></i>'+amount+' pre-applied.', '#27ae60');
                          generateBillFromKOT(kotID, optionalPageRef);
                          generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
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



function applyCustomExtraOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          /*Calculate Discount*/
          var type = document.getElementById("applyCustomExtraWindow_type").value;
          var unit = document.getElementById("applyCustomExtraWindow_unit").value;
          var value = document.getElementById("applyCustomExtraWindow_value").value;

          var grandSum = 0;

          var n = 0;
          while(kotfile.cart[n]){
            grandSum = grandSum + (kotfile.cart[n].price * kotfile.cart[n].qty);
            n++;
          }

          var totalExtraCharge = 0;
          if(unit == 'PERCENTAGE'){
            totalExtraCharge = grandSum*value/100;
          }
          else if(unit == 'FIXED'){
            totalExtraCharge = value;
          }

          totalExtraCharge = Math.round(totalExtraCharge * 100) / 100;


          kotfile.customExtras.amount = totalExtraCharge;
          kotfile.customExtras.type = type;
          kotfile.customExtras.unit = unit;
          kotfile.customExtras.value = value;
          kotfile.customExtras.reference = '';
           

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
                      showToast(type+' of <i class="fa fa-inr"></i>'+totalExtraCharge+' added', '#27ae60');
                      generateBillFromKOT(kotID, optionalPageRef);
                      generateBillSuccessCallback('CHANGE_CUSTOMEXTRA', optionalPageRef, kotfile);
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


function closeApplyCustomExtraWindow(kotID, optionalPageRef){
  
  /*Change apply button action*/
  document.getElementById("applyCustomExtraButtonWrap").innerHTML = '<button class="btn btn-default tableOptionsButton breakWord" id="applyCustomExtraButton" onclick="openApplyCustomExtraWindow(\''+kotID+'\', \''+optionalPageRef+'\')">Add Extra Charge</button>';

  document.getElementById("applyCustomExtraWindow").classList.remove('billOptionWindowFrame');
  document.getElementById("applyCustomExtraWindowActions").style.display = 'none';  

  document.getElementById("applyCustomExtraButton").classList.remove('btn-success');
  document.getElementById("applyCustomExtraButton").classList.add('btn-remove');
}


function changeCustomExtraTypeOptions(){
  roughCalculateCustomExtraValue();
}

function roughCalculateCustomExtraValue(){

  var tempTotal = parseFloat(document.getElementById("grandSumDisplay").innerHTML).toFixed(2);
  var extraChargeValue = parseFloat(document.getElementById("applyCustomExtraWindow_value").value).toFixed(2);

  if(document.getElementById("applyCustomExtraWindow_value").value == ''){
    extraChargeValue = 0;
  }

  /*Calculations*/
  var roughFigure = 0;
  if(document.getElementById("applyCustomExtraWindow_unit").value == 'PERCENTAGE'){
    roughFigure = tempTotal*extraChargeValue/100;
  }
  else{
    roughFigure = extraChargeValue;
  }

  roughFigure = Math.round(roughFigure * 100) / 100;

  document.getElementById("applyCustomExtraWindow_amount").innerHTML = roughFigure;
}





/* NO COST BILL */

function openMarkNoCostBill(kotID, optionalPageRef){
  /*Change apply button action*/
  document.getElementById("applyNoCostBillButtonWrap").innerHTML = '<button class="btn btn-success tableOptionsButton breakWord" id="applyNoCostBillButton" onclick="markNoCostBill(\''+kotID+'\', \''+optionalPageRef+'\')">Confirm</button>';

  //minimize all other open windows
  //closeApplyBillCouponWindow(kotID);
  //closeApplyBillDiscountWindow(kotID);

  document.getElementById("applyNoCostBillWindow").classList.add('billOptionWindowFrame');
  document.getElementById("applyNoCostBillWindowActions").style.display = 'block';
  document.getElementById("applyNoCostBillButton").classList.remove('btn-default');
  document.getElementById("applyNoCostBillButton").classList.add('btn-success');


  $('#applyNoCostBillWindow_comments').focus();
  $('#applyNoCostBillWindow_comments').select();

  
}

function closeApplyNoCostBillWindow(kotID, optionalPageRef){
  /*Change apply button action*/
  document.getElementById("applyNoCostBillButtonWrap").innerHTML = '<button class="btn btn-default tableOptionsButton breakWord" id="applyNoCostBillButton" onclick="openMarkNoCostBill(\''+kotID+'\', \''+optionalPageRef+'\')">No Cost Bill</button>';

  document.getElementById("applyNoCostBillWindow").classList.remove('billOptionWindowFrame');
  document.getElementById("applyNoCostBillWindowActions").style.display = 'none'; 

  document.getElementById("applyNoCostBillButton").classList.remove('btn-success');
  document.getElementById("applyNoCostBillButton").classList.add('btn-remove');

}


function markNoCostBill(kotID, optionalPageRef){ //APPLY FULL DISCOUNT

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

          var kotfile = data;

          /*Calculate Discount*/
          var comments = document.getElementById("applyNoCostBillWindow_comments").value;

          if(comments == ''){
            showToast('Warning: Add some comments why you are marking this order as No Cost Bill', '#e67e22');
            return '';
          }

          var grandSum = 0;

          var n = 0;
          while(kotfile.cart[n]){
            grandSum = grandSum + (kotfile.cart[n].price * kotfile.cart[n].qty);
            n++;
          }

          var otherExtras = 0;
          var m = 0;
          while(kotfile.extras[m]){
            otherExtras += kotfile.extras[m].amount;
            m++;
          }

          var o = 0;
          while(kotfile.customExtras[o]){
            otherExtras += kotfile.customExtras[0].amount;
            o++;
          }

            var totalDiscount = grandSum + otherExtras;

            kotfile.discount.amount = totalDiscount;
            kotfile.discount.type = 'NOCOSTBILL';
            kotfile.discount.unit = 'FIXED';
            kotfile.discount.value = totalDiscount;
            kotfile.discount.reference = comments;


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

                      showToast('Marked as No Cost Bill with a discount of <i class="fa fa-inr"></i>'+totalDiscount, '#27ae60');
                      generateBillFromKOT(kotID, optionalPageRef);
                      generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
                  
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

function removeNoCostBillOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          if(kotfile.discount.amount){
            kotfile.discount = {};
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
                      showToast('Removed No Cost Bill', '#27ae60');
                      generateBillFromKOT(kotID, optionalPageRef);
                      generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
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


/* REDEEM POINTS */

function redeemPointsIfAny(kotID, optionalPageRef){

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

          var kotfile = data;

          var userMobile = kotfile.customerMobile;
          var grandSum = 0;

          var n = 0;
          while(kotfile.cart[n]){
            grandSum = grandSum + (kotfile.cart[n].price * kotfile.cart[n].qty);
            n++;
          }



        /*Redeem Points*/
        
        var admin_data = {
          "token": window.localStorage.loggedInAdmin,
          "mobile": userMobile,
          "totalBillAmount": grandSum
        }

        showLoading(10000, 'Redeeming Points');

        $.ajax({
          type: 'POST',
          url: 'https://www.accelerateengine.app/apis/posredeempoints.php',
          data: JSON.stringify(admin_data),
          contentType: "application/json",
          dataType: 'json',
          timeout: 10000,
          success: function(data) {
            hideLoading();
            if(data.status){

              /*Apply Redeemed Discount*/
              if(data.isValid){
                totalDiscount = data.discount;

                totalDiscount = Math.round(totalDiscount * 100) / 100;

                kotfile.discount.amount = totalDiscount;
                kotfile.discount.type = 'REWARDS';
                kotfile.discount.unit = 'FIXED';
                kotfile.discount.value = totalDiscount;
                kotfile.discount.reference = data.referenceID;
                     
                
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
                        showToast(data.pointsRedeemed+ ' points redeemed Succesfully! Discount of <i class="fa fa-inr"></i>'+totalDiscount+' Applied', '#27ae60');
                        generateBillFromKOT(kotID, optionalPageRef);
                        generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
                        
                    },
                    error: function(data) {
                        showToast('System Error: Unable to update the Order. Please contact Accelerate Support.', '#e74c3c');
                    }
                  });       


              }
              else{
                showToast('Oops! '+data.validityError, '#e67e22');
              }
            }
            else
            {
              if(data.errorCode == 404){
                window.localStorage.loggedInAdmin = "";
                showToast(data.error, '#e74c3c');
              }
              else{
                showToast(data.error, '#e74c3c');
              }
            }


          },
          error: function(data){
            hideLoading();
            showToast('Error! Unable to reach the Cloud Server. Check your connection.', '#e74c3c');
          }
        });   
        //End - Redeem




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


function removeRewardsOnKOT(kotID, optionalPageRef){

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

          var kotfile = data;

          if(kotfile.discount.amount){
            kotfile.discount = {};
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

                    showToast('Reward Points Discount removed', '#27ae60');
                    generateBillFromKOT(kotID, optionalPageRef);
                    generateBillSuccessCallback('CHANGE_DISCOUNT', optionalPageRef, kotfile);
                  
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


function hideBillPreviewModal(){
  document.getElementById("billPreviewModal").style.display = 'none';
}




//What to do after any successful execution of Bill Options (Apply/Remove Coupon, Apply/Remove Discount etc.)
function generateBillSuccessCallback(action, optionalPageRef, modifiedKOTFile){


  if(!action || action == '' || !optionalPageRef || optionalPageRef == '' || !modifiedKOTFile){
    return '';
  }

  var alreadyEditingKOT = [];
  if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
    alreadyEditingKOT = JSON.parse(window.localStorage.edit_KOT_originalCopy);     
  }
  else{
    return '';
  }
  

  switch (optionalPageRef){
    case 'ORDER_PUNCHING':{
      /*  Replace the Discount and Custom Extras sections
        in the KOT_originalCopy */

      if(action == 'CHANGE_DISCOUNT'){
        alreadyEditingKOT.discount = modifiedKOTFile.discount;
        window.localStorage.edit_KOT_originalCopy = JSON.stringify(alreadyEditingKOT);  
        renderCustomerInfo();
      }
      else if(action == 'CHANGE_CUSTOMEXTRA'){
        alreadyEditingKOT.customExtras = modifiedKOTFile.customExtras;
        window.localStorage.edit_KOT_originalCopy = JSON.stringify(alreadyEditingKOT);  
        renderCustomerInfo();
      }
      else if(action == 'CHANGE_CUSTOMERINFO'){
        alreadyEditingKOT.customerName = modifiedKOTFile.customerName;
        alreadyEditingKOT.customerMobile = modifiedKOTFile.customerMobile;
        alreadyEditingKOT.guestCount = modifiedKOTFile.guestCount;
        window.localStorage.edit_KOT_originalCopy = JSON.stringify(alreadyEditingKOT); 

              

              //Update changes on Server
              

              //Set _id from Branch mentioned in Licence
              var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
              if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                showToast('Invalid Licence Error: KOT can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
                return '';
              }

              var kot_request_data = accelerate_licencee_branch +"_KOT_"+ alreadyEditingKOT.KOTNumber;

              $.ajax({
                type: 'GET',
                url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
                timeout: 10000,
                success: function(data) {
                  if(data._id == kot_request_data){
                    
                    var kot = data;

                    kot.customerMobile = alreadyEditingKOT.customerMobile;
                    kot.customerName = alreadyEditingKOT.customerName;
                    kot.guestCount = alreadyEditingKOT.guestCount;
                          //Update on Server
                          $.ajax({
                            type: 'PUT',
                            url: COMMON_LOCAL_SERVER_IP+'accelerate_kot/'+(kot._id)+'/',
                            data: JSON.stringify(kot),
                            contentType: "application/json",
                            dataType: 'json',
                            timeout: 10000,
                            success: function(data) {
                              console.log('Saved KOT on Server')
                            }
                          });                             
                  }
                }
              });         
      }

      break;
    }
    case 'LIVE_ORDERS':{
      break;
    }
    case 'ONLINE_ORDERS':{
      break;
    }
    case 'SEATING_STATUS':{
      break;
    }
  }

}



function releaseTableAfterBillSettle(tableName, billNumber, optionalPageRef){

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableName+'"]&endkey=["'+tableName+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableName && tableData.status == 2){

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


                //appendToLog(tableName + ' : Release Table after Settling');               


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        if(optionalPageRef && optionalPageRef == 'ORDER_PUNCHING'){
                          renderTables();
                        }
                        else if(optionalPageRef && optionalPageRef == 'SEATING_STATUS'){
                          preloadTableStatus();
                        }
                      },
                      error: function(data) {
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   

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



/* SAMPLE BILL - Format

{
  "billNumber": "100021",
  "paymentMode": "Cash",
  "totalAmountPaid": 234.5,
  "paymentReference": "paytm",
  "KOTNumber": "KOT1228",
  "orderDetails": {
    "mode": "AC Dine",
    "modeType": "DINE",
    "reference": ""
  },
  "table": "T1",
  "customerName": "Abhijith C S",
  "customerMobile": "9043960876",
  "stewardName": "Abhijith C S",
  "stewardCode": "9043960876",
  "orderStatus": 1,
  "date": "19-03-2018",
  "timePunch": "1408",
  "timeKOT": "",
  "timeBill": "",
  "timeSettle": "",
  "cart": [{
    "name": "Malabar Chicken Biriyani",
    "price": "90",
    "isCustom": false,
    "code": "3158",
    "qty": 1
  }],
  "specialRemarks": "SPECIAL COMMENTS",
  "extras": [{
    "name": "CGST",
    "value": 5,
    "unit": "PERCENTAGE",
    "amount": 4.5
  }, {
    "name": "SGST",
    "value": 5,
    "unit": "PERCENTAGE",
    "amount": 4.5
  }, {
    "name": "Service Charge",
    "value": 50,
    "unit": "FIXED",
    "amount": 50
  }],
  "discount": {
    "amount": 9,
    "type": "Staffs Guest",
    "unit": "PERCENTAGE",
    "value": "10",
    "reference": ""
  },
  "customExtras": {
    "amount": 4.5,
    "type": "Parcel Charges",
    "unit": "PERCENTAGE",
    "value": "5",
    "reference": ""
  }
}

*/


var PREVENT_DUPLICATE_BILL_REQUEST = false;

function confirmBillGeneration(kotID, optionalPageRef, silentRequest){

    if(PREVENT_DUPLICATE_BILL_REQUEST){
      return '';
    }

    PREVENT_DUPLICATE_BILL_REQUEST = true;

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_BILL_INDEX" 
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
          if(data.docs[0].identifierTag == 'ACCELERATE_BILL_INDEX'){

            var billNumber = parseInt(data.docs[0].value) + 1;
            confirmBillGenerationAfterProcess(billNumber, kotID, optionalPageRef, data.docs[0]._rev, silentRequest)
                
          }
          else{
            showToast('Not Found Error: Bill Index data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Bill Index data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Bill Index. Please contact Accelerate Support.', '#e74c3c');
      }

    });
}


function confirmBillGenerationAfterProcess(billNumber, kotID, optionalPageRef, revID, silentRequest){

  console.log('Generating Bill > '+billNumber+' from KOT '+kotID);

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
        if(data._id != ""){

          var kotfile = data;

          var raw_cart = kotfile.cart;
          var beautified_cart = [];

          for(var n = 0; n < raw_cart.length; n++){
            
            if(n == 0){
              beautified_cart.push(raw_cart[0]);
            }
            else{

              var duplicateFound = false;
              var k = 0;
              while(beautified_cart[k]){
                if(beautified_cart[k].code == raw_cart[n].code){
                  if(beautified_cart[k].isCustom && raw_cart[n].isCustom){
                    if(beautified_cart[k].variant == raw_cart[n].variant){
                      beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
                      duplicateFound = true;
                      break;
                    }
                  }
                  else{
                    beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
                    duplicateFound = true;
                    break;
                  }
                }

                k++;
              }

              if(!duplicateFound){
                beautified_cart.push(raw_cart[n]);
              }

            }

          }


          kotfile.cart = beautified_cart;


          var memory_id = kotfile._id;
          var memory_rev = kotfile._rev;

          kotfile.billNumber = billNumber,
          kotfile.paymentMode = "";
          kotfile.totalAmountPaid = "";
          kotfile.paymentReference = "";

          var branch_code = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : '';
          kotfile.outletCode = branch_code != '' ? branch_code : 'UNKNOWN';


          /* BILL SUM CALCULATION */

          //Calculate Sum to be paid
          var grandPayableBill = 0;
          var n = 0;
          while(kotfile.cart[n]){
            grandPayableBill += kotfile.cart[n].price * kotfile.cart[n].qty;
            n++;
          }

          //add extras
          if(!jQuery.isEmptyObject(kotfile.extras)){
            var m = 0;
            while(kotfile.extras[m]){
              grandPayableBill += kotfile.extras[m].amount;
              m++;
            }
          } 

          //add custom extras if any
          if(!jQuery.isEmptyObject(kotfile.customExtras)){
            grandPayableBill += kotfile.customExtras.amount;
          }  


          //substract discounts if any
          if(!jQuery.isEmptyObject(kotfile.discount)){
            grandPayableBill -= kotfile.discount.amount;
          }  

          grandPayableBill = parseFloat(grandPayableBill).toFixed(2);   
          grandPayableBillRounded = properRoundOff(grandPayableBill);   

          kotfile.payableAmount = grandPayableBillRounded;
          kotfile.calculatedRoundOff = Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;

          kotfile.timeBill = getCurrentTime('TIME');
          

          //Remove Unwanted Stuff
          delete kotfile.specialRemarks;
          delete kotfile.allergyInfo;

          var c = 0;
          while(kotfile.cart[c]){
            
            delete kotfile.cart[c].ingredients;
            delete kotfile.cart[c].comments;
            
            c++;
          }


            /*Save NEW BILL*/

            //Remove _rev and _id (KOT File Scraps!)
            var newBillFile = kotfile;
            delete newBillFile._id;
            delete newBillFile._rev


            //Set _id from Branch mentioned in Licence
            var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
            if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
              showToast('Invalid Licence Error: Bill can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
              return '';
            }

            kotfile._id = accelerate_licencee_branch+'_BILL_'+billNumber;


            //Post to local Server
            $.ajax({
              type: 'POST',
              url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/',
              data: JSON.stringify(newBillFile),
              contentType: "application/json",
              dataType: 'json',
              timeout: 10000,
              success: function(data) {
                if(data.ok){

                        //DELETE THE KOT
                        deleteKOTFromServer(memory_id, memory_rev, optionalPageRef);



                        //PRINTING THE BILL
                        if(silentRequest == 'SILENTLY'){
                          showToast('<b>Skipped Printing!</b> Bill #'+billNumber+' generated Successfully', '#27ae60');
                        }
                        else{
                          showToast('Bill #'+billNumber+' generated Successfully', '#27ae60');
                          sendToPrinter(newBillFile, 'BILL');
                        }



                          clearAllMetaDataOfBilling();
                          hideBillPreviewModal();

                          var auto_settle_later_enabled = false;

                          if(kotfile.orderDetails.modeType == 'DINE'){

                            auto_settle_later_enabled = window.localStorage.appOtherPreferences_SettleLater && window.localStorage.appOtherPreferences_SettleLater == 1 ? true : false;
                            
                            /* 
                                "Settle Later" will be pressed by default when an order is billed.
                                Bill will automatically moved to PENDING SETTLEMENT BILLS,
                                and the Table will be set free
                            */ 

                            if(auto_settle_later_enabled){
                              resetTableToFree(kotfile.table);
                            }
                            else{ 
                              billTableMapping(kotfile.table, billNumber, kotfile.payableAmount, 2, optionalPageRef);
                            }
                          }


                          //If an online order ==> Update Mapping
                          if(kotfile.orderDetails.isOnline){
                            //Skip this step, if auto settle for PREPAID orders
                            if(kotfile.orderDetails.onlineOrderDetails.paymentMode != 'PREPAID'){  
                              updateOnlineOrderMapping(kotfile, 'GENERATE', optionalPageRef);
                            }
                          }


                          if(optionalPageRef == 'ORDER_PUNCHING'){
                            renderCustomerInfo();
                            if(kotfile.orderDetails.modeType != 'DINE'){
                              //Pop up bill settlement window
                              settleBillAndPush(encodeURI(JSON.stringify(kotfile)), 'ORDER_PUNCHING');
                            }

                          }
                          else if(optionalPageRef == 'ONLINE_ORDERS'){
                            if(kotfile.orderDetails.isOnline){
                              //Already updated in updateOnlineOrderMapping() call.
                              if(kotfile.orderDetails.onlineOrderDetails.paymentMode == 'PREPAID'){
                                preSettleBill(newBillFile.billNumber, 'ONLINE_ORDERS');
                              }

                            }
                            else{
                              renderLiveOnlineOrders();
                            }
                          }
                          else if(optionalPageRef == 'SEATING_STATUS'){
                            //Already handled inside billTableMapping() call
                          }
                          else if(optionalPageRef == 'LIVE_ORDERS'){
                            //DINE case Already handled inside billTableMapping() call
                          }

                          //Update bill number on server
                          var updateData = {
                            "_rev": revID,
                            "identifierTag": "ACCELERATE_BILL_INDEX",
                            "value": billNumber
                          }

                          $.ajax({
                            type: 'PUT',
                            url: COMMON_LOCAL_SERVER_IP+'accelerate_settings/ACCELERATE_BILL_INDEX/',
                            data: JSON.stringify(updateData),
                            contentType: "application/json",
                            dataType: 'json',
                            timeout: 10000,
                            success: function(data) {
                              
                            },
                            error: function(data) {
                              showToast('System Error: Unable to update Billing Index. Next Bill Number might be faulty. Please contact Accelerate Support.', '#e74c3c');
                            }

                          });  
                }
                else{
                  showToast('Warning: Bill was not Generated. Try again.', '#e67e22');
                }
              },
              error: function(data){   
                if(data.responseJSON.error == "conflict"){
                  showToast('Bill Number Conflict: <b style="color: #c9ff49; text-decoration: underline; cursor: pointer" onclick="renderPage(\'system-settings\', \'System Settings\'); openSystemSettings(\'quickFixes\');">Apply Quick Fix #2</b> and try again. Please contact Accelerate Support if problem persists.', '#e74c3c');
                } 
                else{
                  showToast('System Error: Unable to generate the bill. Please contact Accelerate Support if problem persists.', '#e74c3c');
                }       
              }
            });  
            //End - post KOT to Server

        }
        else{
          showToast('Not Found Error: Order #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read the Order. Please contact Accelerate Support.', '#e74c3c');
      }

    });    
}


function resetTableToFree(tableNumber){

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableNumber+'"]&endkey=["'+tableNumber+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              if(tableData.table == tableNumber && tableData.status == 2){

                tableData.assigned = "";
                tableData.remarks = "";
                tableData.KOT = "";
                tableData.status = 0;
                tableData.lastUpdate = "";  
                tableData.guestName = ""; 
                tableData.guestContact = ""; 
                tableData.reservationMapping = ""; 
                tableData.guestCount = "";

                //appendToLog(tableNumber + ' : Resetting Table to Free (Auto Settle)');              


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+tableData._id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                          //re-render right panel
                          if(window.localStorage.appCustomSettings_OrderPageRightPanelDisplay && window.localStorage.appCustomSettings_OrderPageRightPanelDisplay == 'TABLE'){
                            renderTables();
                          }
                      }
                    });   
              }
        }
      }
    });
}

function deleteKOTFromServer(id, revID, optionalPageRef){
    $.ajax({
      type: 'DELETE',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+id+'?rev='+revID,
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
        if(optionalPageRef == 'LIVE_ORDERS'){
          renderAllKOTs();
        }
      },
      error: function(data) {
        showToast('Server Warning: Unable to modify Order KOT. Please contact Accelerate Support.', '#e67e22');
      }
    }); 
}

function deleteBillFromServer(billNumber, optionalPageRef){

                  billNumber = parseInt(billNumber);

                  //Set _id from Branch mentioned in Licence
                  var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
                  if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                    showToast('Invalid Licence Error: Bill can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
                    return '';
                  }

                  var bill_request_data = accelerate_licencee_branch +"_BILL_"+ billNumber;

                  $.ajax({
                    type: 'GET',
                    url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/'+bill_request_data,
                    timeout: 10000,
                    success: function(data) {
                      if(data._id == bill_request_data){

                        //Proceed to Delete
                        $.ajax({
                          type: 'DELETE',
                          url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/'+data._id+'?rev='+data._rev,
                          contentType: "application/json",
                          dataType: 'json',
                          timeout: 10000,
                          success: function(data) {
                            if(optionalPageRef == 'GENERATED_BILLS')
                            {
                              loadAllPendingSettlementBills('EXTERNAL')
                            }
                          },
                          error: function(data) {
                            showToast('Server Warning: Unable to modify bill data. Please contact Accelerate Support.', '#e67e22');
                          }
                        }); 

                      }
                      else{
                        showToast('Server Warning: Unable to modify bill data. Please contact Accelerate Support.', '#e67e22');
                      }
                    },
                    error: function(data) {
                      showToast('Server Warning: Unable to modify bill data. Please contact Accelerate Support.', '#e67e22');
                    }

                  });

}




function clearAllMetaDataOfBilling(){
  //to remove cart info, customer info
  var customerInfo = window.localStorage.customerData ?  JSON.parse(window.localStorage.customerData) : {};

  customerInfo.name = "";
  customerInfo.mobile = "";
  customerInfo.mappedAddress = "";
  customerInfo.reference = "";
  customerInfo.count = "";
  customerInfo.isOnline = false;

  window.localStorage.customerData = JSON.stringify(customerInfo);
  window.localStorage.accelerate_cart = '';
  window.localStorage.userAutoFound = '';
  window.localStorage.userDetailsAutoFound = '';

  window.localStorage.specialRequests_comments = '';
  window.localStorage.allergicIngredientsData = '';

  window.localStorage.edit_KOT_originalCopy = '';
}



/* SETTLE BILL */
function settleBillAndPush(encodedBill, optionalPageRef){

  var bill = JSON.parse(decodeURI(encodedBill));

  //Check if Prepaid Order ==> If YES, auto-settle
  if(bill.orderDetails.isOnline && bill.orderDetails.onlineOrderDetails.paymentMode == 'PREPAID'){
    settleBillAndPushAuto(bill, optionalPageRef);
    return '';
  }

  //Calculate Sum to be paid
  var grandPayableBill = 0;
  var n = 0;
  while(bill.cart[n]){
    grandPayableBill += bill.cart[n].price * bill.cart[n].qty;
    n++;
  }

  //add extras
  if(!jQuery.isEmptyObject(bill.extras)){
    var m = 0;
    while(bill.extras[m]){
      grandPayableBill += bill.extras[m].amount;
      m++;
    }
  } 

  //add custom extras if any
  if(!jQuery.isEmptyObject(bill.customExtras)){
    grandPayableBill += bill.customExtras.amount;
  }  


  //substract discounts if any
  if(!jQuery.isEmptyObject(bill.discount)){
    grandPayableBill -= bill.discount.amount;
  }  

  grandPayableBill = parseFloat(grandPayableBill).toFixed(2);
  grandPayableBill = properRoundOff(grandPayableBill);  

  window.localStorage.billSettleSplitPlayHoldList = '';

  document.getElementById("billSettlementDetailsModal").style.display = 'block';
  document.getElementById("billSettlementPreviewContentTitle").innerHTML = 'Settle Bill <b>#'+bill.billNumber+'</b>'+ (bill.orderDetails.modeType == 'DINE' ? '<tag style="float: right">Table <b>#'+bill.table+'</b></tag>' : '') + (bill.orderDetails.modeType == 'TOKEN' ? '<tag style="float: right">Token <b>#'+bill.table+'</b></tag>' : '');


  var optionsList = '';


    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_PAYMENT_MODES" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_PAYMENT_MODES'){

              var modes = data.docs[0].value;
              modes.sort(); //alphabetical sorting 

              if(modes.length == 0){
                showToast('No Payment Mode added yet. Please add it under Billing Settings to continue.', '#e74c3c');
                document.getElementById("billSettlementDetailsModal").style.display = 'none';
                return '';
              }

              for (var i = 0; i < modes.length; i++){
                optionsList += '<button class="btn btn-default paymentModeOption easySelectTool_customPayment" onclick="addToSplitPay(this, \''+modes[i].code+'\', \''+modes[i].name+'\')" id="billPayment_'+modes[i].code+'">'+modes[i].name+'</button>';
              }

              document.getElementById("billSettlementDetailsContent").innerHTML = '<h1 style="margin-bottom: 0; text-align: center; font-size: 48px; font-weight: bold; color: #00a584;"><i class="fa fa-inr"></i><tag id="fullAmount">'+grandPayableBill+'</tag></h1>'+
                            '<p style="color: gray; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; text-align: center; ">Total Amount to be paid</p>'+
                            '<hr><div class="row" style="padding: 0 20px; margin: 0"><div style="padding-left: 5%" id="paymentOptionsListRender">'+optionsList+'</div></div>';

              document.getElementById("billSettlementSplitDetailsContent").innerHTML = "";

              document.getElementById("billSettlementPreviewContentActions").innerHTML = '<div class="col-sm-3" style="padding: 0">'+
                                                               '<button id="paymentOptionsListRenderClose" class="btn btn-default" onclick="hideSettleBillAndPush()" style="width: 100%; border: none; border-radius: 0; height: 50px;">Hide</button>'+
                                                            '</div>'+
                                                            '<div class="col-sm-3" style="padding: 0">'+
                                                                '<button class="btn btn-warning" id="paymentOptionsListRenderLater" onclick="keepInPendingBills(\''+bill.table+'\', \''+bill.orderDetails.modeType+'\', \''+optionalPageRef+'\')" style="width: 100%; border: none; border-radius: 0; height: 50px;">Settle Later</button>'+
                                                            '</div>'+
                                                            '<div class="col-sm-6" style="padding: 0">'+
                                                                '<button class="btn btn-success" id="paymentOptionsListRenderConfirm" onclick="settleBillAndPushAfterProcess(\''+encodedBill+'\', \''+optionalPageRef+'\')" style="width: 100%; border: none; border-radius: 0; height: 50px;">Settle Now</button>'+
                                                            '</div>';




                /*
                  EasySelect Tool (THREE COLUMN - MULTI ROW GRID)
                */
                var tiles = $('#paymentOptionsListRender .easySelectTool_customPayment');
                var tileSelected = undefined; //Check for active selection
                var i = 0;
                var currentIndex = 0;
                var lastIndex = 0;

                var hasEnterClicked = false;

                $.each(tiles, function() {
                  if($(tiles[i]).hasClass("selectSplitPayment")){
                    tileSelected = tiles.eq(i);
                    currentIndex = i;
                  }

                  lastIndex = i;
                  i++;
                });  

                var easySelectTool = $(document).on('keydown',  function (e) {

                  if($('#billSettlementDetailsModal').is(':visible')) {

                       switch(e.which){
                        case 37:{ //  < Left Arrow

                            if(hasEnterClicked){ //Select One Option only (TWEAK)
                              break;
                            }

                            if(tileSelected){
                                tileSelected.removeClass('selectSplitPayment');

                                currentIndex--;
                                if(currentIndex < 0){
                                  currentIndex = lastIndex;
                                }

                                if(tiles.eq(currentIndex)){
                                    tileSelected = tiles.eq(currentIndex);
                                    tileSelected = tileSelected.addClass('selectSplitPayment');
                                }
                            }else{
                                tileSelected = tiles.eq(0).addClass('selectSplitPayment');
                            }      

                          break;
                        }
                        case 38:{ //  ^ Up Arrow 

                            if(hasEnterClicked){ //Select One Option only (TWEAK)
                              break;
                            }
                    
                            if(tileSelected){
                                tileSelected.removeClass('selectSplitPayment');
                                
                                

                                if(currentIndex < 3){
                                  if(currentIndex == 0){//First Col. (FIRST ROW)
                                    if(lastIndex%3 == 2){ //Last Col.
                                      currentIndex = lastIndex - 2;
                                    }
                                    else if(lastIndex%3 == 1){ //Middle Col.
                                      currentIndex = lastIndex - 1;
                                    }
                                    else if(lastIndex%3 == 0){  //First Col.
                                      currentIndex = lastIndex;
                                    }
                                  }
                                  else if(currentIndex == 1){ //Middle Col. (FIRST ROW)
                                    if(lastIndex%3 == 2){ //Last Col.
                                      currentIndex = lastIndex - 1;
                                    }
                                    else if(lastIndex%3 == 1){ //Middle Col.
                                      currentIndex = lastIndex;
                                    }
                                    else if(lastIndex%3 == 0){  //First Col.
                                      currentIndex = lastIndex - 2;
                                    }
                                  }
                                  else if(currentIndex == 2){ //Last Col. (FIRST ROW)
                                    if(lastIndex%3 == 2){ //Last Col.
                                      currentIndex = lastIndex;
                                    }
                                    else if(lastIndex%3 == 1){ //Middle Col.
                                      currentIndex = lastIndex - 2;
                                    }
                                    else if(lastIndex%3 == 0){  //First Col.
                                      currentIndex = lastIndex - 1;
                                    }
                                  }
                                }
                                else{
                                  currentIndex = currentIndex - 3;
                                }

                                if(tiles.eq(currentIndex)){
                                    tileSelected = tiles.eq(currentIndex);
                                    tileSelected = tileSelected.addClass('selectSplitPayment');
                                }
                            }else{
                                tileSelected = tiles.eq(0).addClass('selectSplitPayment');
                            }    


                          break;
                        }
                        case 39:{ // Right Arrow >

                            if(hasEnterClicked){ //Select One Option only (TWEAK)
                              break;
                            }

                            if(tileSelected){
                                tileSelected.removeClass('selectSplitPayment');

                                currentIndex++;
                                if(currentIndex > lastIndex){
                                  currentIndex = 0;
                                }

                                if(tiles.eq(currentIndex)){
                                    tileSelected = tiles.eq(currentIndex);
                                    tileSelected = tileSelected.addClass('selectSplitPayment');
                                }
                            }else{
                                tileSelected = tiles.eq(0).addClass('selectSplitPayment');
                            }      

                          break;
                        }
                        case 40:{ // Down Arrow \/ 

                            if(hasEnterClicked){ //Select One Option only (TWEAK)
                              break;
                            }

                            if(tileSelected){
                                tileSelected.removeClass('selectSplitPayment');

                                currentIndex = currentIndex + 3;
                                if(currentIndex > lastIndex){
                                  currentIndex = currentIndex % 3;
                                }

                                if(tiles.eq(currentIndex)){
                                    tileSelected = tiles.eq(currentIndex);
                                    tileSelected = tileSelected.addClass('selectSplitPayment');
                                }
                            }else{
                                tileSelected = tiles.eq(0).addClass('selectSplitPayment');
                            }      

                          break;
                        }
                        case 27:{ // Escape (Close)
                          $('#paymentOptionsListRenderClose').click();
                          easySelectTool.unbind();
                          break;  
                        }
                        case 13:{ // Enter (Confirm)

                          if(!hasEnterClicked){
                            $("#paymentOptionsListRender .easySelectTool_customPayment").each(function(){
                              if($(this).hasClass("selectSplitPayment")){
                                $(this).click();
                                hasEnterClicked = true;
                              }
                            }); 
                          }
                          else{
                            $('#paymentOptionsListRenderConfirm').click();
                            hasEnterClicked = false;
                            e.preventDefault();
                            easySelectTool.unbind();
                          }  

                          break;
                        }
                       }
                  }
                });



          }
          else{
            showToast('Not Found Error: Billing Payment data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Billing Payment data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Payment Modes data. Please contact Accelerate Support.', '#e74c3c');
      }

    });


}



function preSettleBill(billNumber, optionalPageRef){

    if(!optionalPageRef || optionalPageRef == ''){
      optionalPageRef = 'ORDER_PUNCHING';
    }

    billNumber = parseInt(billNumber);

    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: Bill can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }

    var bill_request_data = accelerate_licencee_branch +"_BILL_"+ billNumber;

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/'+bill_request_data,
      timeout: 10000,
      success: function(data) {

        if(data._id == bill_request_data){

          var billfile = data;
          settleBillAndPush(encodeURI(JSON.stringify(billfile)), optionalPageRef);

        }
        else{
          showToast('Not Found Error: Bill #'+billNumber+' not found on Server.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('Not Found Error: Bill #'+billNumber+' not found on Server.', '#e74c3c');
      }

    });   
}


function onlineOrderEasySettleBill(billNumber){

    billNumber = parseInt(billNumber);

    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: Bill can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }

    var bill_request_data = accelerate_licencee_branch +"_BILL_"+ billNumber;

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/'+bill_request_data,
      timeout: 10000,
      success: function(data) {

        if(data._id == bill_request_data){

          var billfile = data;
          settleBillAndPush(encodeURI(JSON.stringify(billfile)), 'ONLINE_ORDERS');

        }
        else{
          showToast('Not Found Error: Bill #'+billNumber+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Bills data. Please contact Accelerate Support.', '#e74c3c');
      }

    });   
}




function addToSplitPay(element, mode, modeName){
  
  if($(element).hasClass('active')){
    $(element).removeClass('active');
  }
  else{
    $(element).addClass('active');
  }

  var splitPayHoldList = window.localStorage.billSettleSplitPlayHoldList ? JSON.parse(window.localStorage.billSettleSplitPlayHoldList): [];

  var fullAmount = document.getElementById("fullAmount").innerHTML;
  if(!fullAmount || fullAmount == ''){
    fullAmount = 0;
  }
  else{
    fullAmount = parseFloat(fullAmount).toFixed(2);
  }

  /*check if already clicked*/
  var alreadyAdded = false;
  var n = 0;
  while(splitPayHoldList[n]){
    if(splitPayHoldList[n].code == mode){
      splitPayHoldList.splice(n,1);
      alreadyAdded = true;

      document.getElementById("billPayment_"+mode).innerHTML = modeName; 
        
      break;
    }
    n++;
  }

  if(!alreadyAdded){

    var j = 0;
    var cumulativeSum = 0;
    while(splitPayHoldList[j]){
      cumulativeSum += parseFloat(splitPayHoldList[j].amount);
      j++;
    }

    if(cumulativeSum > fullAmount){
      cumulativeSum = fullAmount; //To avoid negative suggestions
    }

    var differenceAmount = parseFloat((fullAmount-cumulativeSum)).toFixed(2);

    if(splitPayHoldList.length == 0)
      splitPayHoldList.push({"name": modeName, "code": mode, "amount": parseFloat(fullAmount)});
    else
      splitPayHoldList.push({"name": modeName, "code": mode, "amount": parseFloat(differenceAmount)});

    document.getElementById("billPayment_"+mode).innerHTML += ' <i class="fa fa-check" style="position: absolute; right: 5px; top: 18px;"></i>';
  }


  window.localStorage.billSettleSplitPlayHoldList = JSON.stringify(splitPayHoldList);
  renderSplitPayPart(mode);
}



function renderSplitPayPart(optionalFocusCode){
 var splitPayHoldList = window.localStorage.billSettleSplitPlayHoldList ? JSON.parse(window.localStorage.billSettleSplitPlayHoldList): [];
 
  var fullAmount = document.getElementById("fullAmount").innerHTML;
  if(!fullAmount || fullAmount == ''){
    fullAmount = 0;
  }
  else{
    fullAmount = parseFloat(fullAmount).toFixed(2);
  }

  var splitTotalAmount = 0;

 if(splitPayHoldList.length > 0){

  var splitDetails = '';
  for(var i = 0; i < splitPayHoldList.length; i++){

    splitTotalAmount += parseFloat(splitPayHoldList[i].amount);

    splitDetails += '<div class="row" style="border: 1px solid #ddd; margin: 2px 15px;">'+
                        '<div class="col-sm-4 paymentModeOptionSelected">'+
                            '<p style="font-size: 18px; padding-top: 12px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">'+
                            '<tag class="paymentModeOptionSelectedDeleteButton" onclick="addToSplitPay(this, \''+splitPayHoldList[i].code+'\', \''+splitPayHoldList[i].name+'\')"><i class="fa fa-minus-circle"></i></tag>'+splitPayHoldList[i].name+'</p>'+
                        '</div>'+
                        '<div class="col-sm-4"> <input type="text" value="'+(splitPayHoldList[i].reference && splitPayHoldList[i].reference != ''? splitPayHoldList[i].reference : '')+'" onkeyup="adjustBillSplit(\''+splitPayHoldList[i].code+'\')" onchange="renderSplitPayPart()" placeholder="References" style="border: none; height: 43px; font-size: 16px; text-align: center;" class="form-control tip" id="billSplitComments_'+splitPayHoldList[i].code+'"/> </div>'+
                        '<div class="col-sm-4">'+
                           '<div class="form-group" style="margin-bottom: 2px">'+
                              '<input type="number" value="'+(splitPayHoldList[i].amount != ''? splitPayHoldList[i].amount : 0)+'" onkeyup="adjustBillSplit(\''+splitPayHoldList[i].code+'\')" onchange="renderSplitPayPart()" placeholder="00.00" style="border: none; height: 43px; font-size: 24px; text-align: right;" class="form-control tip" id="billSplitValue_'+splitPayHoldList[i].code+'"/>'+
                           '</div>'+
                        '</div>'+
                    '</div>'
  }


  var warningAmount = '';

  splitTotalAmount = parseFloat(splitTotalAmount).toFixed(2);

  splitTotalAmount = parseFloat(splitTotalAmount);
  fullAmount = parseFloat(fullAmount);

  if(splitTotalAmount < fullAmount){
    warningAmount = '<tag style="color: #f15959; font-weight: initial"> - '+parseFloat(fullAmount-splitTotalAmount).toFixed(2)+'</tag>';
  }
  else if(splitTotalAmount > fullAmount){
    warningAmount = '<tag style="color: #08ca08; font-weight: initial"> + '+parseFloat(splitTotalAmount-fullAmount).toFixed(2)+'</tag>';
  }
  else{
    warningAmount = '';
  }

  document.getElementById("billSettlementSplitDetailsContent").innerHTML = '<p style="color: gray; margin-top: 15px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; text-align: center; ">PAYMENT SPLIT</p>'+
                                      splitDetails + 
                                      '<div class="row" style="border: 1px solid #ddd; margin: 4px 15px; background: #eeeeee">'+
                                              '<div class="col-sm-6"> <p style="font-size: 18px; padding-top: 12px; padding-left: 20px">Grand Sum</p> </div>'+
                                              '<div class="col-sm-6">'+
                                                 '<div class="form-group" style="margin-bottom: 2px"> <p style="background: none; margin: 0; border: none; font-weight: bold; height: 43px; font-size: 24px; text-align: right;" class="form-control tip" />'+parseFloat(fullAmount).toFixed(2)+''+warningAmount+'</p> </div>'+
                                              '</div>'+
                                      '</div> '+
                                      (splitTotalAmount < fullAmount ? '<p style="margin: 0; text-align: right; margin-right: 15px; font-size: 12px; color: #f15959;">Deficit amount of <i class="fa fa-inr"></i>'+parseFloat(fullAmount-splitTotalAmount).toFixed(2)+' will be marked as Round Off</p>' : '')+
                                      (splitTotalAmount > fullAmount ? '<p style="margin: 0; text-align: right; margin-right: 15px; font-size: 12px; color: #08ca08;">Extra amount of <i class="fa fa-inr"></i>'+parseFloat(splitTotalAmount-fullAmount).toFixed(2)+' will be marked as Tips</p>' : '');
                                      

  if(!optionalFocusCode || optionalFocusCode == ''){

  }
  else{
    $("#billSplitValue_"+optionalFocusCode).focus();
    $("#billSplitValue_"+optionalFocusCode).select();
  }

 }
 else{
  document.getElementById("billSettlementSplitDetailsContent").innerHTML = "";
 }
}


function adjustBillSplit(code){

    var amountValue = document.getElementById("billSplitValue_"+code).value;
    if(!amountValue || amountValue == ''){
      amountValue = 0;
    }

    amountValue = parseFloat(amountValue).toFixed(2);
    amountValue = parseFloat(amountValue);

    var referenceValue = document.getElementById("billSplitComments_"+code).value;
    if(!referenceValue || referenceValue == ''){
      referenceValue = '';
    }


    var splitPayHoldList = window.localStorage.billSettleSplitPlayHoldList ? JSON.parse(window.localStorage.billSettleSplitPlayHoldList): [];

    var n = 0;
    while(splitPayHoldList[n]){
      if(splitPayHoldList[n].code == code){
        splitPayHoldList[n].amount = amountValue;
        splitPayHoldList[n].reference = referenceValue;
        break;
      }
      n++;
    }

    window.localStorage.billSettleSplitPlayHoldList = JSON.stringify(splitPayHoldList);
} 



function hideSettleBillAndPush(){
  window.localStorage.billSettleSplitPlayHoldList = '';
  document.getElementById("billSettlementDetailsModal").style.display = 'none';

}


//settle bill and post to local server

function settleBillAndPushAfterProcess(encodedBill, optionalPageRef){

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
  else{
    showToast('No Permission: Only an Admin can settle the Bill.', '#e67e22');
    return '';
  }




    var bill = JSON.parse(decodeURI(encodedBill));

    var splitPayHoldList = window.localStorage.billSettleSplitPlayHoldList ? JSON.parse(window.localStorage.billSettleSplitPlayHoldList): [];

    if(splitPayHoldList.length == 0){
      showToast('Warning: Click on a Payment Method to continue', '#e67e22');
      return '';
    }

    var paymentModeSelected = '';
    if(splitPayHoldList.length > 1){
      paymentModeSelected = 'MULTIPLE';
    }
    else{
      paymentModeSelected = splitPayHoldList[0].code;

      var comments = splitPayHoldList[0].reference;
      if(comments && comments != ''){
        bill.paymentReference = comments;
      }
    }

    var splitObj = [];

    var totalSplitSum = 0;
    var n = 0;
    var actualNoZeroSplits = 0;
    while(splitPayHoldList[n]){

      if(splitPayHoldList[n].amount > 0){ //Skip Zeros
          totalSplitSum += parseFloat(splitPayHoldList[n].amount);
          splitObj.push(splitPayHoldList[n]);
          actualNoZeroSplits++;
      }
      
      n++;
    } 

    totalSplitSum = parseFloat(totalSplitSum).toFixed(2);
    totalSplitSum = parseFloat(totalSplitSum);


    //In case multiple selected but value added only for one, all others kept empty
    if(splitPayHoldList.length > 1 && actualNoZeroSplits == 1){
      paymentModeSelected = splitObj[0].code;

      var comments = splitObj[0].reference;
      if(comments && comments != ''){
        bill.paymentReference = comments;
      }      
    }   

    bill.timeSettle = getCurrentTime('TIME');
    bill.totalAmountPaid = parseFloat(totalSplitSum).toFixed(2);
    bill.paymentMode = paymentModeSelected;
    bill.dateStamp = moment(bill.date, 'DD-MM-YYYY').format('YYYYMMDD');

    var branch_code = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : '';
    bill.outletCode = branch_code != '' ? branch_code : 'UNKNOWN';


    //Split Payment details
    if(paymentModeSelected == 'MULTIPLE'){
      bill.paymentSplits = splitObj;
    }



    //Compare Full Payable Amount
    var fullAmount = document.getElementById("fullAmount").innerHTML;
    if(!fullAmount || fullAmount == ''){
      fullAmount = 0;
    }
    else{
      fullAmount = parseFloat(fullAmount).toFixed(2);
    }


    var maxTolerance = fullAmount*0.05;
    if(maxTolerance < 10){
      maxTolerance = 10;
    }

    if(totalSplitSum < fullAmount && fullAmount-totalSplitSum > maxTolerance){
      showToast('Warning: Huge difference in the sum. Please make sure the split amounts are correct.', '#e67e22');
      return '';
    }

    //Round Off or Tips calculation - auto
    if(totalSplitSum < fullAmount){
      bill.roundOffAmount = parseFloat(fullAmount - totalSplitSum).toFixed(2);
      bill.roundOffAmount = parseFloat(bill.roundOffAmount);
    }

    if(totalSplitSum > fullAmount){
      bill.tipsAmount = parseFloat(totalSplitSum - fullAmount).toFixed(2);
      bill.tipsAmount = parseFloat(bill.tipsAmount);
    }

    bill.totalAmountPaid = parseFloat(bill.totalAmountPaid);


    //Clean _rev and _id (bill Scraps)
    var finalInvoice = bill;
    delete finalInvoice._id;
    delete finalInvoice._rev


          //Set _id from Branch mentioned in Licence
          var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
          if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
            showToast('Invalid Licence Error: Final Invoice can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
            return '';
          }

          finalInvoice._id = accelerate_licencee_branch+'_INVOICE_'+bill.billNumber;


          //Post to local Server
          $.ajax({
            type: 'POST',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_invoices/',
            data: JSON.stringify(finalInvoice),
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {
              if(data.ok){
                showToast("Bill #"+bill.billNumber+" is settled successfully", '#27ae60');
                //Successfully pushed
                hideSettleBillAndPush();

                //If an online order ==> Update Mapping
                if(bill.orderDetails.isOnline){
                  console.log('Update settled...!!!!')
                  updateOnlineOrderMapping(bill, 'SETTLE', optionalPageRef);
                }                

                deleteBillFromServer(bill.billNumber, optionalPageRef);

                //Free the mapped Table
                if(bill.orderDetails.modeType == 'DINE'){
                  releaseTableAfterBillSettle(bill.table, bill.billNumber, optionalPageRef);
                }

                //re-render page
                if(optionalPageRef == 'GENERATED_BILLS'){
                  //Handled in deleteBillFromServer() with >> loadAllPendingSettlementBills('EXTERNAL');
                }

              }
              else{
                showToast('Warning: Bill #'+tableID+' was not Settled. Try again.', '#e67e22');
              }
            },
            error: function(data){           
              showToast('System Error: Unable to save data to the local server. Please contact Accelerate Support if problem persists.', '#e74c3c');
            }
          });    
}


function settleBillAndPushAuto(bill, optionalPageRef){

    bill.paymentReference = "Prepaid Order";
    bill.timeSettle = getCurrentTime('TIME');
    bill.totalAmountPaid = Math.round(bill.payableAmount * 100) / 100;
    bill.paymentMode = "PREPAID";
    bill.dateStamp = moment(bill.date, 'DD-MM-YYYY').format('YYYYMMDD');

console.log('To update AUTO SETTLE')

    //Clean _rev and _id (bill Scraps)
    var finalInvoice = bill;
    delete finalInvoice._id;
    delete finalInvoice._rev

          //Post to local Server
          $.ajax({
            type: 'POST',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_invoices/',
            data: JSON.stringify(finalInvoice),
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {
              if(data.ok){
                showToast("Prepaid Order #"+bill.orderDetails.reference+" - bill settled automatically", '#27ae60');
                //Successfully pushed
                hideSettleBillAndPush();

                //If an online order ==> Update Mapping
                if(bill.orderDetails.isOnline){
                  updateOnlineOrderMapping(bill, 'SETTLE', optionalPageRef);
                  console.log('DOCTOR!')
                }           

                deleteBillFromServer(bill.billNumber, optionalPageRef);

                //Free the mapped Table
                if(bill.orderDetails.modeType == 'DINE'){
                  releaseTableAfterBillSettle(bill.table, bill.billNumber, optionalPageRef);
                }

                //re-render page
                if(optionalPageRef == 'GENERATED_BILLS'){
                  //Handled in deleteBillFromServer() already with >> loadAllPendingSettlementBills('EXTERNAL'); 
                }

              }
              else{
                showToast('Warning: Bill #'+tableID+' was not Settled. Try again.', '#e67e22');
              }
            },
            error: function(data){           
              showToast('System Error: Unable to save data to the local server. Please contact Accelerate Support if problem persists.', '#e74c3c');
            }
          });    
}




//Settle bill later --> FREE THE TABLE for time sake.

function keepInPendingBills(tableNumber, billingModeType, optionalPageRef){

  if(billingModeType == "DINE"){

        $.ajax({
          type: 'GET',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableNumber+'"]&endkey=["'+tableNumber+'"]',
          timeout: 10000,
          success: function(data) {

            if(data.rows.length == 1){

                  var tableData = data.rows[0].value;

                  if(tableData.table == tableNumber && tableData.status == 2){

                    tableData.assigned = "";
                    tableData.remarks = "";
                    tableData.KOT = "";
                    tableData.status = 0;
                    tableData.lastUpdate = "";   
                    tableData.guestName = ""; 
                    tableData.guestContact = ""; 
                    tableData.reservationMapping = "";
                    tableData.guestCount = "";

                    //appendToLog(tableNumber+' : Settle Bill Later');           

                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+(tableData._id)+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                            hideSettleBillAndPush();
                            if(optionalPageRef == 'ORDER_PUNCHING'){
                              triggerRightPanelDisplay();
                            }
                      },
                      error: function(data) {
                        hideSettleBillAndPush();  
                      }
                    });   
                  }
                  else{
                    hideSettleBillAndPush();
                  }
            }
            else{
              hideSettleBillAndPush();
            }

          },
          error: function(data) {
            hideSettleBillAndPush();  
          }

        });    
  }
  else{
    hideSettleBillAndPush();
  }
}


function updateOnlineOrderMapping(orderObject, action, optionalPageRef){


    var online_id_request_data = orderObject.orderDetails.onlineOrderDetails.orderSource+'_'+orderObject.orderDetails.reference;

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_online_orders/'+online_id_request_data,
      timeout: 10000,
      success: function(data) {
        if(data._id != ""){

              var onlineOrdersMapping = data;

              onlineOrdersMapping.systemBill = orderObject.billNumber;

              if(action == 'GENERATE'){
                onlineOrdersMapping.systemStatus = 2;
              }
              else if(action == 'SETTLE'){
                onlineOrdersMapping.systemStatus = 3;
              }


                $.ajax({
                  type: 'PUT',
                  url: COMMON_LOCAL_SERVER_IP+'accelerate_online_orders/'+online_id_request_data+'/',
                  data: JSON.stringify(onlineOrdersMapping),
                  contentType: "application/json",
                  dataType: 'json',
                  timeout: 10000,
                  success: function(data) {
                      if(optionalPageRef && optionalPageRef == 'ONLINE_ORDERS'){
                        renderLiveOnlineOrders();
                      }
                  },
                  error: function(data) {
                      showToast('System Error: Unable to update Online Orders Mapping. Please contact Accelerate Support.', '#e74c3c');
                  }
                });  
        }
        else{
          showToast('Not Found Error: Online Orders Mapping data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Online Orders Mapping data. Please contact Accelerate Support.', '#e74c3c');
      }

    });   
}



// BILL REFUND

function initiateRefundSettledBill(billNumber, totalPaid, paymentStatus, optionalPageRef){

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CANCELLATION_REASONS" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_CANCELLATION_REASONS'){

              var reasonsList = data.docs[0].value;
              initiateRefundSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
                        
          }
          else{
            showToast('Warning: Refund Reasons data not found. Please contact Accelerate Support.', '#e67e22');
            var reasonsList = ["Not Satisfied"];
            initiateRefundSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
          }
        }
        else{
          showToast('Warning: Refund Reasons data not found. Please contact Accelerate Support.', '#e67e22');
          var reasonsList = ["Not Satisfied"];
          initiateRefundSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
        }

      },
      error: function(data) {
        showToast('Warning: Unable to read Refund Reasons data. Please contact Accelerate Support.', '#e67e22');
        var reasonsList = ["Not Satisfied"];
        initiateRefundSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
      }

    });  
}

function initiateRefundSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList){
  
  document.getElementById("billRefundReasonModal").style.display = 'block';
  document.getElementById("billRefundReasonModalActions").innerHTML = '<button class="btn btn-default" onclick="initiateRefundSettledBillHide()" style="float: left">Close</button>'+
                  '<button class="btn btn-warning" id="billRefundReasonConfirmButton" onclick="processRefundSettledBill(\''+billNumber+'\', \''+optionalPageRef+'\')" style="float: right">Issue Refund</button>';

  var n = 0;
  var reasonRender = '';
  while(reasonsList[n]){
    reasonRender += '<option value="'+reasonsList[n]+'">'+reasonsList[n]+'</option>';
    n++;
  }

  document.getElementById("bill_refund_why_reason").innerHTML = reasonRender;

  $('#bill_refund_why_isrefund').val(2);
  $('#bill_refund_why_comments').val('');
  $('#bill_refund_why_comments').focus();

  document.getElementById("bill_refund_why_refundamount").value = totalPaid;



          var easyActionTool = $(document).on('keydown',  function (e) {
            console.log('[Bill Refund] Am secretly running... ')
            if($('#billRefundReasonModal').is(':visible')) {
                 switch(e.which){
                  case 27:{ // Escape (Close)
                    initiateRefundSettledBillHide();
                    easyActionTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)
                    $('#billRefundReasonConfirmButton').click();
                    break;
                  }
                 }
            }
          });

}

function initiateRefundSettledBillHide(){
  document.getElementById("billRefundReasonModal").style.display = 'none';
}

function processRefundSettledBill(billNumber, optionalPageRef){

    billNumber = parseInt(billNumber);

    var current_time = getCurrentTime('TIME');
    var why_reason = $('#bill_refund_why_reason').val();
    var why_comments = $('#bill_refund_why_comments').val();

    var staffData = window.localStorage.loggedInStaffData ? JSON.parse(window.localStorage.loggedInStaffData) : {};
    if(!staffData.name || staffData.name == ''){
      showToast('Warning! Staff information not available. Select Staff Profile and try again.', '#e67e22');
      return '';
    }

    if(why_comments == '' || why_comments.length < 3){
      showToast('Warning! Please add some comments.', '#e67e22');
      return '';      
    }

    var refund_status = 0;
    var refund_amount = '';
    var refund_mode = '';

    refund_status = $('#bill_refund_why_isrefund').val();
    refund_mode = $('#bill_refund_why_refundmode').val();
    refund_amount = $('#bill_refund_why_refundamount').val();

    if(refund_amount == 0 || refund_amount == ''){
      showToast('Warning! Please mention the Refund Amount issued.', '#e67e22');
      return '';     
    }


    refund_amount = Math.round(refund_amount * 100)/100;

    var refundObj = {
            "timeRefund" : current_time,
            "refundedBy" : staffData.name,
            "reason" : why_reason,
            "comments" : why_comments,
            "status" : refund_status,
            "amount" : refund_amount,
            "mode" : refund_mode
    }

    initiateRefundSettledBillHide();
    
    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: Bill can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }

    var requestURL = 'accelerate_bills';
    var requestURLSource = 'BILL';
    var bill_request_data = accelerate_licencee_branch +"_BILL_"+ billNumber;


    if(optionalPageRef == 'GENERATED_BILLS_SETTLED'){
      requestURL = 'accelerate_invoices';
      requestURLSource = 'INVOICE';
      bill_request_data = accelerate_licencee_branch +"_INVOICE_"+ billNumber;
    }


    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/'+requestURL+'/'+bill_request_data,
      timeout: 10000,
      success: function(firstdata) {
        if(firstdata._id == bill_request_data){

          var bill = firstdata;
          bill.refundDetails = refundObj;

          if(refundObj.mode == 'ORIGINAL'){
              bill.refundDetails.mode = bill.paymentMode;
          }

                var encodedBill = encodeURI(JSON.stringify(bill));

                //Update Bill/Invoice on Server
                $.ajax({
                  type: 'PUT',
                  url: COMMON_LOCAL_SERVER_IP+requestURL+'/'+(bill._id)+'/',
                  data: JSON.stringify(bill),
                  contentType: "application/json",
                  dataType: 'json',
                  timeout: 10000,
                  success: function(data) {
                      showToast('Refund of <b><i class="fa fa-inr"></i>'+refundObj.amount+'</b> issued Successfully', '#27ae60');
                      loadAllSettledBills();
                      openSelectedBill(encodedBill, 'SETTLED');
                  },
                  error: function(data) {
                      showToast('System Error: Unable to update the Invoice. Please contact Accelerate Support.', '#e74c3c');
                  }
                }); 
          
        }
        else{
          showToast('Not Found Error: Invoice #'+billNumber+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(firstdata) {
        showToast('System Error: Unable to read Invoices data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  
}







// BILL CANCELLATION

function initiateCancelSettledBill(billNumber, totalPaid, paymentStatus, optionalPageRef){

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CANCELLATION_REASONS" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_CANCELLATION_REASONS'){

              var reasonsList = data.docs[0].value;
              initiateCancelSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
                        
          }
          else{
            showToast('Warning: Cancellation Reasons data not found. Please contact Accelerate Support.', '#e67e22');
            var reasonsList = ["Not Satisfied"];
            initiateCancelSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
          }
        }
        else{
          showToast('Warning: Cancellation Reasons data not found. Please contact Accelerate Support.', '#e67e22');
          var reasonsList = ["Not Satisfied"];
          initiateCancelSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
        }

      },
      error: function(data) {
        showToast('Warning: Unable to read Cancellation Reasons data. Please contact Accelerate Support.', '#e67e22');
        var reasonsList = ["Not Satisfied"];
        initiateCancelSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList);
      }

    });  
}

function initiateCancelSettledBillAfterProcess(billNumber, totalPaid, paymentStatus, optionalPageRef, reasonsList){
  
  document.getElementById("billCancellationsReasonModal").style.display = 'block';
  document.getElementById("billCancellationsReasonModalActions").innerHTML = '<button class="btn btn-default" onclick="initiateCancelSettledBillHide()" style="float: left">Close</button>'+
                  '<button class="btn btn-danger" id="billCancellationsReasonConfirmButton" onclick="processCancelSettledBill(\''+billNumber+'\', \''+optionalPageRef+'\')" style="float: right">Proceed to Cancel</button>';

  var n = 0;
  var reasonRender = '';
  while(reasonsList[n]){
    reasonRender += '<option value="'+reasonsList[n]+'">'+reasonsList[n]+'</option>';
    n++;
  }

  document.getElementById("bill_cancel_why_reason").innerHTML = reasonRender;

  if(paymentStatus == 'PAID'){ //Order is PAID
    document.getElementById("refundCancelOrderBar").style.display = 'block';
    document.getElementById("refundCancelOrderBar").innerHTML = '<label>Refund Status</label> <select id="bill_cancel_why_isrefund" class="form-control" onchange="changeBillCancelWhyIsRefunding('+totalPaid+')"> <option value="1" selected>No Refund</option> <option value="2">Partial Refund</option> <option value="3">Full Refund</option> </select>';
    $('#bill_cancel_why_isrefund').val(1);
  }
  else{
    document.getElementById("refundCancelOrderBar").style.display = 'none';
  }

  document.getElementById("refundCancelOrderAmountBar").style.display = 'none';
  document.getElementById("refundCancelOrderModeBar").style.display = 'none';

  $('#bill_cancel_why_comments').val('');
  $('#bill_cancel_why_comments').focus();



          var easyActionTool = $(document).on('keydown',  function (e) {
            console.log('[Bill Cancellation] Am secretly running... ')
            if($('#billCancellationsReasonModal').is(':visible')) {
                 switch(e.which){
                  case 27:{ // Escape (Close)
                    initiateCancelSettledBillHide();
                    easyActionTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)
                    $('#billCancellationsReasonConfirmButton').click();
                    break;
                  }
                 }
            }
          });


}


function changeBillCancelWhyIsRefunding(totalPaid){
  if($('#bill_cancel_why_isrefund').val() > 1){
    document.getElementById("refundCancelOrderAmountBar").style.display = 'block';
    document.getElementById("refundCancelOrderModeBar").style.display = 'block';

    document.getElementById("bill_cancel_why_refundamount").value = totalPaid;
    $('#bill_cancel_why_refundamount').focus();
    $('#bill_cancel_why_refundamount').select();
  } 
  else{
    document.getElementById("refundCancelOrderAmountBar").style.display = 'none';
    document.getElementById("refundCancelOrderModeBar").style.display = 'none';
  }
}


function initiateCancelSettledBillHide(){
  document.getElementById("billCancellationsReasonModal").style.display = 'none';
}

function processCancelSettledBill(billNumber, optionalPageRef){

    billNumber = parseInt(billNumber);

    var current_time = getCurrentTime('TIME');
    var why_reason = $('#bill_cancel_why_reason').val();
    var why_comments = $('#bill_cancel_why_comments').val();

    var staffData = window.localStorage.loggedInStaffData ? JSON.parse(window.localStorage.loggedInStaffData) : {};
    if(!staffData.name || staffData.name == ''){
      showToast('Warning! Staff information not available. Select Staff Profile and try again.', '#e67e22');
      return '';
    }

    if(why_comments == '' || why_comments.length < 3){
      showToast('Warning! Please add some comments.', '#e67e22');
      return '';      
    }

    var refund_status = 0;
    var refund_amount = '';
    var refund_mode = '';

    if(document.getElementById("refundCancelOrderBar").style.display == 'block'){
      //Discount Part
      refund_status = $('#bill_cancel_why_isrefund').val();
      
      if(refund_status > 1){
        refund_mode = $('#bill_cancel_why_refundmode').val();
        refund_amount = $('#bill_cancel_why_refundamount').val();

        if(refund_amount == 0 || refund_amount == ''){
          showToast('Warning! Please mention the Refund Amount issued.', '#e67e22');
          return '';     
        }
      }
    }


    var refund_status_flag = 5;
    if(optionalPageRef == 'GENERATED_BILLS_SETTLED'){
      refund_status_flag = 6;
    }

    refund_amount = Math.round(refund_amount * 100)/100;

    var cancelObj = {
            "timeCancel" : current_time,
            "cancelledBy" : staffData.name,
            "reason" : why_reason,
            "comments" : why_comments,
            "status" : refund_status_flag, //SETTLED BILL or PENDING BILL
            "refundStatus" : refund_status,
            "refundAmount" : refund_amount,
            "refundMode" : refund_mode
    }

    initiateCancelSettledBillHide();


    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: Bill can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }



    var requestURL = 'accelerate_bills';
    var requestURLSource = 'BILL';
    var bill_request_data = accelerate_licencee_branch +"_BILL_"+ billNumber;    

    

    if(optionalPageRef == 'GENERATED_BILLS_SETTLED'){
      requestURL = 'accelerate_invoices';
      requestURLSource = 'INVOICE';
      bill_request_data = accelerate_licencee_branch +"_INVOICE_"+ billNumber;   
    }

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/'+requestURL+'/'+bill_request_data,
      timeout: 10000,
      success: function(firstdata) {
        if(firstdata._id == bill_request_data){

          var bill = firstdata;

          var memory_rev = firstdata._rev;
          var memory_id = firstdata._id;
          var memory_type = firstdata.orderDetails.modeType;
          var memory_table = firstdata.table;
          
          var cancelBillFile = bill;
          delete cancelBillFile._id;
          delete cancelBillFile._rev;

          cancelBillFile.cancelDetails = cancelObj;

          //Refund Object
          if(cancelObj.refundAmount && cancelObj.refundAmount != '' && cancelObj.refundAmount > 0){
            
            var refund_obj_mode = 'CASH';
            if(cancelObj.refundMode == 'ORIGINAL'){
              refund_obj_mode = bill.paymentMode;
            }

            cancelBillFile.refundDetails = {
              "timeRefund" : current_time,
              "refundedBy" : staffData.name,
              "reason" : why_reason,
              "comments" : why_comments,
              "status" : refund_status,
              "amount" : cancelObj.refundAmount,
              "mode" : refund_obj_mode
            }

          }

            deleteCancelledInvoiceFromServer(memory_id, memory_rev, memory_type, memory_table, requestURLSource, optionalPageRef);

            //Post to local Server
            $.ajax({
              type: 'POST',
              url: COMMON_LOCAL_SERVER_IP+'/accelerate_cancelled_invoices/',
              data: JSON.stringify(cancelBillFile),
              contentType: "application/json",
              dataType: 'json',
              timeout: 10000,
              success: function(data) {
                if(data.ok){
                  showToast('Invoice #'+billNumber+' has been Cancelled successfully', '#27ae60');
                }
                else{
                  showToast('Warning: Cancelled Invoice was not Generated. Try again.', '#e67e22');
                }
              },
              error: function(data){           
                showToast('System Error: Unable to save Cancelled Invoice to the local server. Please contact Accelerate Support if problem persists.', '#e74c3c');
              }
            });  
            //End - post KOT to Server          
          
        }
        else{
          showToast('Not Found Error: Invoice #'+billNumber+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(firstdata) {
        showToast('System Error: Unable to read Invoices data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  
}

function deleteCancelledInvoiceFromServer(id, revID, type, table, requestURLSource, optionalPageRef){

  var requestLink = 'accelerate_bills';
  if(requestURLSource == 'BILL'){
    requestLink = 'accelerate_bills';
  }
  else if(requestURLSource == 'INVOICE'){
    requestLink = 'accelerate_invoices';
  }


    $.ajax({
      type: 'DELETE',
      url: COMMON_LOCAL_SERVER_IP+'/'+requestLink+'/'+id+'?rev='+revID,
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
        if(optionalPageRef == 'GENERATED_BILLS_SETTLED'){
          loadAllSettledBills();
        }
        else if(optionalPageRef == 'GENERATED_BILLS_PENDING'){
          loadAllPendingSettlementBills();

          if(type == 'DINE'){
            updateTableMappingAfterCancellation(table, 'GENERATED_BILLS_PENDING');
          }

        }
      },
      error: function(data) {
        showToast('Server Warning: Unable to update Invoices. Please contact Accelerate Support.', '#e67e22');
      }
    });   
}




/*
  CANCEL RUNNING ORDER
*/

function cancelRunningOrder(kotID, optionalPageRef){

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CANCELLATION_REASONS" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_CANCELLATION_REASONS'){

              var reasonsList = data.docs[0].value;
              cancelRunningOrderAfterProcess(kotID, optionalPageRef, reasonsList)
                        
          }
          else{
            showToast('Warning: Cancellation Reasons data not found. Please contact Accelerate Support.', '#e67e22');
            var reasonsList = ["Not Satisfied"];
            cancelRunningOrderAfterProcess(kotID, optionalPageRef, reasonsList)
          }
        }
        else{
          showToast('Warning: Cancellation Reasons data not found. Please contact Accelerate Support.', '#e67e22');
          var reasonsList = ["Not Satisfied"];
          cancelRunningOrderAfterProcess(kotID, optionalPageRef, reasonsList)
        }

      },
      error: function(data) {
        showToast('Warning: Unable to read Cancellation Reasons data. Please contact Accelerate Support.', '#e67e22');
        var reasonsList = ["Not Satisfied"];
        cancelRunningOrderAfterProcess(kotID, optionalPageRef, reasonsList)
      }

    });  
}




function cancelRunningOrderAfterProcess(kotID, optionalPageRef, reasonsList){

  document.getElementById("orderCancellationsReasonModal").style.display = 'block';
  document.getElementById("orderCancellationsReasonModalActions").innerHTML = '<button class="btn btn-default" onclick="initiateCancelOrderHide()" style="float: left">Close</button>'+
                  '<button class="btn btn-danger" id="orderCancellationsReasonConfirmButton" onclick="processCancelRunningOrder(\''+kotID+'\', \''+optionalPageRef+'\')" style="float: right">Proceed to Cancel</button>';


  var n = 0;
  var reasonRender = '';
  while(reasonsList[n]){
    reasonRender += '<option value="'+reasonsList[n]+'">'+reasonsList[n]+'</option>';
    n++;
  }

  document.getElementById("order_cancel_why_reason").innerHTML = reasonRender;

  $('#order_cancel_why_comments').val('');
  $('#order_cancel_why_comments').focus();  


          var easyActionTool = $(document).on('keydown',  function (e) {
            console.log('[Bill Refund] Am secretly running... ')
            if($('#orderCancellationsReasonModal').is(':visible')) {
                 switch(e.which){
                  case 27:{ // Escape (Close)
                    initiateCancelOrderHide();
                    easyActionTool.unbind();
                    break;  
                  }
                  case 13:{ // Enter (Confirm)
                    $('#orderCancellationsReasonConfirmButton').click();
                    break;
                  }
                 }
            }
          });

}


function initiateCancelOrderHide(){
  document.getElementById("orderCancellationsReasonModal").style.display = 'none';
}


function processCancelRunningOrder(kotID, optionalPageRef){


    var current_time = getCurrentTime('TIME');
    var why_reason = $('#order_cancel_why_reason').val();
    var why_comments = $('#order_cancel_why_comments').val();
    
    var why_food_status = $('#order_cancel_food_status').val();
    why_food_status = parseInt(why_food_status);


    var staffData = window.localStorage.loggedInStaffData ? JSON.parse(window.localStorage.loggedInStaffData) : {};
    if(!staffData.name || staffData.name == ''){
      showToast('Warning! Staff information not available. Select Staff Profile and try again.', '#e67e22');
      return '';
    }

    if(why_comments == '' || why_comments.length < 3){
      showToast('Warning! Please add some comments.', '#e67e22');
      return '';      
    }


    var cancelObj = {
            "timeCancel" : current_time,
            "cancelledBy" : staffData.name,
            "reason" : why_reason,
            "comments" : why_comments,
            "status" : why_food_status, //FOOD WASTED or NOT
            "refundStatus" : 0,
            "refundAmount" : '',
            "refundMode" : ''
    }

    initiateCancelOrderHide();


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
      success: function(firstdata) {
        if(firstdata._id == kot_request_data){

            var kot = firstdata;

            var memory_rev = firstdata._rev;
            var memory_id = firstdata._id;
            var memory_type = firstdata.orderDetails.modeType;
            var memory_table = firstdata.table;
            
            var cancelOrderFile = kot;
            delete cancelOrderFile._id;
            delete cancelOrderFile._rev;

            cancelOrderFile.cancelDetails = cancelObj;
          
            //Send Notice to Kitchen
            sendCancelledKOTNotice(kot, optionalPageRef);

            deleteCancelledKOTFromServer(memory_id, memory_rev, memory_type, memory_table, kotID, optionalPageRef);

              //Post to local Server
              $.ajax({
                type: 'POST',
                url: COMMON_LOCAL_SERVER_IP+'/accelerate_cancelled_orders/',
                data: JSON.stringify(cancelOrderFile),
                contentType: "application/json",
                dataType: 'json',
                timeout: 10000,
                success: function(data) {
                  if(data.ok){
                    showToast('Order #'+kotID+' has been Cancelled successfully', '#27ae60');
                  }
                  else{
                    showToast('Warning: KOT was not Generated. Try again.', '#e67e22');
                  }
                },
                error: function(data){           
                  showToast('System Error: Unable to save Cancelled Order to the local server. Please contact Accelerate Support if problem persists.', '#e74c3c');
                }
              });  
              //End - post KOT to Server   


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


/* To print Cancellation Note to Kitchen */
function sendCancelledKOTNotice(kot, optionalPageRef){
  
  /*
    **********************************************
    OLD - Direct Printing from Client (deprecated)
    **********************************************
          
                      var obj = kot;
                      var original_order_object_cart = kot.cart;
                      
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

                                  var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                                  
                                  if(defaultKOTPrinter == ''){
                                    if(isKOTRelayingEnabledOnDefault){
                                      sendToPrinter(relay_skipped_obj, 'CANCELLED_KOT', default_set_KOT_printer_data);
                                      
                                      printRelayedKOT(relayRuleList);
                                    }
                                    else{
                                      var preserved_order = obj;
                                      preserved_order.cart = original_order_object_cart;
                                      sendToPrinter(preserved_order, 'CANCELLED_KOT', default_set_KOT_printer_data);
                                    
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
                                                    sendToPrinter(relay_skipped_obj, 'CANCELLED_KOT', selected_printer);
                                                    
                                                    printRelayedKOT(relayRuleList);
                                                  }
                                                  else{
                                                    var preserved_order = obj;
                                                    preserved_order.cart = original_order_object_cart;
                                                    sendToPrinter(preserved_order, 'CANCELLED_KOT', selected_printer);
                                                    
                                                    printRelayedKOT(relayRuleList);
                                                  }

                                                  break;
                                                }
                                            }
                                          }
                                          

                                          if(g == allConfiguredPrintersList.length - 1){
                                            if(selected_printer == ''){ //No printer found, print on default!
                                              if(isKOTRelayingEnabledOnDefault){
                                                sendToPrinter(relay_skipped_obj, 'CANCELLED_KOT', default_set_KOT_printer_data);
                                                
                                                printRelayedKOT(relayRuleList);
                                              }
                                              else{
                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;
                                                sendToPrinter(preserved_order, 'CANCELLED_KOT', default_set_KOT_printer_data);
                                                
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

                                  sendToPrinter(preserved_order, 'CANCELLED_KOT', default_set_KOT_printer_data);

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

                                    sendToPrinter(relayedNewObj, 'CANCELLED_KOT', allPrintersList[index].template);

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
                                              
                                              sendToPrinter(relayedNewObj, 'CANCELLED_KOT', allPrintersList[index].template);
                                              
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
                          sendToPrinter(obj, 'CANCELLED_KOT');
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
                                      sendToPrinter(obj, 'CANCELLED_KOT', selected_printer);
                                      break;
                                    }
                                }
                                }
                                

                                if(g == allConfiguredPrintersList.length - 1){
                                  if(selected_printer == ''){ //No printer found, print on default!
                                    sendToPrinter(obj, 'CANCELLED_KOT');
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

                    var printRequestObject = kot;

                    printRequestObject.printRequest = {
                      "KOT": printRequestObject._id,
                      "action": "KOT_CANCEL",
                      "table": kot.table,
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



function deleteCancelledKOTFromServer(id, revID, type, table, kotID, optionalPageRef){
    $.ajax({
      type: 'DELETE',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+id+'?rev='+revID,
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {

        if(optionalPageRef == 'ORDER_PUNCHING'){
        
          clearAllMetaData();
          renderCustomerInfo();

          if(type == 'DINE'){
            updateTableMappingAfterKOTCancellation(table, 'ORDER_PUNCHING');
          }
          
        }
        else if(optionalPageRef == 'LIVE_ORDERS'){
          if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
            var originalData = window.localStorage.edit_KOT_originalCopy ?  JSON.parse(window.localStorage.edit_KOT_originalCopy) : []; 
            if(originalData.KOTNumber == kotID){ //Editing Order being cancelled
              clearAllMetaData();
            }
          }
        
          renderAllKOTs();
        
          if(type == 'DINE'){
            updateTableMappingAfterKOTCancellation(table, 'LIVE_ORDERS');
          }
          
        }
        else if(optionalPageRef == 'SEATING_STATUS'){
          if(window.localStorage.edit_KOT_originalCopy && window.localStorage.edit_KOT_originalCopy != ''){
            var originalData = window.localStorage.edit_KOT_originalCopy ?  JSON.parse(window.localStorage.edit_KOT_originalCopy) : []; 
            if(originalData.KOTNumber == kotID){ //Editing Order being cancelled
              clearAllMetaData();
            }
          }
        
          if(type == 'DINE'){
            updateTableMappingAfterKOTCancellation(table, 'SEATING_STATUS');
          }
          else{
            preloadTableStatus();
          }
        }
      },
      error: function(data) {
        showToast('Server Warning: Unable to update Orders. Please contact Accelerate Support.', '#e67e22');
      }
    });   
}

function updateTableMappingAfterKOTCancellation(tableID, optionalPageRef){

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableID+'"]&endkey=["'+tableID+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableID){

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

                //appendToLog(tableID+' : Freeing Table after Order Cancellation');

                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        if(optionalPageRef == 'ORDER_PUNCHING'){
                          renderTables();
                        }
                        else if(optionalPageRef == 'SEATING_STATUS'){
                          preloadTableStatus();
                        }
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

function updateTableMappingAfterCancellation(tableID, optionalPageRef){

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableID+'"]&endkey=["'+tableID+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableID && tableData.status == 2){

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

                //appendToLog(tableID+' : Freeing Table after Bill Cancellation');

                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        if(optionalPageRef == 'ORDER_PUNCHING'){
                          renderTables();
                        }
                        else if(optionalPageRef == 'SEATING_STATUS'){
                          preloadTableStatus();
                        }
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


//Unsettle Bill (Reverse)
function openUndoSettleWarning(billNumber){

    showLoading(10000, 'Loading...');

    //Set _id from Branch mentioned in Licence
    var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
    if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
      showToast('Invalid Licence Error: Bill can not be fetched. Please contact Accelerate Support if problem persists.', '#e74c3c');
      return '';
    }

    var bill_request_data = accelerate_licencee_branch +"_INVOICE_"+ billNumber;    
    var new_bill_id = accelerate_licencee_branch +"_BILL_"+ billNumber;

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_invoices/'+bill_request_data,
      timeout: 10000,
      success: function(firstdata) {
        hideLoading();

        if(firstdata._id == bill_request_data){

          var reversed_bill = firstdata;

          //Do not allow if its a refunded order
          if(reversed_bill.refundDetails){
            if(reversed_bill.refundDetails.amount != 0){
              showToast('Warning: Refund Issued orders can not be moved back to Unsettled.', '#e67e22');
              return '';
            }
          }

          var remember_id = reversed_bill._id;
          var remember_revID = reversed_bill._rev;

          delete reversed_bill._id;
          delete reversed_bill._rev;
          delete reversed_bill.dateStamp;
          delete reversed_bill.paymentMode;
          delete reversed_bill.totalAmountPaid;
          delete reversed_bill.timeSettle;
          delete reversed_bill.paymentReference;
          delete reversed_bill.paymentSplits;


          reversed_bill._id = new_bill_id;


            //Post to local Server
            $.ajax({
              type: 'POST',
              url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/',
              data: JSON.stringify(reversed_bill),
              contentType: "application/json",
              dataType: 'json',
              timeout: 10000,
              success: function(data) {
                if(data.ok){
                  showToast('Moved to Un-settled Bills', '#27ae60');
                  deletePreviousSettledInvoice();
                }
                else{
                  showToast('Warning: Failed to Unsettle Invoice. Try again.', '#e67e22');
                }
              },
              error: function(data){           
                showToast('System Error: Unable to save data to the local server. Please contact Accelerate Support if problem persists.', '#e74c3c');
              }
            });  
            //End 


              //delete original already settled invoice
              function deletePreviousSettledInvoice(){
                  $.ajax({
                    type: 'DELETE',
                    url: COMMON_LOCAL_SERVER_IP+'/accelerate_invoices/'+remember_id+'?rev='+remember_revID,
                    contentType: "application/json",
                    dataType: 'json',
                    timeout: 10000,
                    success: function(data) {
                      renderPage('settled-bills', 'Generated Bills');
                    },
                    error: function(data) {
                      showToast('Server Warning: Unable to modify settled Invoice. Please contact Accelerate Support.', '#e67e22');
                    }
                  }); 
              }
        }
        else{
          showToast('Not Found Error: Invoice #'+billNumber+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(firstdata) {
        hideLoading();
        showToast('System Error: Unable to read Invoices data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  
}