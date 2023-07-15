const Post = require('../models/Post')
const File = require('../models/File')
const Comment = require('../models/Comment')

const getRecommendPost = async (userId, limit) => {
	try {
		// get last five post that user liked
		const lastFivePost = await Post.find({
			like_by: userId,
		}).limit(10).sort({created_at: -1})

		// get author of last five post but not me
		const author = lastFivePost.map((post) => post.author).filter((author) => author.toString() !== userId)
    console.log(author);

		// get the category of last five post
		const category = lastFivePost.map((post) => post.category_by_ai)

		// recommend post by author and category
		const recommendPost = await Post.aggregate([
            {
              $match: {
                category_by_ai: { $in: category },
                // author: { $in: author },
                author: { $ne: userId },
                deleted_at: null,
                like_by: { $ne: userId },
              },
            },
            {
              $addFields: {
                totalLike: { $size: "$like_by" },
                totalComment: { $size: "$comments" },
                isLike: { $in: [userId, "$like_by"] },
              },
            },
            {
              $sort: {
                totalLike: -1,
                totalComment: -1,
                created_at: -1,
              },
            },
            {
              $limit: limit,
            },
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorInfo",
              },
            },
            {
              $lookup: {
                from: "files",
                localField: "attach_files",
                foreignField: "_id",
                as: "attachments",
              },
            },
            {
                $project: {
                  "author.username": { $arrayElemAt: ["$authorInfo.username", 0] },
                  "author.fullname": { $arrayElemAt: ["$authorInfo.fullname", 0] },
                  "author.avatarUrl": { $arrayElemAt: ["$authorInfo.avatarUrl", 0] },
                  // "author.contact_info": { $arrayElemAt: ["$authorInfo.contact_info", 0] },
                  attach_files: {
                    $map: {
                      input: "$attachments",
                      as: "file",
                      in: {
                        id: "$$file._id",
                        url: "$$file.url",
                        resource_type: "$$file.resource_type",
                      },
                    },
                  },
                  // title: 1,
                  content: 1,
                  created_at: 1,
                  isLike: 1,
                  totalLike: 1,
                  totalComment: 1,

                },
            }
          ]);
		return recommendPost
	} catch (error) {
		console.log('Error: ', error)
		return []
	}
}

const softDeletePost = async (postId) => {
  try {
    const post = await Post.findByIdAndUpdate(postId, {
      deleted_at: Date.now(),
    })
    await Promise.all([
      File.updateMany(
        { _id: { $in: post.attach_files } },
        { deleted_at: Date.now() }
      ),
      Comment.updateMany(
        { postId: post._id },
        { deleted_at: Date.now() }
      )
    ])
    return post
  } catch (error) {
    console.log('Error: ', error)
    throw error
  }
}

module.exports = { getRecommendPost, softDeletePost }