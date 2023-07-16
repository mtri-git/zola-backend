const SearchHistory = require('../../models/SearchHistory')
const User = require('../../models/User')

class SearchHistoryController {
	async createSearchTextHistory(req, res) {
		try {
			const { keyword } = req.body
			//validate keyword
			if (!keyword)
				return res.status(400).json({ message: 'Keyword is required' })

			const searchHistory = new SearchHistory({
				searchText: keyword,
				user: req.user.id,
			})
			await searchHistory.save()
			res.status(200).json({ data: searchHistory })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error' })
		}
	}

	async createSearchUserHistory(req, res) {
		try {
			const { userId } = req.body

			//validate userId
			if (!User.exists({ _id: userId }))
				return res.status(400).json({ message: 'User not found' })

			// check if search user and user is the same
			if (userId === req.user.id)
				return res.status(200).json({ message: 'Search user and user should not the same' })
			
			// searchHistory has searchUser and user
			if(await SearchHistory.exists({searchUser: userId, user: req.user.id}))
				return res.status(200).json({ message: 'Search history already exists' })
			
			const searchHistory = new SearchHistory({
				searchUser: userId,
				user: req.user.id,
			})
			await searchHistory.save()
			res.status(200).json({ data: searchHistory })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error' })
		}
	}

	async getSearchTextHistory(req, res) {
		try {
			const searchHistory = await SearchHistory.find({
				user: req.user.id,
				searchText: { $exists: true },
			}).sort({ timestamp: -1 })
			.limit(10)
			return res.status(200).json({ data: searchHistory })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Error' })
		}
	}

	async getSearchUserHistory(req, res) {
		try {
			const searchHistory = await SearchHistory.find({
				user: req.user.id,
				searchUser: { $exists: true },
			})
			.sort({ timestamp: -1 })
				.limit(10)
				.populate('searchUser', 'fullname username avatarUrl')
			return res.status(200).json({ data: searchHistory })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}

	async deleteSearchHistory(req, res) {
		try {
			const { id } = req.params
			if (!id) return res.status(400).json({ message: 'Id is required' })
			const searchHistory = await SearchHistory.findOneAndDelete({
				_id: id,
				user: req.user.id,
			})
			if (!searchHistory)
				return res
					.status(400)
					.json({ message: 'Search history not found' })
			return res.status(200).json({ data: searchHistory })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}

	async recommendSearchText(req, res) {
		try {
			const { keyword } = req.query
			if (!keyword)
				return res.status(400).json({ message: 'Keyword is required' })
			// get all search history regex with keyword sort by count of its
			const searchHistory = await SearchHistory.aggregate([
				{
					$match: {
						searchText: { $exists: true },
						searchText: { $regex: keyword, $options: 'i' },
					},
				},
				{
					$group: {
						_id: '$searchText',
						count: { $sum: 1 },
					},
				},
				{
					$sort: { count: -1 },
				},
				{
					$limit: 10,
				},
			])

			return res.status(200).json({ data: searchHistory })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new SearchHistoryController()
