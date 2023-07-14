// create a simple test to check if the server is running
const request = require('supertest')
const app = require('../../app')

let accessToken
describe('Login to get the accessToken', () => {
	it('should return 200 OK', async () => {
		const response = await request(app)
			.post('/api/v1/auth/login')
			.send({ username: 'votri', password: '12345' })
			.expect(200)

		accessToken = response.body.token
		expect(response.body.token).toBeDefined()
	})
}),

describe('Create new comment', () => {

	let postId
	it('create a post to get PostId', async () => {
		const response = await request(app)
			.post('/api/v1/post/create')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				content: 'This is a test post #test',
                scope: 'public',
			})
			.expect(201)
		// expect(response.body.message).toBe("Post successfully")
		// postId = response.body.data["_id"] || "64b0f8a47fe22dd34976fcb6"
		console.log(response.body);
		postId = "64b0f8a47fe22dd34976fcb6"
	})

	let commentId
	it('should return 201 OK', async () => {
		const response = await request(app)
		.post('/api/v1/comment/create')
		.set('Authorization', `Bearer ${accessToken}`)
		.send({
			postId: postId,
			content: 'This is a test comment #test',
		})
		.expect(201)
		commentId = response.body.data._id
		expect(response.body.message).toBe("Add a comment successful")
	})

	describe('Reply a comment', () => {
		it('should return 201 OK', async () => {
			const response = await request(app)
			.post('/api/v1/comment/create')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				postId: postId,
				content: 'This is a test comment #test',
				parent_id: commentId
			})
			.expect(201)
			expect(response.body.message).toBe("Add a comment successful")
		})
	})
	
	describe('Get reply comment', () => {
		it('should return 200 OK', async () => {
			const response = await request(app)
			.get(`/comment/reply/64b0fa2cd9815e8d29af2c3c`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200)
			expect(response.body).toBeDefined();
		})
	})
	
	describe('Like or unlike a comment', () => {
		it('should return 200 OK', async () => {
			const response = await request(app)
			.put(`/api/v1/comment/${commentId}/like`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200)
		})
	})
	
	describe('GET Comment from post /api/post/:id', () => {
		it('should return 200 OK', async () => {
			const response = await request(app)
			.get(`/api/v1/post/${postId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);
		
		expect(response.body).toBeDefined();
	})});
	
})

