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

        // If we are on the right page then send url to the backend and receive the summarised text
        if (($("h1").filter(function() {return privacy.test($(this).text())}).length > 0)) {
            const currentUrl = window.location.href;
            const backend = "https://52.74.226.98/?link=";
            // POST url to backend
            // If this method doesn't work try GM_xmlhttpRequest or $.ajax or fetch()
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (this.readyState == 4 && this.status == 200) {
                    let popup = createPopup(xhttp.responseText);
                }
            };
            xhttp.open("GET", backend + currentUrl, true);
            xhttp.send();
        }

        const findPrivacyLink = () => {
            let link;
            // console.log($("a"));
            $("a").each(function(index) {
                // console.log( index + ": " + $( this ).text() );
                if (($(this).text()).match(privacy)) {
                    console.log($(this)[0]);
                    $(this)[0].click();
                    return "Moving to page";
                }
            });
            return "No link to privacy policy page found."
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
        zNode.innerHTML = '<button id="myButton" type="button" class="bewton">' + imgBox + '</button>';
        zNode.setAttribute('id', 'myContainer');
        document.body.appendChild(zNode);

        $('#myButton').on('click', () => {
            let zNode = createPopup('Finding privacy policy page...');
            document.body.appendChild(zNode);
            //zNode.innerHTML = createPopup(findPrivacyLink());
        });

        //--- Style our newly added elements using CSS.
        GM_addStyle(`
            #myContainer {
                position:               fixed;
                top:                    2px;
                right:                  2px;
                background:             white;
                border:                 0px;
                margin:                 0px;
                opacity:                0.9;
                z-index:                9999;
                padding:                0px;
            }
            .bewton {
                cursor:                 pointer;
            }
            #myContainer p {
                color:                  red;
                background:             white;
            }

            #popup {
                position:               fixed;
                top:                    24px;
                right:                  2px;
                z-index:                9999;
                border:                 1px outset black;
                background:             #f7f7f7;
                padding:                10px;
                text-align:             center;
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
            }
        ` );
    });
})();