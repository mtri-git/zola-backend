const cloudinary2 = require('../configs/cloudinary2.config')
const MessageFile = require('../models/MessageFile')

const fs = require('fs')
const { promisify } = require('util')

const fileConfig = {

    imageConfig: {
        resource_type: 'image',
        folder: 'zola_files/images',
        format: 'jpg',
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
    }
}

const addNewMessageFile = async (path, type, myFormat, userId, roomId) => {
	try {
		const config = (type, _format) => {
			switch (type) {
				case 'image':
					if (_format !== 'gif') return fileConfig.imageConfig
					return fileConfig.otherConfig

				case 'video':
					return fileConfig.videoConfig
					break

				case 'audio':
					return fileConfig.audioConfig
					break

				case 'other':
					return fileConfig.otherConfig
					break

				default:
					return fileConfig.otherConfig
					break
			}
		}

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
		// console.log({ format, public_id ,resource_type, created_at, url })
		const messageFile = new MessageFile({
            roomId: roomId,
			sender: userId,
			public_id: public_id,
			resource_type: resource_type,
			format: format,
			url: url,
			created_at: created_at,
		})
		await messageFile.save()
		return messageFile
	} catch (error) {
		console.log('Add file: ', error.message)
		return { result: 'error' }
	}
}

const unlinkAsync = promisify(fs.unlink)

module.exports = { addNewMessageFile, unlinkAsync }
