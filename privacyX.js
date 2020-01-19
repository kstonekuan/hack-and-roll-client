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
        if (window.self === window.top) {
            // Define regex for t&c and privacy policies
            const terms = /terms? ((((and|&) conditions)|(of (services?|use))))?/gmi;
            const privacy = /privacy|policy/gmi;

            const findPrivacyLink = () => {
                let links;
                // console.log($("a"));
                if ((links = $("a").filter(function () { return privacy.test($(this).text()) })).length > 0) {
                    // console.log(links);
                    links[0].click();
                    setTimeout(() => window.location.reload(), 1000);
                    return "Moving to page"
                }
                $("#iconBtn").off()
                $('#iconBtn').on('click', () => $("#popup").toggle());
                return '<div class="statsIconCol" style="flex:1; display:flex; align-items:center; flex-direction:column">' + badIcon + '<div class="statsTextCol">No link to privacy policy page found</div></div></div>';
            }

            const createPopup = (content) => {
                let popup = document.createElement('div');

                let logoBox = '<img id="logoBox" src="https://i.imgur.com/f2eUq0O.png"/>';
                let contentBox = '<div id="contentBox">' + content + '</div>';
                popup.setAttribute('id', 'popup');
                popup.innerHTML = logoBox + '<br/>' + contentBox;

                return popup;
            }

            //const bannedSymbols = ['{', '}', "'", '"'];
            const badIcon = '<img class="ratingIconBox" src=https://i.imgur.com/mkPw6cC.png />';
            const goodIcon = '<img class="ratingIconBox" src=https://i.imgur.com/c6oqA2H.png />';

            const cleanUp = (myJson) => {

                let output = '<div id="statsTable" style="width:100%; display:flex; align-items:center;">';

                const complexIcon = myJson.complexity_score > 0.5 ? badIcon : goodIcon;
                output += '<div class="statsIconCol">' + complexIcon + '<div class="statsTextCol">Complexity: ' + parseInt(myJson.complexity_score * 100) + '%</div></div>';

                const readIcon = myJson.readability_score > 70 ? goodIcon : badIcon;
                output += '<div class="statsIconCol">' + readIcon + '<div class="statsTextCol">Readability: ' + parseInt(myJson.readability_score) + '%</div></div></div>';

                let sentenceArray = myJson.summary_sentences;
                output += '<table id="summaryTable" style="width:100%">';

                sentenceArray.forEach(sentence => {
                    output += '<tr class="summaryRows">'

                    if (sentence.rating > 0) {
                        output += '<td class="ratingIconCol">' + goodIcon + '</td>';
                    }
                    else if (sentence.rating < 0) {
                        output += '<td class="ratingIconCol">' + badIcon + '</td>';
                    }
                    else {
                        output += '<td/>';
                    }
                    output += '<td class="sentenceCol"><div class="sentenceBox">' + sentence.text + '</div></td></tr>'
                });

                output += '</table>';

                return output;
            }

            //creates icon box for button
            let imgBox = '<img id="iconBox" src="https://i.imgur.com/Ab6y0Ca.png"/>';

            //create button to click to start chosen function;
            let zNode = document.createElement('div');
            zNode.innerHTML = '<button id="iconBtn" type="button">' + imgBox + '</button>';
            zNode.setAttribute('id', 'btnContainer');
            document.body.appendChild(zNode);

            const currentUrl = window.location.href;
            const backend = "https://d12aodjr8sssf3.cloudfront.net/?link=";
            const backendText = "https://d12aodjr8sssf3.cloudfront.net/";

            // If we are on the right page then send url to the backend and receive the summarised text
            if (($("h1").filter(function () { return (privacy.test($(this).text()) || terms.test($(this).text())) })).length > 0
                || ($("h2").filter(function () { return (privacy.test($(this).text()) || terms.test($(this).text())) })).length > 0
                || privacy.test(currentUrl) || terms.test(currentUrl)) {

                // const popup = createPopup("Summary");
                // document.body.appendChild(popup);
                // POST url to backend
                // If this method doesn't work try GM_xmlhttpRequest or $.ajax or fetch()
                fetch(backend + currentUrl)
                    .then((response) => response.json())
                    .then((myJson) => {
                        console.log(myJson);
                        if (myJson.summary_sentences.length > 0) {
                            const popup = createPopup(cleanUp(myJson));
                            document.body.appendChild(popup);
                        } else {
                            const popup = createPopup(form);
                            document.body.appendChild(popup);

                            $('#formBtn').on('click', () => {
                                console.log($('#texta').text());
                                const data = { text: $('#texta').val() };
                                fetch(backendText, {
                                    method: 'POST', // or 'PUT'
                                    mode: 'cors', // no-cors, *cors, same-origin
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(data),
                                })
                                    .then((response) => response.json())
                                    .then((myJson) => {
                                        console.log(myJson);
                                        $('#contentBox').html(cleanUp(myJson));
                                    })
                                    .catch((error) => {
                                        console.error('Error:', error);
                                        $('#contentBox').html(form);
                                    });
                            });
                        }
                    });

                $('#iconBtn').on('click', () => $("#popup").toggle());

            } else {
                $('#iconBtn').on('click', () => {
                    let zNode = createPopup('Finding privacy policy page...');
                    document.body.appendChild(zNode);
                    $('#contentBox').html(findPrivacyLink());
                });
            }

            let form = `
                <div class="statsIconCol">
                    <div>Could not connect please insert text manually</div>
                    <textarea id="texta" name="text"></textarea><br/>
                    <button id='formBtn' type="button">Submit</button>
                </div>
            `;





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
                z-index:                9999;
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
                z-index:                9999;
                border:                 1px outset black;
                background:             #f7f7f7;
                padding:                1em;
                align-items:          center;
                border-radius:          10px;
                max-width:              30em;
                max-height:             80%;
                box-shadow:             1px 2px 4px rgba(0, 0, 0, 0.3);
                display:                flex;
                flex-direction:         column;
                }
                #iconBox {
                max-width:              1.5em;
                max-height:             1.5em;
                border:                 0;
                }
                #logoBox {
                background:             transparent;
                width:                  auto;
                max-height:             1.5em;
                border:                 0;
                margin-bottom:          0.1em;
                }
                #contentBox {
                border:                 0;
                font-family:            'Karla';
                font-size:              12px;
                text-align:             center;
                overflow-y:             scroll;
                }

                #summaryTable{
                background:             #f7f7f7;
                border:                 0;
                }
                .sentenceCol{
                width:                  95%;
                vertical-align:         middle;
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
                .summaryRows{
                background:             #f7f7f7;
                }
                .ratingIconCol{
                vertical-align:         middle;
                }
                .ratingIconBox{
                max-height:             2em;
                margin-top:             1em;
                width:                  auto;
                }

                .statsTextCol{
                vertical-align:         middle;
                }
                .statsIconCol{
                flex:                   1;
                display:                flex;
                align-items:            center;
                flex-direction:         column;
                }
                ` );
        }
    });
})();