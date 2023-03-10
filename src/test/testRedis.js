const cloudinary = require('cloudinary').v2

cloudinary.config({ 
    cloud_name: 'du3l8upse', 
    api_key: '256929831589464', 
    api_secret: 'vhrQ1XBtgnGSSws3MQX9roYQ3Ok',
    secure: true
  });

const run = async () => {
    try {
        const data = await cloudinary.uploader.upload("C:/Users/Tri/Downloads/Nhom02_FinalProject_Lan1.docx",
        {
            resource_type: "auto",
			folder: 'zola_files/others'
        })
        console.log(data)
        
    } catch (error) {
        console.log(error)
    }
}

run()

// const imageConfig = {
//     resource_type: 'image',
//     folder: 'zola_files/images',
// }
// const videoConfig = {
//     resource_type: 'video',
//     folder: 'zola_files/videos',
// }

// const config = {
//     image: imageConfig,
//     video: videoConfig
// }

// console.log(config['video'])