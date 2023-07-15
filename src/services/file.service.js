const cloudinary2 = require('../configs/cloudinary2.config')
const File = require('../models/File')

const fs = require('fs')
const { promisify } = require('util')

const fileConfig = {
	imageConfig: {
		resource_type: 'image',
		folder: 'zola_files/images',
	},

	videoConfig: {
		resource_type: 'video',
		folder: 'zola_files/videos',
	},

	audioConfig: {
		resource_type: 'video',
		folder: 'zola_files/audios',
	},

	otherConfig: {
		resource_type: 'auto',
		folder: 'zola_files/others',
	},
}

const config = (type, _format) => {
	switch (type) {
		case 'image':
			if (_format !== 'gif') return fileConfig.imageConfig
			return fileConfig.otherConfig

		case 'video':
			return fileConfig.videoConfig

		case 'audio':
			return fileConfig.audioConfig

		case 'other':
			return fileConfig.otherConfig

		default:
			return fileConfig.otherConfig
	}
}

const addNewFile = async (
	path,
	type,
	myFormat,
	userId,
	scope,
	isFromPost = false,
	postId
) => {
	try {
		

		const data = await cloudinary2.uploader
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
			post_id: postId,
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

const createFileByURL = async (owner_id ,post_id ,input_url, type) => {
	try {
		const data = await cloudinary2.uploader
		.upload(input_url)
		.then((result, error) => {
			return {
				result: result,
				error: error,
			}
		})

		const { format, public_id, resource_type, created_at, url } =
		data.result

		const file = await File.create({
			owner: owner_id,
			post_id: post_id,
			public_id: public_id,
			resource_type: resource_type,
			format: format,
			url: url,
			isPrivate: false,
			isFromPost: true,
			created_at: created_at,
		})
		return file
		
	} catch (error) {
		console.log(error.message)
		throw new Error(error.message)
	}
}

const unlinkAsync = promisify(fs.unlink)

module.exports = { addNewFile, unlinkAsync, createFileByURL }
