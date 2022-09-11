'use strict';
const Sqlite3 = require('sqlite3');
const Path = require('path');
const Db = new Sqlite3.Database(Path.join(__dirname, '../database.db'));

exports.getTypeOfVideo = (slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes_episodes WHERE episode_slug = ?`, slug, async function(err, rows) {
            if (err) reject(err);

            if (rows.length != 0) resolve("anime"); // If rows != 0 is a anime
            else {
                Db.all(`SELECT * FROM movies WHERE slug = ?`, slug, async function(err, rows) {
                    if (err) reject(err);
            
                    if (rows.length != 0) resolve("movie");
                        else reject(null);
                    
                });
            }
        });
    });
};

exports.getAnime = (slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes WHERE slug = ?`, slug, async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows[0]);
                else reject("No animes found.");
            
        });
    });
};

exports.getMovie = (slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM movies WHERE slug = ?`, slug, async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows[0]);
                else reject("No animes found.");
            
        });
    });
};

exports.getAnimes = (limit = 20) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes ORDER BY ROWID ASC LIMIT ${limit}`, async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows);
                else reject("Error in Database.getAnimes");
            
        });
    });
};

exports.getMovies = (limit = 20) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM movies ORDER BY ROWID ASC LIMIT ${limit}`, async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows);
                else reject("Error in Database.getMovies");
            
        });
    });
};

exports.getAnimeEpisodes = (anime_slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes_episodes WHERE anime_slug = ?`, anime_slug, async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows);
                else reject("No animes found.");
            
        });
    });
};

exports.getEpisode = (episode_slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes_episodes WHERE episode_slug = ?`, episode_slug, async function(err, rows) {
            if (err) reject(err);

            if (rows.length != 0) resolve(rows[0]);
                else reject("No episode found.");
            
        });
    });
};

exports.getAnimeSeasons = (anime_slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes_seasons WHERE anime_slug = ?`, anime_slug, async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows);
                else reject("No animes found.");
            
        });
    });
};

exports.getAnimeSeason = (season_number, anime_slug) => {
    return new Promise((resolve, reject) => {
        Db.all(`SELECT * FROM animes_seasons WHERE anime_slug = ? AND season_number = ?`, [anime_slug, season_number], async function(err, rows) {
            if (err) reject(err);
    
            if (rows.length != 0) resolve(rows[0]);
                else reject("No season found.");
            
        });
    });
};

exports.AnimeHasEpisodeNext = (episode_number, anime_slug) => {
    return new Promise((resolve, reject) => {
        const next_episode_number = episode_number + 1;
        Db.all(`SELECT * FROM animes_episodes WHERE anime_slug = ? AND episode_number = ?`, [anime_slug, next_episode_number], async function(err, rows) {
            if (err) reject(err);

            if (rows.length == 0) resolve(false);
                else resolve(true);
            
        });
    });
};

exports.AnimeHasEpisodePrevious = (episode_number, anime_slug) => {
    return new Promise((resolve, reject) => {
        const next_episode_number = episode_number - 1;
        Db.all(`SELECT * FROM animes_episodes WHERE anime_slug = ? AND episode_number = ?`, [anime_slug, next_episode_number], async function(err, rows) {
            if (err) reject(err);

            if (rows.length == 0) resolve(false);
                else resolve(true);
            
        });
    });
};