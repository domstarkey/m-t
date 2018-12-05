

function getMtgLength(){
	var from = document.querySelector('[aria-label="Start time"]').value;
	var to = document.querySelector('[aria-label="End time"]').value;
  return (parseTime(to) - parseTime(from))/3600000;
}

function parseTime( t ) {
   var d = new Date();
   var time = t.match( /(\d+)(?::(\d\d))?\s*(p?)/ );
   d.setHours( parseInt( time[1] == "12" ? 0 : time[1] ) + (time[3] == "p" ? 12 : 0) );
   d.setMinutes( parseInt( time[2]) || 0 );
   return d;
}


function appendCostToGuests(textNode){
	var meetingLength = getMtgLength();

	var v = textNode.innerText;
	if (!v) return;
	var guestsString = v.match(/\d+ guests/);
	var appendString = "";
	if (guestsString){
		var numOfGuests = guestsString[0].match(/\d/g).join("");

		chrome.storage.sync.get('rate', function(data) {
			if (!data.rate) {
				avgHourlyRate = 30;
			} else {
				avgHourlyRate = data.rate;
			}
	    appendString = " (€" + (Math.round(numOfGuests * meetingLength * avgHourlyRate)) + ")";
			var nested = document.getElementById('meetingCost');
			if (nested){
				nested.innerText = appendString;
			}else{
				var newNode = document.createElement("span")
				newNode.setAttribute("id", "meetingCost");;
				var newTextNode = document.createTextNode(appendString);
				newNode.appendChild(newTextNode);
				textNode.appendChild(newNode);
			}

			});

		chrome.storage.sync.get('rate', function(data) {
			var nextTextNode = textNode.nextSibling;
			var w = nextTextNode.innerText;
			if (!w) return;
			var yesString = w.match(/\d+ yes/);
			var appendString2 = "";
			if (yesString){
				var numOfYesGuests = yesString[0].match(/\d/g).join("");
				appendString2 = " (€" + (Math.round(numOfYesGuests * meetingLength * avgHourlyRate)) + ")";
				var nested2 = document.getElementById('meetingCost2');
				if (nested2){
					nested2.innerText = appendString2;
				}else{
					var newNode2 = document.createElement("span")
					newNode2.setAttribute("id", "meetingCost2");;
					var newTextNode2 = document.createTextNode(appendString2);
					newNode2.appendChild(newTextNode2);
					nextTextNode.appendChild(newNode2);
				}
			}
		});
	}
}

function walk(node) {
	if (!node) return;
	var child, next;
	switch (node.nodeType) {
		case 1:
		case 9:
		case 11:
			child = node.firstChild;
			while ( child ) {
				next = child.nextSibling;
				walk(child);
				child = next;
			}
			break;
		case 3:
			if (!node.children){
				try {
					appendCostToGuests(node.parentElement);
				} catch (err) {
					//do nothing.
				}
			}
			break;
	}
}

function waitForAddedNode(params) {
    new MutationObserver(function(mutations) {
        var el = document.getElementById(params.id);
        if (el) {
            params.done(el);
        }
    }).observe(params.parent || document, {
        subtree: true,
        childList: true,
    });
}

waitForAddedNode({
    id: 'tabGuests',
    done: function(el) {
		  walk(el);
    }
});
