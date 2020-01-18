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
                setTimeout(() => window.location.reload(), 1000);
                return "Moving to page"
            }
            $("#iconBtn").off()
            $('#iconBtn').on('click', () => $("#popup").toggle());
            return "No link to privacy policy page found"
        }

        const createPopup = (content) => {
            let popup = document.createElement('div');

            let logoBox = '<img id="logoBox" src="https://i.imgur.com/f2eUq0O.png"/>';
            let contentBox = '<div id="contentBox">' + content + '</div>';
            popup.setAttribute('id', 'popup');
            popup.innerHTML = logoBox + '<br/>' + contentBox;

            return popup;
        }

        const bannedSymbols = ['{','}',"'",'"'];

        const cleanUp = (sentenceArray) => {
            let output = '';

            for (let i = 0; i < sentenceArray.length; i++){
                let clean = true;
                for (let j = 0; j < bannedSymbols.length; j++){
                    if (sentenceArray[i].includes(bannedSymbols[j])){
                        clean = false;
                    }
                }
                if (clean){
                    output += '<div class="sentenceBox">' + sentenceArray[i] + '</div>';
                }
            }

            if (output.length == 0){
                output = 'No valid content found';
            }
            return output;
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
            const backend = "https://d12aodjr8sssf3.cloudfront.net/?link=";

            // const popup = createPopup("Summary");
            // document.body.appendChild(popup);
            // POST url to backend
            // If this method doesn't work try GM_xmlhttpRequest or $.ajax or fetch()
            fetch(backend + currentUrl)
                .then((response) => response.json())
                .then((myJson) => {
                console.log(myJson);
                const popup = createPopup(cleanUp(myJson.summary_sentences));
                document.body.appendChild(popup);
            });

            $('#iconBtn').on('click', () => $("#popup").toggle());

        } else {
            $('#iconBtn').on('click', () => {
                let zNode = createPopup('Finding privacy policy page...');
                document.body.appendChild(zNode);
                $('#contentBox').text(findPrivacyLink());
            });
        }

        //--- Style our newly added elements using CSS.
        GM_addStyle(`
            #btnContainer {
                position:               fixed;
                top:                    2px;
                right:                  10px;
                background:             transparent;
                border:                 0;
                margin:                 0;
                opacity:                0.9;
                z-index:                9000;
                padding:                0;
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
                z-index:                9000;
                border:                 1px outset black;
                background:             #f7f7f7;
                padding:                1em;
                text-align:             center;
                border-radius:          10px;
                max-width:              30em;
                box-shadow:             1px 2px 4px rgba(0, 0, 0, 0.3);
            }
            #iconBox {
                max-width:              1.5em;
                max-height:             1.5em;
                border:                 0;
            }
            #logoBox {
                text-align:             center;
                background:             transparent;
                max-width:              10em;
                border:                 0;
                margin-bottom:          0.1em;
            }
            #contentBox {
                border:                 0;
                font-family:            'Karla';
                font-size:              12px;
            }
            .sentenceBox{
                border:                 1px #999999;
                border-style:           solid;
                background:             #fafafa;
                padding:                0.5em 1em;
                margin:                 0.5em 0.1em;
                border-radius:          6px;
                font-family:            'Karla';
                font-size:              12px;
            }
        ` );
    });
})();