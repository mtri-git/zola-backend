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
			}).limit(10)
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
}

module.exports = new SearchHistoryController()
