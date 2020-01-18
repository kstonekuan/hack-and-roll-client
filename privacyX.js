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

(function () {
    'use strict';

    // Your code here...
    $(document).ready(() => {
        // Define regex for t&c and privacy policies
        const terms = /terms? ((((and|&) conditions)|(of (services?|use))))?/gmi;
        const privacy = /privacy|policy/gmi;

        // If we are on the right page then send url to the backend and receive the summarised text
        if ($("h1:contains(privacy)") || $("h2:contains(privacy)")) {
            const currentUrl = window.location.href;
            const backend = "http://www.google.com/search?q=";
            // POST url to backend
            // If this method doesn't work try GM_xmlhttpRequest or $.ajax
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (this.readyState == 4 && this.status == 200) {
                    //create button to click to start chosen function;
                    let summary = document.createElement('div');
                    summary.setAttribute('id', 'summary');
                    summary.innerHtml = xhttp.responseText;
                    document.body.appendChild(zNode);
                }
            };
            xhttp.open("GET", backend + currentUrl, true);
            xhttp.send();
        }

        const findPrivacyLink = () => {
            if ($("a:contains(privacy)")) {
                $("a:contains(privacy)").click();
                return "Moving to page";
            }
            else return "No link to privacy policy page found."
        }

        //create button to click to start chosen function;
        let zNode = document.createElement('div');
        zNode.innerHTML = '<button id="myButton" type="button" class="bewton">Click me if you dare!</button>';
        zNode.setAttribute('id', 'myContainer');
        document.body.appendChild(zNode);

        $('#myButton').on('click', () => {
            let zNode = document.createElement('p');
            zNode.innerHTML = 'Finding privacy policy page...';
            document.getElementById("myContainer").appendChild(zNode);
            zNode.innerHTML = findPrivacyLink();
        });

        //--- Style our newly added elements using CSS.
        GM_addStyle(`
            #myContainer {
            position:               fixed;
            top:                    0;
            left:                   0;
            font-size:              20px;
            background:             orange;
            border:                 3px outset black;
            margin:                 5px;
            opacity:                0.9;
            z-index:                9999;
            padding:                5px 20px;
            }
            .bewton {
            cursor:                 pointer;
            }
            #myContainer p {
            color:                  red;
            background:             white;
            }
        ` );
    });
})();