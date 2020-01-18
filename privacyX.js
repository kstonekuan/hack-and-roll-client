// ==UserScript==
// @name         PrivacyX
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Summarise T&C and Privacy Policies into easily digestable summary.
// @author       You
// @include      http://*/*
// @include      https://*/*
// @grant        GM_addStyle
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

const $ = window.jQuery;

(function () {
    'use strict';

    // Your code here...
    $(document).ready(() => {
        // Define regex for t&c and privacy policies
        const terms = /terms? ((((and|&) conditions)|(of (services?|use))))?/gmi;
        const privacy = /privacy|policy/gmi;

        const findPrivacyLink = () => {
            let links;
            // console.log($("a"));
            if ((links = $("a").filter(function() {return privacy.test($(this).text())})).length > 0) {
                // console.log(links);
                links[0].click();
                return "Moving to page"
            }
            return "No link to privacy policy page found"
        }

        const createPopup = (content) => {
            let popup = document.createElement('div');

            let logoBox = '<img id="logoBox" src="https://i.imgur.com/f2eUq0O.png"/>';
            let contentBox = '<div id="contentBox">content</div>';
            popup.setAttribute('id', 'popup');
            popup.innerHTML = logoBox + '<br/>' + contentBox;

            return popup;
        }

        //creates icon box for button
        let imgBox = '<img id="iconBox" src="https://i.imgur.com/Ab6y0Ca.png"/>';

        //create button to click to start chosen function;
        let zNode = document.createElement('div');
        zNode.innerHTML = '<button id="iconBtn" type="button">' + imgBox + '</button>';
        zNode.setAttribute('id', 'btnContainer');
        document.body.appendChild(zNode);

        // If we are on the right page then send url to the backend and receive the summarised text
        if (($("h1").filter(function() {return privacy.test($(this).text())})).length > 0
        || ($("h2").filter(function() {return privacy.test($(this).text())})).length > 0) {
            const currentUrl = window.location.href;
            const backend = "https://52.74.226.98/?link=";

            const popup = createPopup("Summary");
            document.body.appendChild(popup);
            // POST url to backend
            // If this method doesn't work try GM_xmlhttpRequest or $.ajax or fetch()
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (this.readyState == 4 && this.status == 200) {
                    // const popup = createPopup(xhttp.responseText);
                    // document.body.appendChild(popup);
                }
            };
            xhttp.open("GET", backend + currentUrl, true);
            xhttp.send();

            $('#iconBtn').on('click', () => {
                $("#popup").toggle();
            });

        } else {
            $('#iconBtn').on('click', () => {
                let zNode = createPopup('Finding privacy policy page...');
                document.body.appendChild(zNode);
                zNode = createPopup(findPrivacyLink());
            });
        }

        //--- Style our newly added elements using CSS.
        GM_addStyle(`
            #btnContainer {
                position:               fixed;
                top:                    2px;
                right:                  10px;
                background:             transparent;
                border:                 0px;
                margin:                 0px;
                opacity:                0.9;
                z-index:                9999;
                padding:                0px;
            }
            #iconBtn {
                cursor:                 pointer;
                background:             white;
                border-radius:          4px;
            }
            #iconBtn:hover {
                background:             #f7f7f7;
            }

            #popup {
                position:               fixed;
                top:                    28px;
                right:                  10px;
                z-index:                9999;
                border:                 1px outset black;
                background:             #f7f7f7;
                padding:                10px;
                text-align:             center;
                border-radius:          10px;
                max-width:              320px;
            }
            #iconBox {
                max-width:              16px;
                max-height:             16px;
                border:                 0px;
            }
            #logoBox {
                max-width:              120px;
                border:                 0px;
                margin-bottom:          10px;
            }
            #contentBox {
                border:                 0px;
                font-family:            'Karla';
                font-size:              18px;
            }
        ` );
    });
})();