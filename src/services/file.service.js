const cloudinary = require('../configs/cloudinary.config')
const File = require('../models/File')

const fs = require('fs')
const { promisify } = require('util')

const imageConfig = {
	resource_type: 'image',
	folder: 'zola_files/images',
	format: 'jpg',
}
const videoConfig = {
	resource_type: 'video',
	folder: 'zola_files/videos',
}
const audioConfig = {
	resource_type: 'video',
	folder: 'zola_files/audios',
}

const otherConfig = {
	resource_type: 'auto',
	folder: 'zola_files/others',
}

const addNewFile = async (path, type, myFormat, userId, scope, isFromPost = false) => {
	try {
		const config = (type, _format) => {
			switch (type) {
				case 'image':
					if (_format !== 'gif') return imageConfig
					return otherConfig

				case 'video':
					return videoConfig
					break

				case 'audio':
					return audioConfig
					break

				case 'other':
					return otherConfig
					break

				default:
					return otherConfig
					break
			}
		}

		const data = await cloudinary.uploader
			.upload(path, config(type, myFormat))
			.then((result, error) => {
				return {
					result: result,
					error: error,
				}
			})

		const { format, public_id, resource_type, created_at, url } =
			data.result
		const isPrivate = scope === 'private'
		// console.log({ format, public_id ,resource_type, created_at, url })
		const file = new File({
			owner: userId,
			public_id: public_id,
			resource_type: resource_type,
			format: format,
			url: url,
			isPrivate,
			isFromPost: isFromPost,
			created_at: created_at,
		})
		await file.save()
		return file
	} catch (error) {
		console.log('Add file: ', error.message)
		return { result: 'error' }
	}
}

const unlinkAsync = promisify(fs.unlink)

module.exports = { addNewFile, unlinkAsync }
