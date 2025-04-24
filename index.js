// ==UserScript==
// @name         GitHub Random Star
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  随机展示自己 star 的仓库
// @author       mewhz
// @match        https://github.com/*?tab=stars
// @icon         https://github.githubassets.com/favicons/favicon.svg
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

    // 添加样式
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cards-container {
                overflow: hidden;
                max-height: 0;
                opacity: 0;
                transition: max-height 0.6s ease-in-out, opacity 0.5s ease-in-out;
            }
            .cards-container.expanded {
                max-height: 3000px;
                opacity: 1;
            }
            .toggle-btn {
                cursor: pointer;
                color: #0366d6;
                font-size: 20px;
                margin-left: 10px;
                user-select: none;
                display: inline-block;
            }
            .toggle-btn:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }

    // 在页面中创建元素
    function createdElements(json, starred_at) {

        let full_namePrefix = json["full_name"].split("/")[0];
        let full_nameSuffix = json["full_name"].split("/")[1];
        let description = json["description"];
        let language = json["language"];
        let stargazers_count = json["stargazers_count"];
        let forks_count = json["forks_count"];

        let pushed_at = timeFormat(json["pushed_at"]);

        if (description === null) description = "";
        if (language !== null) language = `语言: <strong>${language}</strong>`;
        if (language === null) language = "";

        if (description.length > descriptionMax) description = description.slice(0, descriptionMax) + "...";

        let div = document.createElement("div");
        let divBorder = document.createElement("div");

        div.className = "card";

        console.log(language);

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
                    ${language}
                    stars: <strong>${stargazers_count}</strong>
                    fork: <strong>${forks_count}</strong>
                    收藏时间: <strong>${starred_at}</strong>
                    更新时间: <strong>${pushed_at}</strong>
                </p>
            </div>
                 `;

        div.appendChild(divBorder);

        // 将卡片添加到容器中
        document.getElementById('cards-container').appendChild(div);
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


        let hours = ("0" + date.getHours()).slice(-2); // 获取小时，补零到两位数
        let minutes = ("0" + date.getMinutes()).slice(-2); // 获取分钟，补零到两位数
        let seconds = ("0" + date.getSeconds()).slice(-2); // 获取秒数，补零到两位数

        let starred_at = year + "-" + month + "-" + day + " " + " " + hours + ":" + minutes + ":" + seconds;

        return starred_at;

    }

    // 获取 star 数量
    function getStarSize(headers) {

        let regex = /<[^>]*\?page=(\d+)[^>]*>; rel="last"/;
        let matches = headers.match(regex);

        if (matches) {

            starSize = matches[1];

        }

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
        // 添加样式
        addStyles();
        
        await request(1, 1, true);

        if (starSize < 1) return;

        if (starSize < randomSize) randomSize = starSize;

        let div = document.createElement("div");

        div.style = 'margin-bottom: 5px; display: flex';

        div.innerHTML = `
            <h2 class="f3-light mb-n1">Random Stars 我收藏 ≠ 我会看</h2>
            <a id="refresh" style="font-size: 20px;margin-left: 10px;cursor: pointer;">刷新</a>
            <div class="toggle-btn">展开</div>
        `;

        // 创建卡片容器
        let cardsContainer = document.createElement("div");
        cardsContainer.id = "cards-container";
        cardsContainer.className = "cards-container";
        
        // 将标题和卡片容器添加到页面
        doc.parentElement.insertBefore(div, doc);
        doc.parentElement.insertBefore(cardsContainer, doc);
        
        // 添加展开/关闭功能
        const toggleBtn = div.querySelector('.toggle-btn');
        toggleBtn.addEventListener('click', function () {
            const container = document.getElementById('cards-container');
            const isExpanded = container.classList.contains('expanded');
            
            // 切换容器的展开状态
            container.classList.toggle('expanded');
            
            // 更新按钮文本
            toggleBtn.textContent = isExpanded ? '展开' : '关闭';
        });

        div.onclick = (event) => {
            if (event.target.id == "refresh") {
                remove();
                insert();
                
                // 刷新后保持当前的展开/关闭状态
                const container = document.getElementById('cards-container');
                const isExpanded = container.classList.contains('expanded');
                if (isExpanded) {
                    container.classList.add('expanded');
                    toggleBtn.textContent = '关闭';
                }
            }
        };

        insert();

    }

    function insert() {
        set.clear();

        while (set.size != randomSize) {
            let value = randomInt(0, starSize);

            if (!set.has(value)) {
                set.add(value);
                request(value, 1, false);
            }
        }
    }

    function remove() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';
    }

    init();

})();