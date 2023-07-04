const Post = require('../../models/Post');

class HashtagController{
    async getTrendingHashtags(req, res){
        try {
            const data = await Post.aggregate([
                {$match: {deleted_at: null}},
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
    };
}

module.exports = new HashtagController();