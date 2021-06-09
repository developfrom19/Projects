//test
var nebraskaEdu = {

	closeApp : function (localAppName) {
		/*Close application in split view*/
		if (sap.n.Shell.SplitClose == false) {
			if (sap.n.Shell.SplitLeftApp) {
				if (sap.n.Shell.SplitLeftApp.APPLID == localAppName) {
					AppCachePageSplitTemp1.removeAllContent();
					return;
				}
			}

			if (sap.n.Shell.SplitRightApp) {
				if (sap.n.Shell.SplitRightApp.APPLID == localAppName) {
					AppCachePageSplitTemp2.removeAllContent();
					return;
				}
			}
			return;
		}

		if (sap.n.Launchpad.currentTile == "") {
			AppCache.Back();
			return;
		}

		// Destroy current App or URL
		if (sap.n.Launchpad.currentTile.URL_EXTERNAL || sap.n.Launchpad.currentTile.SAP_TRANS) {
			var iframe = $("#iFrame" + sap.n.Launchpad.currentTile.GUID)
				iframe[0].parentNode.removeChild(iframe[0]);
		} else if (sap.n.Launchpad.currentTile.FIORI_ID) {
			sap.n.Launchpad.fioriApps[sap.n.Launchpad.currentTile.FIORI_ID] = null;
			sap.n.currentView.destroy();
		} else {
			// Format ID
			var applid = sap.n.Launchpad.currentTile.APPLID.replace(/\//g, "");
			// Custom beforeClose
			if (sap.n.Apps[applid].beforeClose) {
				$.each(sap.n.Apps[applid].beforeClose, function (i, data) {
					data();
				});
			}
			if (AppCache.View[sap.n.Launchpad.currentTile.GUID]) {
				AppCache.View[sap.n.Launchpad.currentTile.GUID] = null;
			} else {
				AppCache.View[applid] = null;
			}
			sap.n.currentView.removeAllContent();
			sap.n.currentView.destroy();
		}
		// Destroy Button
		if (sap.ui.Device.system.phone == false) {
			var navBut = sap.ui.getCore().byId("but" + sap.n.Launchpad.currentTile.GUID);
			navBut.destroy();
		}
		// Navigate Home
		AppCache.Load(AppCache.StartApp);
		if (AppCacheShellMenu.getSelected() == false && sap.ui.Device.system.desktop == true) {
			AppCacheShellMenu.firePress();
		}
		// sap.n.Launchpad.SetHeader();
	},

	goBack : function () {
		if (sap.n) {
			//var currentTileName = sap.n.Launchpad.currentTile.APPLID;
			var currentTileName = AppCache.CurrentApp;
			if (currentTileName !== sap.n.currentView.getViewName()) {
				sap.n.currentView.oParent.back();
			} else {
				AppCache.Back();
				if (AppCacheShellMenu.getSelected() == false) {
					AppCacheShellMenu.firePress();
				}
			}
		} else {
			window.close();
		}
	},

	hideSideMenu : function () {
		if (sap.n.Shell.SplitClose == undefined || sap.n.Shell.SplitClose == true) {
			if (AppCacheShellMenu.getSelected() == true) {
				AppCacheShell.setShowPane(!AppCacheShell.getShowPane());
				AppCacheShellMenu.setSelected(AppCacheShell.getShowPane());
			}
		}
	},
	printADiv : function (contentArea) {
		var selector = "#" + contentArea;
		if ($(selector).length <= 0 && sap.n) {
			//selector = "#" + sap.n.currentView.byId(controlName).sId;
			selector = "#" + sap.n.currentView.sId + "--" + contentArea;
		}
		if ($(selector).length <= 0) {
			window.print();
			return;
		}

		$("head").append("<style id=\"printerStyle\"></style>");
		$("#printerStyle").html(
			"@media print {"
			 + "body * {"
			 + "visibility: hidden;"
			 + "}"
			 + "#printableContent, #printableContent * {"
			 + "visibility: visible;"
			 + "}"
			 + "#printableContent {"
			 + "position: absolute;"
			 + "left: 0;"
			 + "top: 0;"
			 + "width: 100%;"
			 + "}"
			 + "}"
			 + "@page {"
			 + "margin: 0.25in;"
			 + "}");

		$("body").append("<div id=\"printableContent\"></div>");
		$("#printableContent").html($(selector).html());
		$(".printOnly").css("display", "block");
		window.print();
		$("#printableContent").remove();
		$("#printerStyle").remove();
		$(".printOnly").css("display", "none");
	},
	
	countOnTile : function (appId, c) {
		if (sap.n) {
			var rec = {};
			rec.APPLID = appId;
			rec.TILE_NUMBER = c;
			rec.TILE_VALUECOLOR = 'Good'; //| Neutral
			sap.n.Launchpad.UpdateTileInfo(rec);

		}
	},

	captureAjaxError : function (rObj, status, c1, c2, ajaxCall) {
		//Busy Indicators
		if (c1) {
			c1.setBusy(false);
		}
		if (c2) {
			c2.setBusy(false);
		}

		sap.ui.core.BusyIndicator.hide();

		diaAjaxError.open();

		//ReadyState
		switch (rObj.readyState) {
		case 0:
			rsTxt.setText('REQUEST NOT INITIALIZED');
			break;
		case 1:
			rsTxt.setText('SERVER CONNECTION ESTABLISHED');
			break;
		case 2:
			rsTxt.setText('REQUEST RECEIVED');
			break;
		case 3:
			rsTxt.setText('PROCESSING REQUEST');
			break;
		case 4:
			rsTxt.setText('REQUEST FINISHED AND RESPONSE IS READY');
			break;
		default:
			//execute code default
			break;

		}

		switch (rObj.status) {
		case 200:
			sTxt.setText('OK');
			break;
		case 403:
			sTxt.setText('Forbidden');
			break;
		case 404:
			sTxt.setText('Not Found');
			break;
		}
		stTxt.setText(rObj.statusText);

		if (rObj.responseText) {
			var iF = document.getElementById('oiFrame');
			var iFrameDoc = iF.contentDocument;
			iFrameDoc.body.innerHTML = rObj.responseText;

			//Create HTML String
			var arr = [AppCache.CurrentUname, AppCache.CurrentApp, ajaxCall, new Date()];
			var newString = "";
			for (var k = 0; k < arr.length; k++) {
				var s = makeHTML(arr[k]);
				newString = newString + s;
			}

			var obj = {
				HTML_1 : newString,
				HTML_2 : rObj.responseText
			};

			modelAjaxErrorModel.setData(obj);
			getOnlineAjaxErrorModel();
		}

		function makeHTML(value) {
			var sen = '<p><center>' + value + '</center></p>' + '<br>';
			return sen;
		}
	}

};