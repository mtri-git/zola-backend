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

})

// get all notification
describe('Get all notification', () => {
    it('should return 200 OK', async () => {
        const response = await request(app)
            .get('/api/v1/notification')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
        expect(response.body).toBeDefined();
    })
})

// read all notification
describe('Read all notification', () => {
    it('should return 200 OK', async () => {
        const response = await request(app)
            .patch('/api/v1/notification/read-all')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
    })
})

// count unread notification
describe('Count unread notification', () => {
    it('should return 200 OK and number', async () => {
        const response = await request(app)
            .get('/api/v1/notification/count-unread')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
        expect(response.body.data).toBeDefined();
        // check type of data is int
        expect(typeof response.body.data).toBe('number');
    })
})