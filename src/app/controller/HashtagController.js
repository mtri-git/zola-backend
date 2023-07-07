const e = require('express');
const Post = require('../../models/Post');

class HashtagController{
    async getTrendingHashtags(req, res){
        let {limit} = req.query;
        //if limit is not provided, set default limit to 10
        if(!limit) limit = 5;

        try {
            const data = await Post.aggregate([
                {$match: {deleted_at: null}},
                {$unwind: '$hashtag'},
                {$group: {_id: '$hashtag', count: {$sum: 1}}},
                {$sort: {count: -1}},
                {$limit: limit},
                {$project: {_id: 0, hashtag: '$_id', count: 1}}
            ]);
            return res.status(201).json({data});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Server error.'});
        }
    };

    async getTrendingByTheTime(req, res){
        try {
            const {filter} = req.query;
            let time
            
            switch (filter) {
                case 'day':
                    time = 1;
                    break;
                case 'week':
                    time = 7;
                case 'month':
                    time = 30;
                case 'year':
                    time = 365;
                default:
                    time = 1;
            }

            const data = await Post.aggregate([
                {$match: {deleted_at: null, created_at: {$gte: new Date(Date.now() - time * 24 * 60 * 60 * 1000)}}},
                {$unwind: '$hashtag'},
                {$group: {_id: '$hashtag', count: {$sum: 1}}},
                {$sort: {count: -1}},
                {$limit: 10},
                {$project: {_id: 0, hashtag: '$_id', count: 1}}
            ]);
            return res.status(201).json({data});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Server error.'});
        }
    }



}

module.exports = new HashtagController();