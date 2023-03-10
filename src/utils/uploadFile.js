const cloudinary = require('../../configs/cloudinary.config')

const uploadSingleFile = (path) =>
	cloudinary.uploader
		.upload(path, { folder: 'zola_files/images' })
		.then((error, result) => {
			return {
				result: result,
				error: error,
			}
		})

const uploadVideo = () =>
	cloudinary.uploader
		.upload('dog.mp4', {
			resource_type: 'video',
			folder: 'zola_files/images',
			public_id: 'myfolder/mysubfolder/dog_closeup',
			chunk_size: 6000000,
			eager: [
				{ width: 300, height: 300, crop: 'pad', audio_codec: 'none' },
				{
					width: 160,
					height: 100,
					crop: 'crop',
					gravity: 'south',
					audio_codec: 'none',
				},
			],
			eager_async: true,
			eager_notification_url:
				'https://mysite.example.com/notify_endpoint',
		})
		.then((error, result) => {
			return {
				result: result,
				error: error,
			}
		})

const uploadMultipleFile = (paths) => {
	Promise.all(
		paths.map((path) =>
			cloudinary.uploader
				.upload(path, { folder: 'zola_files/images' })
				.then((error, result) => {
					return {
						result: result,
						error: error,
					}
				})
		)
	)
}

module.exports = { uploadSingleFile, uploadVideo, uploadMultipleFile }
