'use strict';
const Axios = require('axios');
const Cheerio = require('cheerio');
const Url = require('url');
const Moment = require('moment');

const toTimestamp = (strDate) => {  
    const dt = new Date(strDate);  
    return parseInt(dt.getTime().toString().replace('000', ''));  
};

const options = { 
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0'
    }
};

const search_metacritic = async (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await Axios.get(`https://www.metacritic.com/search/movie/${encodeURIComponent(query)}/results`, options);
            const $ = Cheerio.load(response.data);

            const first_result_href = $('.first_result > div > div:nth-child(2) > div > h3:nth-child(3) > a').attr('href') || $('h3.product_title:nth-child(2) > a:nth-child(1)').attr('href');
            if (first_result_href === undefined) {
                reject(`No result for query: ${query}`);
            } else {
                const url = `https://www.metacritic.com${first_result_href}/details`;
                const resp = await Axios.get(url, options);
                const $ = Cheerio.load(resp.data);
            
                const title = $('.product_page_title').text().trim();
                const summary = $('.summary > span:nth-child(2)').text().trim().replaceAll('  ', ' ');
                const release_date = $('.release_date > span:nth-child(2)').text().trim();
                const production = $('.company > td:nth-child(2)').text().trim();
            
                const metascore = $('td.left > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)').text().trim();
                const critics_number = $('td.left > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > div:nth-child(2) > span:nth-child(1) > a:nth-child(1) > span:nth-child(2)').text().replace('based on ', '').replace(' Critic Reviews', '').trim();

                const userscore = $('td.right > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)').text().trim();
                const rating_number = $('td.right > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > div:nth-child(2) > span:nth-child(1) > a:nth-child(1) > span:nth-child(2)').text().replace(' Ratings', '').replace('based on ', '').trim();

                resolve({
                    title,
                    production,
                    url,
                    release_date,
                    summary,
                    metascore,
                    critics_number,
                    userscore,
                    rating_number
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

(async () => {
    const result = await search_metacritic("Django");
    console.log(result);
})()