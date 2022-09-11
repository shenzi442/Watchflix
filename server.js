'use strict';

// module.exports = () => {
    const Express = require('express');
    const BodyParser = require('body-parser');
    const Path = require('path');
    const Cors = require('cors');
    const Morgan = require('morgan');

    const Database = require('./lib/database');

    const port = process.env.PORT || 443;
    const app = Express();

    app.set('view engine','ejs');
    app.set('trust proxy', true);  

    app.use(Cors());
    app.use(Morgan('dev'));
    app.use(BodyParser.urlencoded({extended:false}));
    app.use(Express.static(Path.join(__dirname, '/public')));

    app.get('/redirect', async (req, res) => {
        const redirect_url = req.query.url;
        res.redirect(redirect_url);
    });

    app.get('/', async (req, res) => {
        try {
            const animes_list = await Database.getAnimes(20);
            const movies_list = await Database.getMovies(20);

            res.render('pages/index', {
                title: "Watch movies and animes",
                animes_list: animes_list,
                movies_list: movies_list
            });
        } catch (err) {
            console.error(err);
        }
    });

    app.get('/anime/:anime_slug', async (req, res) => {
        try {
            const anime_slug = req.params.anime_slug;
            const Anime = await Database.getAnime(anime_slug);
            const Seasons = await Database.getAnimeSeasons(anime_slug);
            const episodes_list = await Database.getAnimeEpisodes(anime_slug);

            episodes_list.sort((a, b) => { // sort episodes in descending order (decroissant)
                if (a.episode_number > b.episode_number) return -1;
                    else return 1;
            });

            Seasons.sort((a, b) => { // sort seasons in descending order (decroissant)
                if (a.season_number > b.season_number) return -1;
                    else return 1;
            });

            // Render anime pages with episodes_list
            res.render('pages/anime', {
                title: `Watch ${Anime.title}`,
                Anime,
                Seasons,
                episodes_list
            });
        } catch (err) {
            res.status(404).render('pages/404', { request_url: req.url });
        }
    });

    app.get('/movie/:movie_slug', async (req, res) => {
        try {
            const movie_slug = req.params.movie_slug;
            const Movie = await Database.getMovie(movie_slug);
            

            if (Movie.trailers) {
                Movie.trailers = Movie.trailers.split(',');
            }
            
            console.log(Movie);
            // Render anime pages with episodes_list
            res.render('pages/movie', {
                title: `Watch ${Movie.title}`,
                Movie
            });
        } catch (err) {
            console.error(err);
            res.status(404).render('pages/404', { request_url: req.url });
        }
    });



    app.get('/watch/:slug', async (req, res) => {
        try {
            const slug = req.params.slug;
            let vostfr_sources = "", vf_sources = "";

            const typeOfVideo = await Database.getTypeOfVideo(slug);

            if (typeOfVideo === 'anime') {
                const Episode = await Database.getEpisode(slug);
                const Season = await Database.getAnimeSeason(Episode.season_number, Episode.anime_slug);

                let sources = [];
                if (Episode.vostfr_sources) {
                    vostfr_sources = Episode.vostfr_sources.split(',')
                    vostfr_sources.forEach(source => sources.push({source, display_type: "VOSTFR"}));
                }

                if (Episode.vf_sources) {
                    vf_sources = Episode.vf_sources.split(',');
                    vf_sources.forEach(source => sources.push({source, display_type: "VF"}));
                }

                const hasEpisodeNext = await Database.AnimeHasEpisodeNext(Episode.episode_number, Episode.anime_slug);
                const hasEpisodePrevious = await Database.AnimeHasEpisodePrevious(Episode.episode_number, Episode.anime_slug);

                // Render anime pages with episodes_list
                res.render('pages/watch_anime', {
                    title: `Watch ${Episode.anime_name}`,
                    Episode,
                    Season,
                    sources,
                    hasEpisodeNext,
                    hasEpisodePrevious
                });
            } else if (typeOfVideo === 'movie') {
                const Movie = await Database.getMovie(slug);

                let sources = [];
                if (Movie.vostfr_sources) {
                    vostfr_sources = Movie.vostfr_sources.split(',')
                    vostfr_sources.forEach(source => sources.push({source, display_type: "VOSTFR 🇯🇵🇫🇷"}));
                }

                if (Movie.vf_sources) {
                    vf_sources = Movie.vf_sources.split(',');
                    vf_sources.forEach(source => sources.push({source, display_type: "VF 🇫🇷"}));
                }

                // Render anime pages with episodes_list
                res.render('pages/watch_movie', {
                    title: `Watch ${Movie.title}`,
                    Movie,
                    sources
                });
            } 
        } catch (err) {
            console.error(err);
            res.status(404).render('pages/404', { request_url: req.url });
        }
    });

    app.get('/dmca', async (req, res) => {
        res.render('pages/dmca');
    });

    app.get('*', (req, res) => { // 404 Error
        res.status(404).render('pages/404', { request_url: req.url });
    });

    app.listen(port, () => console.log(`Server run at port ${port}`));
// }