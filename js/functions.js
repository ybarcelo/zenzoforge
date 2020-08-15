function showProfile(){
   $("#profile").css('display', 'flex');
   $("#maintabs").css('display', 'none');
}

function showWallet()
{
  $("#profile").css('display', 'none');
   $("#maintabs").css('display', 'flex');
}

function openInventory() {
  $("#maintabs").css('display', 'block');

}
function openProfile() {
          loadProfile().then(hasProfile => {
                  console.info("Resultado de has profile "+hasProfile)
                  if (hasProfile) {
                    console.log("tiene perfil");
                    /*
                    document.getElementById("wallet").style.display = "block";
                    document.getElementById("inventory").style.display = "none";
                    document.getElementById("new_profile").style.display = "none";
                    document.getElementById("profile").style.display = "none";
                    */
                     $("#maintabs").css('display', 'block');
                     $("#navbar_wallet").css('display', 'flex');
                     fetchBalances();
                    
                  } else {
                     
                    //document.getElementById("new_profile").style.display = "block";
                     $("#profile").css('display', 'flex');
                     
         
                  }
                })
       }
       async function loadProfile () {
          let userTmp = getProfile(addy, true);
          if (userTmp !== null) {
            user_profile = userTmp;
            /*Autoload Username label*/
             $("#welcome_username").text(user_profile.name.replace("zenzo.", ""));
              $("#user_label").text(user_profile.name.replace("zenzo.", ""));
            /*Autoload image profile*/
             $("#welcome_avatar").attr("src", user_profile.image );

              $("#btn_inventory").css('display', 'block');
            return true;
          } else {
            return false;
          }
        }

        function truncateWithEllipses(text, max) {
            return text.substr(0,max-1)+(text.length>max?'&hellip;':''); 
        }

        function setWarning(element, text, showImage = false) {
         // alert(element);
         console.log(element);
         

          document.getElementById(element).innerHTML = ((showImage) ? '<img src="./gui/warning.svg" style="width: 33px;height: 33px;position: relative; top: 10px;">' : '') + '<p style="text-align: center;' + ((!_.isNil(text)) ? '' : 'display: none;') + '"><b style="color: red;">' + text + '</b></p>';
        }

        function setRedBorder(element) {
          if (!document.getElementById(element).classList.contains("redBorder")) {
            document.getElementById(element).classList.add("redBorder");
          }
        }

        function setClearBorder(element) {
          if (document.getElementById(element).classList.contains("redBorder")) {
            document.getElementById(element).classList.remove("redBorder");
          }
        }

        function setText(element, text) {
          document.getElementById(element).innerHTML = '<p style="text-align: center;' + ((!_.isNil(text)) ? '' : 'display: none;') + '">' + text + '</p>';
        }


/*WALLET*/

      function fetchBalances() {
          $("#receive_address").val(addy);
          zenzo.call("getwalletinfo").then(RPCbalances => {
            $("#total_znz").text("Total:"+Number(RPCbalances.balance.toFixed(2)).toLocaleString());
            let lockedBalance = 0;
            for (let i=0; i<items.length; i++) {
                if (items[i].address === addy) lockedBalance += items[i].value;
            }
            for (let i=0; i<itemsToValidate.length; i++) {
                if (itemsToValidate[i].address === addy) lockedBalance += itemsToValidate[i].value;
            }
            lockedBalance = formatNum(lockedBalance);
            availableBalance = formatNum(RPCbalances.balance - lockedBalance);
            $("#available_znz").text("Available:"+Number(availableBalance.toFixed(2)).toLocaleString());
            $("#locked_znz").text("Locked:"+Number(lockedBalance.toFixed(2)).toLocaleString());

            // Also update unlocked status
            zenzo.call("getstakingstatus").then(RPCLocked => {
              isWalletLocked = !RPCLocked.walletunlocked;
            });
          });
        }

        function sendGuiTX() {

          //alert(canSendTransaction);
          if (!canSendTransaction) return;
          const amt = Number($("#send_amount").val());
          const to = $("#send_to").val();

          let toAddress;
          let toUsername = "";

          let isUsername = false;
          if (to.length !== 34) {
            let toUser = getProfile(to, true);
            if (toUser !== null) {
              toAddress = toUser.address;
              toUsername = toUser.name.replace("zenzo.", "");
              isUsername = true;
            } else {
              // No address, no username; error out
              swal({
                  title: "Zenzo Forge",
                  text: "Address and username are required",
                  icon: "warning",
                });

            }
          } else {
            toAddress = to;
          }

          let confirm = new ConfirmClass();
          confirm.show({
            title: 'Confirm Transaction',
            content: 'Are you sure you want to send ' + amt.toLocaleString() + ' ZNZ to ' + (toUsername === '' ? '"' + toAddress + '"' : '"' + toUsername + '"') + '?',
            btns: [{
              text: "Confirm",
              callback: function(){
                console.log('Clicked Confirm Button');
                zenzo.call("sendtoaddress", toAddress, amt).then(guiTx => {
                  console.info("GUI: Transaction sent! " + guiTx);
                  fetchBalances();
                }).catch(console.error);
              }
            }, {
              text: 'Cancel',
              callback: function(){
                console.log('Clicked Cancel Button');
              }
            }]
          })
        }

        function checkForProfile () {
          // Only check for a profile if we know we're unlocked
          if (isWalletLocked) {
            canSendTransaction = false;
            setWarning("sending_to", "Wallet must be unlocked to transact!");

            //document.getElementById("sending_to_parent").style.display = "block";
            $("#sending_to_parent").css('display', 'block');
            //document.getElementById("sending_avatar").innerHTML = '<div class="avatar_border" style="background-image: url(\'./gui/forge_unknown.png\'); height: 50px; width: 50px; display: inline-block; border-width: 1px; margin: 0px; margin-top: 20px;"></div>';
            $("sending_avatar").text('<div class="avatar_border" style="background-image: url(\'./gui/forge_unknown.png\'); height: 50px; width: 50px; display: inline-block; border-width: 1px; margin: 0px; margin-top: 20px;"></div>')
            //$("#sending_avatar").attr("src", user_profile.image );
             swal({
                  title: "Zenzo Forge",
                  text: "Wallet must be unlocked to transact!",
                  icon: "warning",
                });
            return;
          }

          console.info("Checking for profile...");
          //const to = document.getElementById("send_to").value;
          const to = $("#send_to").val();

          let toAddress;
          let toUsername;

          let isUsername = false;
          if (to.length !== 34) {
            let toUser = getProfile(to, true);
            if (toUser !== null) {
              toAddress = toUser.address;
              toUsername = toUser.name.replace("zenzo.", "");
              isUsername = true;
              // document.getElementById("sending_to").innerHTML = toAddress;
              $("#sending_to").text(toAddress);
              //document.getElementById("sending_avatar").innerHTML = '<div class="avatar_border" style="background-image: url(' + (toUser.image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + toUser.image + '\'') + '); height: 50px; width: 50px; display: inline-block; border-width: 1px; margin: 0px; margin-top: 20px;"></div>';
              //$("#sending_avatar").text('<div class="avatar_border" style="background-image: url(' + (toUser.image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + toUser.image + '\'') + '); height: 50px; width: 50px; display: inline-block; border-width: 1px; margin: 0px; margin-top: 20px;"></div>');
              $("#sending_avatar").attr("src", toUser.image  );
              //document.getElementById("sending_to_parent").style.display = "block";
              $("#sending_to_parent").css('display', 'block');
              hasValidReceiver = true;
              currentValidReceiverName = toUsername;
              canSendTransaction = true;
              console.info("Found username: " + toUsername);
            } else {
              setWarning("sending_to", "Invalid Address or Username!");
              if (to.length > 0)
                document.getElementById("sending_to_parent").style.display = "block";
              else
                document.getElementById("sending_to_parent").style.display = "none";
              hasValidReceiver = false;
              currentValidReceiverName = "";
              canSendTransaction = false;
              console.info("Couldn't find user or address");
              document.getElementById("sending_avatar").innerHTML = '<div class="avatar_border" style="background-image: url(\'./gui/forge_unknown.png\'); height: 50px; width: 50px; display: inline-block; border-width: 1px; margin: 0px; margin-top: 20px;"></div>';
            }
          } else {
            let toUser = getProfile(to, true);
            if (toUser !== null) {
              toAddress = toUser.address;
              toUsername = toUser.name.replace("zenzo.", "");
              isUsername = true;
              document.getElementById("sending_to").innerHTML = toUsername;
              document.getElementById("sending_avatar").innerHTML = '<div class="avatar_border" style="background-image: url(' + (toUser.image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + toUser.image + '\'') + '); height: 50px; width: 50px; display: inline-block; border-width: 1px; margin: 0px; margin-top: 20px;"></div>';
              document.getElementById("sending_to_parent").style.display = "block";
              hasValidReceiver = true;
              currentValidReceiverName = toUsername;
              canSendTransaction = true;
              console.info("Found username: " + toUsername);
            } else {
              document.getElementById("sending_to").innerHTML = to;
              document.getElementById("sending_to_parent").style.display = "block";
              hasValidReceiver = true;
              currentValidReceiverName = "";
              canSendTransaction = true;
              console.info("Regular address");
            }
          }
          currentValidReceiver = toAddress;
        }

        setInterval(fetchBalances, 1000);


  /*INVENTORY*/

  let selectedItem = null;
        function openItemMenu(tx) {
          let thisItem = getItem(tx);
          document.getElementById("item_menu_name").innerHTML = thisItem.name;
          document.getElementById("item_menu_value").innerHTML = thisItem.value + " ZNZ";
          document.getElementById("item_menu_image").innerHTML = '<div class="item_border_img" style="background-image: url(' + (thisItem.image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + thisItem.image + '\'') + ');height: 275px !important;width: 220px !important; border-style: solid;"></div>';
          selectedItem = thisItem;
          document.getElementById("item_menu").style.display = "block";
        }
        function closeItemMenu() {
          document.getElementById("item_menu").style.display = "none";
        }
        function smeltForgeItemBtn() {
          let confirm = new ConfirmClass();
          confirm.show({
            title: 'Confirm Smelt',
            content: 'Are you sure you want to smelt "' + selectedItem.name + '"? Once smelted, this item will be destroyed forever and you will receive a total of ' + selectedItem.value + ' ZNZ',
            btns: [{
              text: "Confirm",
              callback: function(){
                console.log('Clicked Confirm Button');
                smeltForgeItem(selectedItem.tx);
              }
            }, {
              text: 'Cancel',
              callback: function(){
                console.log('Clicked Cancel Button');
              }
            }]
          })
        }
        function transferForgeItemBtn() {
          let confirm = new ConfirmClass();
          confirm.show({
            title: 'Confirm Transfer',
            content: 'Are you sure you want to send "' + selectedItem.name + '" to ' + (currentValidReceiverName === '' ? '"' + currentValidReceiver + '"' : '"' + currentValidReceiverName + '"') + '?',
            btns: [{
              text: "Confirm",
              callback: function(){
                console.log('Clicked Confirm Button');
                transferForgeItem(selectedItem.tx);
              }
            }, {
              text: 'Cancel',
              callback: function(){
                console.log('Clicked Cancel Button');
              }
            }]
          })
        }


        let itemCount = 0;
          let availableBalance = 0;
          let isWalletLocked = false;
          let canCraftItem = false;
          let canSendTransaction = false;


          let hasValidReceiver = false;
          let currentValidReceiver = "";
          let currentValidReceiverName = "";
          let currentInventorySearch = "";
          function craftItem() {
            //alert(canCraftItem);
            if (peers.length === 0 || !canCraftItem) return;
            let nName = $("#new_item_name").val();
            let nImage = $("#new_item_image").val();
            let nValue = Number($("#new_item_value").val());

            //alert(nName + nImage +nValue);

            if (nImage === "") {
              nImage = "default";
            }

            let confirm = new ConfirmClass();
            confirm.show({
              title: 'Confirm Craft',
              content: 'Are you sure you want to craft "' + nName + '"? Once crafted this item will arrive in your inventory and a total of ' + (nValue) + ' ZNZ will be locked (Minus 0.001 fee)',
              btns: [{
                text: "Confirm",
                callback: function(){
                  console.log('Clicked Confirm Button');
                  craftForgeItem(nName, nImage, nValue);
                }
              }, {
                text: 'Cancel',
                callback: function(){
                  console.log('Clicked Cancel Button');
                }
              }]
            })
            
          }

          function craftForgeItem (name, image, value) {
              superagent
              .post('http://127.0.0.1:' + forgePort + '/forge/create')
              .send({ name: name, image: image, amount: value, auth: authToken})
              .end((err, res) => {
                console.info(res);
                refreshInventory();
              });
          }

          function smeltForgeItem (tx) {
            let nItem = getItem(tx);
            zenzo.call("signmessage", addy, "smelt_" + nItem.tx).then(sig => {
              smeltItem({tx: tx, address: nItem.address}, sig).then(a => {closeItemMenu()});
            });
          }

          function transferForgeItem (item) {
              superagent
              .post('http://127.0.0.1:' + forgePort + '/forge/transfer')
              .send({ item: item, to: currentValidReceiver, auth: authToken})
              .end((err, res) => {
                closeItemMenu()
                console.info(res);
                refreshInventory();
              });
          }

          async function getForgeInventory (addr) {
              let inv = {items: [], pendingItems: [], unsignedItems: []};
              let res = await superagent.post('http://127.0.0.1:' + forgePort + '/forge/items');
              res = JSON.parse(res.text);
              for (let i=0; i<res.items.length; i++) {
                if (res.items[i] && res.items[i].address === addr && !res.items[i].name.startsWith("zenzo.")) inv.items.push(res.items[i]);
              }
              for (let i=0; i<res.pendingItems.length; i++) {
                if (res.pendingItems[i] && res.pendingItems[i].address === addr && !res.pendingItems[i].name.startsWith("zenzo.")) inv.pendingItems.push(res.pendingItems[i]);
              }
              for (let i=0; i<res.pendingItems.length; i++) {
                if (res.unsignedItems[i] && res.unsignedItems[i].address === addr && !res.unsignedItems[i].name.startsWith("zenzo.")) inv.unsignedItems.push(res.unsignedItems[i]);
              }
              return inv;
          }

          function refreshInventory() {
            getForgeInventory(addy).then(inv => {
              itemCount = 0;
              let itemHTML = "<br>";
              for (let i=0; i<inv.items.length; i++) {
                if (matchesInventorySearch(inv.items[i].tx) || matchesInventorySearch(inv.items[i].name)) inv.items[i].html = '<div onclick="openItemMenu(\'' + inv.items[i].tx + '\')" class="item_border">' + truncateWithEllipses(inv.items[i].name, 12) + '<div id="image" class="item_border_img" style="background-image: url(' + (inv.items[i].image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + inv.items[i].image + '\'') + ');"></div><div class="icon" style="width: 160px;"><img src="./gui/znz.svg"> ' + Number(inv.items[i].value.toFixed(2)).toPrecision() + ' ZNZ</div></div>';
              }
              for (let i=0; i<inv.pendingItems.length; i++) {
                if (matchesInventorySearch(inv.pendingItems[i].tx) || matchesInventorySearch(inv.pendingItems[i].name)) inv.pendingItems[i].html = '<div class="item_border" style="opacity: 0.5 !important; cursor:initial;">' + truncateWithEllipses(inv.pendingItems[i].name, 12) + '<div id="image" class="item_border_img" style="background-image: url(' + (inv.pendingItems[i].image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + inv.pendingItems[i].image + '\'') + ');"></div><div class="icon" style="width: 160px;"><img src="./gui/znz.svg"> ' + Number(inv.pendingItems[i].value.toFixed(2)).toPrecision() + ' ZNZ</div>';
              }
              for (let i=0; i<inv.unsignedItems.length; i++) {
                if (matchesInventorySearch(inv.unsignedItems[i].tx) || matchesInventorySearch(inv.unsignedItems[i].name)) inv.unsignedItems[i].html = '<div class="item_border" style="opacity: 0.5 !important; cursor:initial;">' + truncateWithEllipses(inv.unsignedItems[i].name, 12) + '<div id="image" class="item_border_img" style="background-image: url(' + (inv.unsignedItems[i].image === "default" ? '\'./gui/forge_unknown.png\'' : '\'' + inv.unsignedItems[i].image + '\'') + ');"></div><div class="icon" style="width: 160px;"><img src="./gui/znz.svg"> ' + Number(inv.unsignedItems[i].value.toFixed(2)).toPrecision() + ' ZNZ</div>';
              }

              let sortedItems = inv.items.concat(inv.pendingItems, inv.unsignedItems);
              sortedItems.sort(function(a, b){return b.value-a.value});

              for (let i=0; i<sortedItems.length; i++) {
                if (!_.isNil(sortedItems[i].html))
                  itemHTML += sortedItems[i].html;
                itemCount++;
              }
              document.getElementById("items").innerHTML = itemHTML;
            });
          }

          function matchesInventorySearch(i) {
            if (i.toLowerCase().includes(currentInventorySearch) || currentInventorySearch === "") return true;
            return false;
          }


          setInterval(function() {
            // Update peer UI
            if (safeMode) return setWarning("peerCount", "Offline (Missing RPC Connection)<br>Please start ZENZO Core, then restart the Forge.");
            if (peers.length === 0) {
              setWarning("peerCount", "Offline (No peers connected)");
            } else {
              $("#peerCount").text("Peers: "+peers.length);
              refreshInventory();
              
            }

            // Update wallet "Send" UI
            if (!canSendTransaction) {
              $("#send_button").css('opacity','0.4');

            } else {
              $("#send_button").css('opacity','1');
            }

            // Update selected card UI
            if (selectedItem && hasValidReceiver) {
              //document.getElementById("item_menu_transfer").style.display = "";
              $("#item_menu_transfer").css('display', '');
            } else {
              //document.getElementById("item_menu_transfer").style.display = "none";
              $("#item_menu_transfer").css('display', 'none');
            }

            // Update card designer
            let itemName = $("#new_item_name").val();
            console.log("intenName:"+itemName);
            let itemImage = $("#new_item_image").val();
            let itemValue = Number($("#new_item_value").val());
            canCraftItem = false;
            if (itemName.length >= 1 || itemImage.length >= 1 || itemValue > 0) {
              document.getElementById("new_item_preview_name").innerHTML = (itemName.length >= 1 ? truncateWithEllipses(itemName, 12) : "The Grandma...");
              document.getElementById("new_item_preview_value").innerHTML = (itemValue > 0 ? itemValue : "0") + " ZNZ";

              if (isWalletLocked) setWarning("card_designer_warning", "Wallet must be unlocked for crafting!", true);
              else if (itemName.length < 1 || itemName.length > 50) {
                setWarning("card_designer_warning", "Name must be between 1 and 50 chars", true);
                setRedBorder("new_item_name");
              }
              else if (itemImage.length !== 0 && itemImage.length < 10 || itemImage.length !== 0 && itemImage.length > 150) {
                setClearBorder("new_item_name");
                setWarning("card_designer_warning", "Image URL must be between 10 and 150 chars", true);
                setRedBorder("new_item_image");
              }
              else if (itemValue < 0.01) {
                setClearBorder("new_item_name");
                setClearBorder("new_item_image");
                setWarning("card_designer_warning", "Value must be atleast 0.01 ZNZ", true);
                setRedBorder("new_item_value");
              }
              else {
                setClearBorder("new_item_name");
                setClearBorder("new_item_image");
                setClearBorder("new_item_value");
                setText("card_designer_warning", "");
                canCraftItem = true;
              }

              if (!canCraftItem) {
                document.getElementById("craft_button").style.opacity = 0.4;
              } else {
                document.getElementById("craft_button").style.opacity = 1;
              }

              if (itemImage.length > 1) {
                document.getElementById("new_item_preview_image").innerHTML = '<div class="item_border_img" style="background-image: url(\'' + itemImage + '\');"></div>';
              } else {
                document.getElementById("new_item_preview_image").innerHTML = '<div class="item_border_img" style="background-image: url(\'./gui/forge_unknown.png\');"></div>';
              }
            } else {
              document.getElementById("new_item_preview_name").innerHTML = "The Grandma...";
              document.getElementById("new_item_preview_image").innerHTML = '<div class="item_border_img" style="background-image: url(\'./gui/forge_unknown.png\');"></div>';
              document.getElementById("new_item_preview_value").innerHTML = "15000 ZNZ";
            }

            // Update profile designer (If no profile is loaded into mem)
            if (!user_profile) {
              let profileName = document.getElementById("new_username");
              let profileImage = document.getElementById("new_avatar");
              //if (profileName.value.length >= 1)
                //document.getElementById("new_profile_name").innerHTML = profileName.value;
              //else
               // document.getElementById("new_profile_name").innerHTML = "Zentoshi Zakamoto";
              
              //if (profileImage.value.length >= 10 && profileImage.value.length <= 150)
                //document.getElementById("new_profile_avatar").innerHTML = '<div class="avatar_border" style="background-image: url(\'' + profileImage.value + '\'); margin-left: auto; margin-right: auto;"></div>';
              //else
                //document.getElementById("new_profile_avatar").innerHTML = '<div class="avatar_border" style="background-image: url(\'./gui/forge_unknown.png\'); margin-left: auto; margin-right: auto;"></div>';

              if (isWalletLocked) setWarning("profile_designer_warning", "Wallet must be unlocked for crafting!", true);
              else if (availableBalance <= 10) setWarning("profile_designer_warning", "A minimum of >10 ZNZ is required to create a profile!", true);
              else if (profileName.value.length < 1 || profileName.value.length > 50) setWarning("profile_designer_warning", "Name must be between 1 and 50 chars", true);
              else if (profileImage.value.length < 10 || profileImage.value.length > 150) setWarning("profile_designer_warning", "Avatar URL must be between 10 and 150 chars", true);
              else if (getProfile(profileName.value, true)) setWarning("profile_designer_warning", "Username already exists!", true);
              else setText("profile_designer_warning", "");
            }

            // Update inventory search
            if (itemCount > 6) {
              document.getElementById("inventory_search").style.display = "";
              if (document.getElementById("inventory_search_input").value.length >= 1)
                currentInventorySearch = document.getElementById("inventory_search_input").value.toLowerCase();
              else
                currentInventorySearch = "";
            } else {
              document.getElementById("inventory_search").style.display = "none";
            }
          }, 5000);
          

          refreshInventory();
          