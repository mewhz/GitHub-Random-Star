// ==UserScript==
// @name         GitHub Random Star
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  随机展示自己 star 的仓库
// @author       mewhz
// @match        https://github.com/*?tab=stars
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @connect      api.github.com
// ==/UserScript==

(function () {
    'use strict';

    // GitHub Token
    let token = "";

    // 随机显示 star 的数量
    let randomSize = 3;

    // 仓库描述显示的最大字符串长度
    let descriptionMax = 200;

    let starSize = 0;

    let set = new Set();

    let doc = document.querySelector("#user-profile-frame > div > div.my-3.d-flex.flex-justify-between.flex-items-center");

    // 在页面中创建元素
    function createdElements(json, starred_at) {

        let full_namePrefix = json["full_name"].split("/")[0];
        let full_nameSuffix = json["full_name"].split("/")[1];
        let description = json["description"];
        let language = json["language"];
        let stargazers_count = json["stargazers_count"];
        let forks_count = json["forks_count"];

        if (description === null ) description = "";
        if (language === null ) language = "";

        console.log(description.length);

        if (description.length > descriptionMax) description = description.slice(0, descriptionMax) + "...";

        let div = document.createElement("div");
        let divBorder = document.createElement("div");

        divBorder.innerHTML = `
            <div class="border-bottom">
                <h3>
                    <p>
                        <a href="https://github.com/${full_namePrefix}/${full_nameSuffix}">
                            ${full_namePrefix} / ${full_nameSuffix}
                        </a>
                    </p>
                </h3>
                <p>${description}</p>
                <p>
                    language: <strong>${language}</strong> 
                    stars: <strong>${stargazers_count}</strong> 
                    fork: <strong>${forks_count}</strong>
                    starred: <strong>${starred_at}</strong>
                </p>
            </div>`;

        div.appendChild(divBorder);

        doc.parentElement.insertBefore(div, doc);

    }

    // 获取随机值
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 格式化日期
    function timeFormat(date) {

        date = new Date(date);

        date = date.toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
        date = new Date(date);

        let year = date.getFullYear(); // 获取年份
        let month = ("0" + (date.getMonth() + 1)).slice(-2); // 获取月份，月份需要加 1，并且补零到两位数
        let day = ("0" + date.getDate()).slice(-2); // 获取日期，补零到两位数

        let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dayOfWeek = daysOfWeek[date.getDay()]; // 获取星期几

        let hours = ("0" + date.getHours()).slice(-2); // 获取小时，补零到两位数
        let minutes = ("0" + date.getMinutes()).slice(-2); // 获取分钟，补零到两位数
        let seconds = ("0" + date.getSeconds()).slice(-2); // 获取秒数，补零到两位数

        let starred_at = year + "-" + month + "-" + day + " " + dayOfWeek + " " + hours + ":" + minutes + ":" + seconds;

        return starred_at;

    }

    // 获取 star 数量
    function getStarSize(headers) {
        
        let regex = /<[^>]*\?page=(\d+)[^>]*>; rel="last"/;
        let matches = headers.match(regex);

        if (matches) {

            starSize = matches[1];

        }

        console.log(starSize);

    }

    // 对 API 发起请求
    function request(page, per_page, isGetSize) {

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: `https://api.github.com/user/starred?page=${page}&per_page=${per_page}`,
                method: "GET",
                headers: {
                    "Accept": "application/vnd.github.star+json",
                    "Authorization": `Bearer  ${token}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                },
                onload: (response) => {

                    if (isGetSize) {
                        resolve(getStarSize(response.responseHeaders));
                    }
                    else {

                        let json = JSON.parse(response.responseText);

                        let starred_at = timeFormat(json[0]["starred_at"]);

                        createdElements(json[0]["repo"], starred_at);

                        resolve();
                    }

                }
            });
        })

    }

    async function init() {
        await request(1, 1, true);

        if (starSize < 1) return;

        if (starSize < randomSize)  randomSize = starSize;

        let div = document.createElement("div");

        div.innerHTML = `<div><h2 class="f3-light mb-n1">Random Stars 我收藏 ≠ 我会看</h2></div>`;

        doc.parentElement.insertBefore(div, doc);

        while (set.size != randomSize) {
            let value = randomInt(0, starSize);

            if (!set.has(value)) {

                set.add(value);

                request(value, 1, false);

            }

        }
    }

    init();

})();